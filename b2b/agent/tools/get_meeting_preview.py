from datetime import date, datetime
import json
import os
from typing import Type, Optional, Union
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests
from utils.state_manager import state_manager
from utils.constants import FlowState, FrontendState
import tzlocal

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager

class ScheduleMeetingPreviewToolInput(BaseModel):
    """Input schema for ScheduleMeetingPreviewTool."""
    topic: str = Field(..., description="Topic of the meeting")
    date: str = Field(..., description="Date of the meeting in YYYY-MM-DD format")
    startTime: str = Field(..., description="Start time of the meeting in HH:MM format")
    duration: str = Field(..., description="Duration of the meeting in minutes")
    timeZone: str = Field(..., description="Time zone for the booking")


class ScheduleMeetingPreviewTool(BaseTool):
    name: str = "ScheduleMeetingPreviewTool"
    description: str = "Get meeting scheduling preview."
    args_schema: Type[BaseModel] = ScheduleMeetingPreviewToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, topic: str, date: str, startTime: str, duration: str, timeZone: str = None) -> str:
        try:

            if not topic:
                raise Exception("topic is required. If you don't have a topic, you can find them is the chat context or ask the user for the topic.")

            if not date:
                raise Exception("date is required. If you don't have a date, you can find them is the chat context or ask the user for the date.")

            if not startTime:
                raise Exception("startTime is required. If you don't have a startTime, you can find them is the chat context or ask the user for the startTime.")

            if not duration:
                raise Exception("duration is required. If you don't have a duration, you can find them is the chat context or ask the user for the duration.")

            # can calculate the current timezone
            if not timeZone:
                # Use the system's current timezone if not provided
                timeZone = str(tzlocal.get_localzone())

            user_id = asgardeo_manager.get_user_id_from_thread_id(self.thread_id)

            authorization_url = asgardeo_manager.get_authorization_url(self.thread_id, user_id, ["openid", "create_meeting"])

            schedule_preview = {
                "topic": topic,
                "date": date,
                "startTime": startTime,
                "duration": duration,
                "timeZone": timeZone
            }
            state_manager.add_state(self.thread_id, FlowState.BOOKING_PREVIEW_INITIATED)
            message = json.dumps(schedule_preview)+ " Please confirm the meeting schedule."
            response = Response(
                chat_response=message,
                tool_response={
                    "schedule_preview": schedule_preview,
                    "authorization_url": authorization_url
                }
            )
            return CrewOutput(response=response).model_dump_json()

        except Exception as e:
            print(f"Exception: {e}")
            error_response = Response(
                chat_response=f"{str(e)}",
                tool_response={},
            )
            return CrewOutput(response=error_response).model_dump_json()
