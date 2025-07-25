from datetime import date
import os
from typing import Type, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests
import logging

from schemas import CrewOutput, Response
from utils.state_manager import state_manager
from utils.asgardeo_manager import asgardeo_manager
from utils.constants import FlowState, FrontendState

class ScheduleMeetingToolInput(BaseModel):
    """Input schema for ScheduleMeetingTool."""
    topic: str = Field(..., description="Topic of the meeting")
    date: str = Field(..., description="Date of the meeting in YYYY-MM-DD format")
    startTime: str = Field(..., description="Start time of the meeting in HH:MM format")
    duration: str = Field(..., description="Duration of the meeting in minutes")
    timeZone: str = Field(..., description="Time zone for the booking")


class ScheduleMeetingTool(BaseTool):
    logging.info("Initializing ScheduleMeetingTool")
    name: str = "ScheduleMeetingTool"
    description: str = "Schedule a meeting for specified date, time and duration."
    args_schema: Type[BaseModel] = ScheduleMeetingToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, topic: str, date: str, startTime: str, duration: str, timeZone: str) -> str:
        try:

            if FlowState.BOOKING_PREVIEW_INITIATED not in state_manager.get_states(self.thread_id):
                raise Exception("Booking preview not completed")

            state_manager.add_state(self.thread_id, FlowState.BOOKING_PREVIEW_COMPLETED)
            state_manager.add_state(self.thread_id, FlowState.BOOKING_INITIATED)
            # Get access token
            user_id = asgardeo_manager.get_user_id_from_thread_id(self.thread_id)
            access_token = asgardeo_manager.get_user_token(user_id, ["openid", "create_meeting"])

            # Prepare the booking request
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            meeting_data = {
                "topic": topic,
                "date": date,
                "startTime": startTime,
                "duration": duration,
                "timeZone": timeZone
            }


            api_response = requests.post("http://localhost:9091/meetings", json=meeting_data, headers=headers)
            if (api_response.status_code == 201):
                meeting_details = api_response.json()
                response_dict = {
                    "meeting_id": meeting_details["id"]
                }
                message = f"Meeting successfully scheduled on {date} at {startTime}. Meeting ID: {response_dict['meeting_id']}"
                state_manager.add_state(self.thread_id, FlowState.BOOKING_COMPLETED)
                state_manager.clear_state(self.thread_id)
            else:
                response_dict = {
                    "error": api_response.json().get("detail", "Meeting scheduling failed"),
                    "status": "failed"
                }
                message = f"Failed to schedule meeting: {response_dict['error']}"
                state_manager.add_state(self.thread_id, FlowState.BOOKING_PREVIEW_INITIATED)
            response = Response(
                chat_response=message,
                tool_response={
                    "meeting_details": response_dict,
                }
            )
            return CrewOutput(response=response).model_dump_json()

        except Exception as e:
            error_response = Response(
                chat_response=f"An error occurred while scheduling the meeting: {str(e)}",
                tool_response={"error": str(e), "status": "error"}
            )
            return CrewOutput(response=error_response).model_dump_json()
