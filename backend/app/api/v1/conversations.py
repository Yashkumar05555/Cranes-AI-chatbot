from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.conversation import ConversationCreate, ConversationResponse
from app.services.conversation_service import (
    list_conversations,
    create_conversation,
    get_conversation,
    get_conversation_any_owner,
    delete_conversation,
)

router = APIRouter()


@router.get("", response_model=List[ConversationResponse], summary="List user's conversations")
@router.get("/", response_model=List[ConversationResponse], summary="List user's conversations", include_in_schema=False)
async def list_user_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List conversations belonging ONLY to the authenticated user.
    User isolation enforced - never returns another user's data.
    """
    convs = await list_conversations(db, current_user.id)
    return [ConversationResponse.from_orm_conversation(c) for c in convs]


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED, summary="Create a new conversation")
@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED, summary="Create a new conversation", include_in_schema=False)
async def create_new_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new conversation associated with the authenticated user.
    Stores user, title, course association, timestamps.
    """
    conv = await create_conversation(
        db,
        user_id=current_user.id,
        title=payload.title,
        course_id=payload.courseId,
        mode=payload.mode or "explain_simply",
    )
    return ConversationResponse.from_orm_conversation(conv)


@router.get("/{conversation_id}", response_model=ConversationResponse, summary="Get conversation with messages")
async def get_conversation_detail(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return a conversation and its message history.
    Owner-only - returns 403/404 if unauthorized or not found.
    """
    # Check ownership first
    any_conv = await get_conversation_any_owner(db, conversation_id)
    if any_conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if any_conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied - conversation belongs to another user")

    conv = await get_conversation(db, conversation_id, current_user.id)
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationResponse.from_orm_conversation(conv)


@router.delete("/{conversation_id}", summary="Delete a conversation")
async def delete_conversation_endpoint(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a user's conversation. Owner-only.
    Returns 403 if attempting to delete another user's conversation.
    """
    any_conv = await get_conversation_any_owner(db, conversation_id)
    if any_conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if any_conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied - cannot delete another user's conversation")

    success = await delete_conversation(db, conversation_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True, "id": conversation_id}
