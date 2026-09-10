from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation
from app.models.message import Message


async def list_conversations(db: AsyncSession, user_id: str) -> List[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().unique().all())


async def create_conversation(
    db: AsyncSession,
    user_id: str,
    title: Optional[str] = None,
    course_id: Optional[str] = None,
    mode: str = "explain_simply",
) -> Conversation:
    conv = Conversation(
        user_id=user_id,
        title=title or "New Cranes Learning Session",
        course_id=course_id or "general",
        mode=mode,
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    # Load messages relationship
    result = await db.execute(select(Conversation).where(Conversation.id == conv.id).options(selectinload(Conversation.messages)))
    return result.scalar_one()


async def get_conversation(db: AsyncSession, conversation_id: str, user_id: str) -> Optional[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    conv = result.scalar_one_or_none()
    if conv is None:
        return None
    if conv.user_id != user_id:
        return None  # Treat as not found for isolation (caller will map to 404 or 403)
    return conv


async def get_conversation_any_owner(db: AsyncSession, conversation_id: str) -> Optional[Conversation]:
    """Fetch without user check - for internal verification of ownership."""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id).options(selectinload(Conversation.messages))
    )
    return result.scalar_one_or_none()


async def delete_conversation(db: AsyncSession, conversation_id: str, user_id: str) -> bool:
    conv = await get_conversation(db, conversation_id, user_id)
    if conv is None:
        # Check if exists but belongs to another user -> forbid
        any_conv = await get_conversation_any_owner(db, conversation_id)
        if any_conv is not None and any_conv.user_id != user_id:
            return False  # Signal forbidden vs not found via caller
        return False
    await db.delete(conv)
    await db.commit()
    return True


async def update_conversation_timestamp(db: AsyncSession, conversation: Conversation) -> None:
    conversation.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(conversation)
