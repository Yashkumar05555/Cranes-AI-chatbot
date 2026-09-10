from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    courseId: str = Field(min_length=1, max_length=100)
    fileName: Optional[str] = Field(default=None, max_length=500)
    rawText: str = Field(min_length=1, description="Document text content")
    description: Optional[str] = Field(default=None, max_length=2000)


class DocumentResponse(BaseModel):
    id: str
    title: str
    courseId: str
    fileName: str
    fileSize: str
    status: str  # pending | indexed | failed
    pages: int
    uploadDate: str
    description: Optional[str] = None
    chunkCount: Optional[int] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_document(cls, doc):
        upload_date = doc.created_at.strftime("%Y-%m-%d") if doc.created_at else ""
        return cls(
            id=doc.id,
            title=doc.title,
            courseId=doc.course_id,
            fileName=doc.file_name,
            fileSize=doc.file_size,
            status=doc.status,
            pages=doc.pages,
            uploadDate=upload_date,
            description=doc.description,
            chunkCount=doc.chunk_count,
        )


class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    chunkCount: int
    pages: int
