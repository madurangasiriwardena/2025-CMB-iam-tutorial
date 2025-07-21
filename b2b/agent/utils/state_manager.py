from dataclasses import dataclass, field
from typing import List, Dict
from enum import Enum
import logging

from utils.constants import FlowState

@dataclass
class FlowStates:
    states: List[FlowState] = field(default_factory=list)

    def add_state(self, state: FlowState) -> None:
        """Add a state to the list of states."""
        self.states.append(state)

    def get_states(self) -> List[FlowState]:
        """Return the list of states."""
        return self.states

    def get_states_as_string(self) -> str:
        """Return the states as a formatted string."""
        return " ".join(state.name for state in self.states)

class StateManager:
    def __init__(self) -> None:
        """Initialize the StateManager with an empty dictionary for thread states."""
        self.thread_states: Dict[int, FlowStates] = {}
        self.message_states: Dict[int, FlowStates] = {}
        self.flow_state1: Dict[int, FlowState] = {}

    def add_state(self, thread_id: int, state: FlowState) -> None:
        """Add a state to the flow states for a specific thread."""
        if thread_id not in self.thread_states:
            self.thread_states[thread_id] = FlowStates()
            self.message_states[thread_id] = FlowStates()
        self.thread_states[thread_id].add_state(state)
        self.message_states[thread_id].add_state(state)

    def set_flow_status(self, thread_id: int, state: FlowState) -> None:
        self.flow_state1[thread_id] = state

    def get_flow_status(self, thread_id: int) -> FlowState:
        logging.info(f"Get state for thread id: {thread_id}")
        if thread_id in self.flow_state1:
            return self.flow_state1[thread_id]
        return None

    def get_states(self, thread_id: int) -> List[FlowState]:
        """Return the list of states for a specific thread."""
        if thread_id in self.thread_states:
            return self.thread_states[thread_id].get_states()
        return []

    def get_states_as_string(self, thread_id: int) -> str:
        """Return the states as a formatted string for a specific thread."""
        if thread_id in self.thread_states:
            return self.thread_states[thread_id].get_states_as_string()
        return ""

    def get_message_states(self, thread_id: int) -> List[FlowState]:
        """Return the list of states for a specific message."""
        if thread_id in self.thread_states:
            return self.thread_states[thread_id].get_states()
        return []

    def clear_message_states(self, thread_id: int) -> None:
        """Clear the message states for a specific thread."""
        if thread_id in self.message_states:
            self.message_states[thread_id].states = []

# Single instance for application-wide use
state_manager = StateManager()
