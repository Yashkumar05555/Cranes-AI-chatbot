import math
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.ai.rag_interface import chunk_text
from app.core.config import get_settings


async def list_documents(db: AsyncSession) -> List[Document]:
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    return list(result.scalars().all())


async def get_document(db: AsyncSession, doc_id: str) -> Optional[Document]:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    return result.scalar_one_or_none()


async def create_document(
    db: AsyncSession,
    title: str,
    course_id: str,
    file_name: str,
    raw_text: str,
    description: Optional[str] = None,
    uploader_id: Optional[str] = None,
    storage_path: Optional[str] = None,
) -> Document:
    settings = get_settings()
    # Compute metadata
    file_size_kb = len(raw_text.encode("utf-8")) / 1024
    if file_size_kb < 1024:
        file_size = f"{file_size_kb:.1f} KB"
    else:
        file_size = f"{file_size_kb/1024:.1f} MB"
    pages_est = max(1, math.ceil(len(raw_text) / 1500))
    chunks = chunk_text(raw_text, settings.chunk_size, settings.chunk_overlap)
    chunk_count = len(chunks)

    # Auto-index if we have content (Phase 1: local ingestion)
    status = "indexed" if raw_text and chunk_count > 0 else "pending"
    # Simulate failure if empty
    if not raw_text.strip():
        status = "failed"

    doc = Document(
        title=title,
        course_id=course_id,
        file_name=file_name,
        file_size=file_size,
        status=status,
        pages=pages_est,
        description=description or "User-uploaded knowledge document for Cranes Varsity RAG corpus.",
        raw_text=raw_text,
        chunk_count=chunk_count,
        uploader_id=uploader_id,
        storage_path=storage_path,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def update_document_status(db: AsyncSession, doc: Document, status: str) -> Document:
    doc.status = status
    doc.updated_at = datetime.now(timezone.utc)
    if status == "indexed" and doc.raw_text:
        settings = get_settings()
        chunks = chunk_text(doc.raw_text, settings.chunk_size, settings.chunk_overlap)
        doc.chunk_count = len(chunks)
    await db.commit()
    await db.refresh(doc)
    return doc


async def delete_document(db: AsyncSession, doc_id: str) -> bool:
    doc = await get_document(db, doc_id)
    if doc is None:
        return False
    await db.delete(doc)
    await db.commit()
    return True


async def reindex_document(db: AsyncSession, doc_id: str) -> Optional[Document]:
    doc = await get_document(db, doc_id)
    if doc is None:
        return None
    return await update_document_status(db, doc, "indexed")
