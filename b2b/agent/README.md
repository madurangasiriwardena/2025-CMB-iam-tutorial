# AI Chat Agent Backend

This is a Python FastAPI backend for an AI chat agent. It exposes a `/chat` endpoint that accepts chat messages, forwards them to OpenAI (with function/tool calling enabled), and handles tool calls for scheduling meetings by invoking the meeting-service API.

## Features
- `/chat` endpoint for chat messages
- OpenAI integration with function/tool calling
- Extensible tool system (start with meeting scheduling)

## Running the server

```bash
uvicorn main:app --reload
```

## Requirements
- Python 3.10+
- fastapi, uvicorn, openai, httpx

## Adding Tools
Add new tool functions in `tools/` and register them in `main.py`.

## Setup Instructions

1. Create a virtual environment (recommended):
   ```bash
   python3.10 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure you are using Python 3.10 or newer.
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
