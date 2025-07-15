"use client"
import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { ChatComponent } from "./chat-component"
import { StatusPanel } from "./status-panel"
import { useStateStore } from "./state-store"

export default function ChatButton() {

  const [isOpen, setIsOpen] = useState(false)
  const { currentState, isStatusPanelVisible, toggleStatusPanel } = useStateStore()

  // Only show status if there's actual state information
  const hasStateInfo = currentState && currentState.length > 0

  // For debugging log
  useEffect(() => {
    console.log("ChatButton: status panel conditions:", {
      isOpen,
      isStatusPanelVisible,
      hasStateInfo,
      currentState,
      shouldShowPanel: isOpen && isStatusPanelVisible && hasStateInfo
    });
  }, [isOpen, isStatusPanelVisible, currentState, hasStateInfo]);

  // Open chat button handler
  const handleOpenChat = () => {
    console.log("Opening chat, current state:", { hasStateInfo, currentState });
    setIsOpen(true);

    // If there's state info, automatically show the status panel
    if (hasStateInfo) {
      console.log("Automatically showing status panel because state info exists");
      toggleStatusPanel(true);
    }
  };

  return (
    <>
      {/* Chat toggle button - only visible when chat is closed */}
      {!isOpen && (
        <button
          type="button"
          style={{ position: 'fixed', zIndex: 9999, background: 'red', bottom: 16, right: 16 }}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          onClick={handleOpenChat}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat and status panel container */}
      {isOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-end pb-4">
          {/* Semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false)
              toggleStatusPanel(false)
            }}
          />

          {/* Content container with floating cards */}
          <div className="relative z-40 flex gap-4 h-[90vh] max-h-[calc(100vh-4rem)] mr-4">
            {/* Status panel - shown when isStatusPanelVisible is true and there's state information */}
            {(isStatusPanelVisible && hasStateInfo) && (
              <div className="w-[35vw] h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100">
                <div className="h-full flex flex-col">
                  {/* Status panel header with close button */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                    <h2 className="text-sm font-medium">Explanation</h2>
                    <button
                      type="button"
                      className="text-gray-50 bg-gray-100 rounded px-2 py-1 flex items-center"
                      onClick={() => toggleStatusPanel(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close status panel</span>
                    </button>
                  </div>
                  <StatusPanel />
                </div>
              </div>
            )}

            {/* Chat panel - fixed width */}
            <div className="w-[35vw] h-[calc(100vh-100px)] flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100">
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full text-black hover:text-white bg-white hover:bg-orange-500 flex items-center justify-center"
                  style={{position: "absolute", top: "-25px", right: "-25px"}}
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 " />
                </button>
              </div>
              <ChatComponent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

