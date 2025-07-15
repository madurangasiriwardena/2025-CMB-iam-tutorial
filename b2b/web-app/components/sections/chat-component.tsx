"use client"
import { useState, FormEvent, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { LoadingIndicator } from "./chat/loading-indicator"
import { SchedulingConfirmationCard } from "./chat/booking-confirmation-card"
import { MarkdownRenderer } from "./chat/markdown-renderer"
import { Send } from "lucide-react"
import { useStateStore } from "./state-store"
import { Info } from "lucide-react"

type MeetingPreview = {
    topic: string
    date: string
    startTime: string
    duration: string
    timeZone: string
}

type MeetingDetails = {
    meeting_id: string
}

type Response = {
    chat_response: string
    tool_response: {
        authorization_url?: string
        BookingDetails?: MeetingPreview
        booking_details?: MeetingDetails
        booking_preview?: {
            meeting_id: string
        }
    }
}

type AgentMessage = {
    id: string
    response: Response
    frontend_state: string
    message_states: string[]
}

type Message = {
    id: string
    content: string
    isUser: boolean
    isLoading?: boolean
    loadingAction?: 'searching' | 'booking' | 'default'
    toolResponse?: AgentMessage
}

function StateInfoButton({ threadId, messageStates }: { threadId: string, messageStates: string[] }) {
    const { setThreadId, setState, toggleStatusPanel, isStatusPanelVisible, currentThreadId } = useStateStore();

    // Debug effect to track state changes
    useEffect(() => {
        console.log("StateInfoButton state:", { threadId, currentThreadId, isStatusPanelVisible, messageStates });
    }, [threadId, currentThreadId, isStatusPanelVisible, messageStates]);

    const handleInfoClick = () => {
        console.log("Show Status clicked - before:", {
            currentThreadId: threadId,
            isStatusPanelVisible,
            messageStates
        });

        // Set the thread ID and state directly from the message
        setThreadId(threadId);
        setState(messageStates || []); // Ensure we pass an array even if messageStates is undefined
        toggleStatusPanel(true);

        console.log("Show Status clicked - after:", {
            currentThreadId: threadId,
            isStatusPanelVisible,
            messageStates
        });
    };

    return (
        <button
            onClick={handleInfoClick}
            className="flex items-center text-gray-400 hover:text-orange-500 transition-colors text-xs mt-2"
        >
            <Info className="h-3.5 w-3.5 mr-1" />
            <span>Explanation</span>
        </button>
    );
}

export function ChatComponent() {
    const { data: session } = useSession()
    const [threadId] = useState<string>(Date.now().toString())
    const [messages, setMessages] = useState<Message[]>([
        {
            id: Date.now().toString(),
            content: `Hello ${session?.user?.username || 'there'} ! How can I help you today?`,
            isUser: false,
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [showCalendarWidget, setShowCalendarWidget] = useState<boolean>(true)
    const [showPreviewConfirmWidget, setShowPreviewConfirmWidget] = useState<boolean>(true)
    const { setThreadId: setGlobalThreadId } = useStateStore()

    // Set the thread ID in the global state store on mount
    useEffect(() => {
        console.log("Setting global thread ID:", threadId);
        setGlobalThreadId(threadId);
    }, [threadId, setGlobalThreadId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            isUser: true,
        }

        const loadingMessage: Message = {
            id: 'loading',
            content: '',
            isUser: false,
            isLoading: true,
            loadingAction: 'default'
        }

        setMessages((prev) => [...prev, userMessage, loadingMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch(`http://localhost:8000/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    message: input,
                    threadId: threadId
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const agentMessage = await response.json() as AgentMessage

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: agentMessage.response.chat_response,
                isUser: false,
                toolResponse: agentMessage
            }

            setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))
        } catch (error) {
            console.error("Error sending message:", error)
            setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
                id: Date.now().toString(),
                content: "Sorry, I couldn't process your message. Please try again.",
                isUser: false
            }))
        } finally {
            setIsLoading(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBookConfirmationRetry = async (room: any) => {
        const bookingMessage = `Ok i am ok with booking details you provide. Lets book the room id : ${room.room_id} at hotel id : ${room.hotel_id} from ${room.check_in} to ${room.check_out}.`;

        const loadingMessage: Message = {
            id: 'loading',
            content: '',
            isUser: false,
            isLoading: true,
            loadingAction: 'booking'
        }

        setMessages((prev) => [...prev, loadingMessage])
        setIsLoading(true)

        try {
            const response = await fetch(`http://localhost:8000/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    message: bookingMessage,
                    threadId: threadId
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const agentMessage = await response.json() as AgentMessage

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: agentMessage.response.chat_response,
                isUser: false,
                toolResponse: agentMessage
            }

            setShowPreviewConfirmWidget(false)

            setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))
        } catch (error) {
            console.error("Error booking room:", error)
            setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
                id: Date.now().toString(),
                content: "Sorry, I couldn't process your booking request. Please try again.",
                isUser: false
            }))
        } finally {
            setIsLoading(false)
        }
    }

    const renderToolResponse = (msg: AgentMessage) => {
        if (msg.response.tool_response?.authorization_url && !msg.response.tool_response.authorization_url.includes('calendar')) {
            return (
                showPreviewConfirmWidget &&
                <SchedulingConfirmationCard
                    threadId={threadId}
                    authorizationUrl={msg.response.tool_response.authorization_url}
                    onContinueBooking={() => {
                        if (msg.response.tool_response.booking_preview) {
                            handleBookConfirmationRetry(
                                msg.response.tool_response.booking_preview
                            )
                        }
                    }}
                />
            )
        }
        return null
    }

    return process.env.NEXT_PUBLIC_USE_EXTERNAL_HOTEL_AGENT_CHAT === "true" ? (
        <iframe className="flex flex-col h-full w-full bg-gray-50" src={ process.env.NEXT_PUBLIC_CHAT_WIDGET_URL }></iframe>
    ) : (
        // <div className="flex flex-col h-full w-full bg-gray-50"></div>
        <div style={{
            width: 400,
            height: 500,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
        }}>
            <div className="flex flex-row items-center justify-center gap-3 px-4 py-3 border-b font-sans font-semibold shadow-sm bg-white">
                <div className="flex items-center gap-2">
                    <span>Teamspace Agent</span>
                </div>
            </div>

            <div className="flex-1 p-4" style={{ overflowY: 'auto' }}>
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isUser ? "flex-row-reverse" : ""} gap-3 items-end`}
                        >
                            {!msg.isUser && (
                                <img src="https://ui-avatars.com/api/?name=AI&background=E0E1E2&color=333&size=32" alt="AI" className="w-7 h-7 rounded-full mr-2" />
                            )}
                            <div
                                className={`${
                                    msg.isUser
                                        ? "rounded-l-xl rounded-tr-xl bg-orange-500 text-white"
                                        : "rounded-r-xl rounded-tl-xl bg-white border border-gray-200"
                                } p-3 max-w-[80%]`}
                            >
                                {msg.isLoading ? (
                                    <LoadingIndicator action={msg.loadingAction} />
                                ) : (
                                    <>
                                        {msg.isUser ? (
                                            <p className="text-sm">{msg.content}</p>
                                        ) : (
                                            <div className="text-sm text-gray-800">
                                                <MarkdownRenderer content={msg.content} />
                                            </div>
                                        )}
                                        {!msg.isUser && msg.toolResponse && renderToolResponse(msg.toolResponse)}
                                    </>
                                )}

                                {!msg.isUser && !msg.isLoading && msg.toolResponse && (
                                    <div className="flex justify-end mt-1">
                                        <StateInfoButton
                                            threadId={threadId}
                                            messageStates={msg.toolResponse.message_states || []}
                                        />
                                    </div>
                                )}
                            </div>
                            {msg.isUser && (
                                <img src="https://ui-avatars.com/api/?name=User&background=4F40EE&color=fff&size=32" alt="User" className="w-7 h-7 rounded-full ml-2" />
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-3 border-t mt-auto bg-white">
                <div className="flex flex-col w-full gap-2 items-center max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 border-gray-300 focus-visible:ring-orange-500 rounded-md h-10"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-full shrink-0 bg-orange-500 hover:bg-orange-600 h-10 w-10 shadow-none flex items-center justify-center"
                            style={{ border: 'none', outline: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </button>
                    </form>
                    <div>
                        <p className="text-[10px] text-gray-500 text-center">
                            Agent can make mistakes. Always verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
