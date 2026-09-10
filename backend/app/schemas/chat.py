from typing import List, Optional, Any

from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    role: str = Field(pattern="^(user|assistant|system|model)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000, description="User message")
    conversationId: Optional[str] = Field(default=None, description="Existing conversation ID")
    courseId: Optional[str] = Field(default="general", max_length=100)
    mode: Optional[str] = Field(
        default="explain_simply",
        pattern="^(explain_simply|explain_detail|give_example|summarize|practical_app|quiz_me)$",
        description="Learning assistant mode",
    )
    history: Optional[List[ChatHistoryItem]] = Field(default=None, description="Recent conversation history for context")


class SourceCitation(BaseModel):
    id: str
    docName: str
    courseId: str
    courseName: str
    page: int
    chunkIndex: int
    excerpt: str
    similarity: float


class ChatResponse(BaseModel):
    response: str
    sources: List[SourceCitation] = []
    conversationId: str
    mode: str
    courseId: str
