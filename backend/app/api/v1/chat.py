from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import process_chat

router = APIRouter()


@router.post("", response_model=ChatResponse, summary="Send a message and receive AI response")
@router.post("/", response_model=ChatResponse, summary="Send a message and receive AI response", include_in_schema=False)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a user message and receive an AI response.

    Supports:
    - General Chat (courseId='general' or omitted)
    - Course-Based Chat (courseId set)
    - Conversation context (conversationId, history)
    - Learning Assistant modes (6 modes via `mode` field)
    - RAG integration (sources returned when course docs matched)
    - Grounded responses with source citations

    Provider-agnostic: AI implementation injected via AIService interface.
    """
    history_dicts = None
    if payload.history:
        history_dicts = [{"role": h.role, "content": h.content} for h in payload.history]

    response, _ = await process_chat(
        db=db,
        user_id=current_user.id,
        message=payload.message,
        course_id=payload.courseId or "general",
        mode=payload.mode or "explain_simply",
        conversation_id=payload.conversationId,
        history=history_dicts,
    )
    return response
