from datetime import date
import logging
import os
from crewai import Agent, Task, Crew, LLM, Process
from dotenv import load_dotenv
from schemas import CrewOutput
from utils.state_manager import state_manager
from tools.schedule_meeting import ScheduleMeetingTool
from tools.get_meeting_preview import ScheduleMeetingPreviewTool
from utils.fetch_chat_history import FetchChatHistoryTool

load_dotenv()

def create_crew(question, thread_id: str = None):
    llm = LLM(model='azure/gpt4-o')
    hotel_agent = Agent(
        role='Teamspace Agent',
        goal=(
            "Answer the given question using your tools without modifying the question itself. Please make sure to follow the instructions in the task description. Do not perform any actions outside the scope of the task."
        ),
        backstory=(
            "You are the Meeting Assistant Agent for TeamSpace. You have access to a language model "
            "and a set of tools to help answer questions and assist with meeting scheduling."
        ),
        verbose=True,
        llm=llm,
        logging_level=logging.INFO,
        tools=[ScheduleMeetingTool(thread_id), ScheduleMeetingPreviewTool(thread_id)],
    )
    flow_state = state_manager.get_states_as_string(thread_id)
    chat_history_task = Task(
        description=
            f"""
            User message: {question}
            Current flow state: [{flow_state}]
            Current year: { date.today().isoformat() }

            # Message Aggregator Assistant

            You are a specialized assistant that creates concise, self-contained summaries of meeting scheduling requests.

            ## Available Tool
            - FetchChatHistoryTool

            ## Process
            1. Evaluate if you have sufficient context from the current message
            - If not, use FetchChatHistoryTool to retrieve conversation history

            2. Create a concise summary containing ALL:
            - Date. If only month provided, always use current year.
            - Topic
            - Start time
            - Duration
            - Time zone

            3. Important Guidelines:
            - DO NOT perform scheduling actions
            - Focus solely on creating a complete "handoff message"
            - Include ALL relevant details the Scheduling assistant will need
            - All IDs are integers
            - Omit pleasantries and unnecessary context

            4. Deliver only the final summarized message in your chat_response
            """
        ,
        agent=hotel_agent,
        expected_output=(
            "Well structured message that captures all crucial information (ids, dates, time topic, duration, etc.) "
        ),
    )
    agent_task = Task(
        description=
            f"""
            ** Current flow state: [{flow_state}] **
            ** Current year: { date.today().isoformat() } **

            # Meeting Scheduling Assistant

            ## Available Tools
            - ScheduleMeetingTool
            - ScheduleMeetingPreviewTool

            ## Critical Rules
            - Always check current flow_state before any action
            - Only invoke the ScheduleMeetingTool when flow_state includes "BOOKING_PREVIEW_INITIATED"
            - URLs belong only in tool_response, never in chat_response
            - Any exceptions coming from the tools should be formatted to nice message to user and presented in chat_response.

            ## Action Protocol

            ### 1. Booking Preview
            When the user wants to schedule a meeting:
            - Use ScheduleMeetingPreviewTool
            - If errors occur, revert and show the meeting preview details
            - Provide a summary of schedule_preview in the chat_response and ask for confirmation. Do not include URLs.
            - Use concise Markdown (lists, headings, bold) in the chat_response
            - Include authorization_url and schedule_preview in tool_response.

            ### 2. Booking Finalization
            When flow_state contains "BOOKING_PREVIEW_INITIATED" and "BOOKING_AUTHORIZED":
            - Wait for explicit user approval ("Yes, schedule it!")
            - Consider the user has approved the preview when the user message contains "SCHEDULE_MEETING"
            - Call ScheduleMeetingTool to schedule the meeting
            - If errors occur, revert to confirmation step
            - Summarize scheduling in chat_response
            - Use concise Markdown (lists, headings, bold) in the chat_response
            - Include authorization_url in tool_response

            ## Formatting Guidelines
            - Use concise Markdown (lists, headings, bold)
            - Keep all responses text-based (no images)
            - Minimize tool usage per step
            - Keep URLs in tool_response only
            - Do not include flow_state in chat_response
            """
        ,
        agent=hotel_agent,
        context=[chat_history_task],
        expected_output=f"The output should follow the schema below: {CrewOutput.model_json_schema()}.",
        memory=True,
        output_pydantic=CrewOutput
    )
    choreo_crew = Crew(
    agents=[hotel_agent],
    tasks=[chat_history_task, agent_task],
    process=Process.sequential
    )
    return choreo_crew.kickoff()
