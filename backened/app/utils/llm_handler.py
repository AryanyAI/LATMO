import asyncio
import logging
import json
from concurrent.futures import ThreadPoolExecutor
from app.llm.main import (
    top_level_agent,
    get_current_datetime,
    lazy_gmail_toolkit,
    local_rag_tool,
    google_calendar_toolkit,
    table_data,
)

# Configure logging
logger = logging.getLogger(__name__)
executor = ThreadPoolExecutor(max_workers=5)  # Control parallel tasks

# Register tools
TOOLS = {
    "gmail": lazy_gmail_toolkit,
    "calendar": google_calendar_toolkit,
    "search": local_rag_tool,
    "table": table_data,
}

async def get_llm_response(message: str) -> str:
    """
    Main function to process LLM requests & handle tool execution.
    """
    logger.info(f"Received user message: {message}")

    # Append timestamp for better context
    message_with_time = f"{message} (Current time: {get_current_datetime()})"

    for attempt in range(3):  # Retry mechanism (max 3 times)
        response = await process_top_level_agent(message_with_time)

        # ✅ Ensure response is valid before returning
        if response and "Invalid or incomplete response" not in response:
            return response
        else:
            logger.warning(f"Invalid response detected, retrying ({attempt+1}/3)...")

    return "Sorry, I couldn't generate a valid response. Please try again."

async def process_top_level_agent(message: str) -> str:
    """
    Runs the top-level agent asynchronously, ensuring JSON and tool execution is handled correctly.
    """
    try:
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(executor, top_level_agent.run, message)

        if not response:
            return "Error: Empty response from LLM."

        # ✅ Fix response format issues
        response = fix_response_format(response)

        # ✅ If the response includes a tool request, execute it
        tool_result = await execute_tool_if_needed(response)
        if tool_result:
            return tool_result  # Return tool execution result instead

        return response
    except Exception as e:
        logger.error(f"Error processing LLM response: {str(e)}")
        return "There was an error processing your request."

async def execute_tool_if_needed(response: str) -> str:
    """
    If the LLM suggests a tool action (like Gmail), execute it & return the result.
    """
    try:
        json_data = extract_json_from_response(response)

        if not json_data or "action" not in json_data or "action_input" not in json_data:
            return None  # No tool action detected

        tool_name = json_data["action"]
        tool_input = json_data["action_input"]

        if tool_name in TOOLS:
            tool = TOOLS[tool_name]
            result = await asyncio.get_running_loop().run_in_executor(executor, tool.run, tool_input)
            return f"✅ Tool executed: {result}"

    except Exception as e:
        logger.error(f"Error executing tool: {str(e)}")

    return None  # No tool execution was performed

def extract_json_from_response(response: str) -> dict:
    """
    Extracts JSON data from an LLM response.
    """
    try:
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1

        if start_idx == -1 or end_idx == -1:
            return None  # No JSON found

        json_str = response[start_idx:end_idx]
        return json.loads(json_str)  # Convert to dictionary
    except json.JSONDecodeError:
        return None  # Invalid JSON

def fix_response_format(response: str) -> str:
    """
    Ensures response is correctly formatted.
    """
    try:
        # Fix Gmail message formatting (replace newlines for JSON)
        response = response.replace("\n", "\\n")

        # Remove any parsing failures
        if "Observation: Invalid" in response:
            response = "I'm sorry, but I couldn't process that request."

        return response
    except Exception as e:
        logger.error(f"Error fixing response format: {str(e)}")
        return response  # Return original response if error occurs
