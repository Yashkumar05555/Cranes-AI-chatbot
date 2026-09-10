from datetime import datetime
from typing import List, Optional, Any

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: int  # unix ms for frontend compatibility
    mode: Optional[str] = None
    courseId: Optional[str] = None
    sources: Optional[List[Any]] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_message(cls, msg):
        # Convert DB datetime to timestamp ms
        ts = int(msg.created_at.timestamp() * 1000) if msg.created_at else 0
        return cls(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            timestamp=ts,
            mode=msg.mode,
            courseId=msg.course_id,
            sources=msg.sources,
        )


class ConversationCreate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=500)
    courseId: Optional[str] = Field(default="general", max_length=100)
    mode: Optional[str] = Field(default="explain_simply", max_length=50)


class ConversationResponse(BaseModel):
    id: str
    title: str
    courseId: str
    mode: str
    createdAt: int
    updatedAt: int
    messages: List[MessageResponse] = []

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_conversation(cls, conv, messages=None):
        created_ts = int(conv.created_at.timestamp() * 1000) if conv.created_at else 0
        updated_ts = int(conv.updated_at.timestamp() * 1000) if conv.updated_at else 0
        msgs = []
        if messages is not None:
            msgs = [MessageResponse.from_orm_message(m) for m in messages]
        elif hasattr(conv, "messages") and conv.messages is not None:
            msgs = [MessageResponse.from_orm_message(m) for m in conv.messages]
        return cls(
            id=conv.id,
            title=conv.title,
            courseId=conv.course_id or "general",
            mode=conv.mode or "explain_simply",
            createdAt=created_ts,
            updatedAt=updated_ts,
            messages=msgs,
        )


class ConversationListResponse(BaseModel):
    id: str
    title: str
    courseId: str
    mode: str
    createdAt: int
    updatedAt: int
    messages: List[MessageResponse] = []

    model_config = {"from_attributes": True}
