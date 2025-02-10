from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.utils.auth import get_current_user
from app.utils.llm_handler import get_llm_response
from app.models.user import User

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/send_message", response_model=ChatResponse)
async def send_message(chat: ChatMessage, current_user: User = Depends(get_current_user)):
    try:
        response =await get_llm_response(chat.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))