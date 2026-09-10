from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_admin_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentResponse
from app.services.document_service import (
    list_documents,
    create_document,
    delete_document,
    reindex_document,
    get_document,
)
from app.services.course_service import get_course
from app.storage.local import get_storage_service

router = APIRouter()


@router.get("", response_model=List[DocumentResponse], summary="List documents (Admin)")
@router.get("/", response_model=List[DocumentResponse], summary="List documents (Admin)", include_in_schema=False)
async def list_admin_documents(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Allow an ADMIN to view document processing status.
    Possible statuses: pending, indexed, failed
    Admin-only.
    """
    docs = await list_documents(db)
    return [DocumentResponse.from_orm_document(d) for d in docs]


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED, summary="Upload a course document (Admin)")
@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED, summary="Upload a course document (Admin)", include_in_schema=False)
async def upload_document(
    payload: DocumentCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Allow an authenticated ADMIN to upload a course document.
    Validates input, course association, stores metadata & processing status.
    Flow: upload -> object storage (abstraction) -> async ingestion -> chunk -> embed -> vector DB
    Integrated via storage abstraction and RAG ingestion point.
    """
    # Validate course exists
    course = await get_course(db, payload.courseId)
    if course is None:
        raise HTTPException(status_code=400, detail=f"Course '{payload.courseId}' not found")

    # Store via storage abstraction (even for rawText, we simulate storage)
    storage = get_storage_service()
    storage_path = None
    try:
        content_bytes = payload.rawText.encode("utf-8")
        file_name = payload.fileName or f"{payload.title.lower().replace(' ', '_')}.pdf"
        storage_path = await storage.save(file_name=file_name, content=content_bytes, course_id=payload.courseId)
    except Exception:
        storage_path = None  # non-fatal

    doc = await create_document(
        db,
        title=payload.title,
        course_id=payload.courseId,
        file_name=payload.fileName or f"{payload.title.lower().replace(' ', '_')}.pdf",
        raw_text=payload.rawText,
        description=payload.description,
        uploader_id=current_user.id,
        storage_path=storage_path,
    )
    return DocumentResponse.from_orm_document(doc)


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED, summary="Upload document via file (Admin)")
async def upload_document_file(
    title: str = Form(...),
    courseId: str = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Alternative upload endpoint supporting multipart/form-data file upload.
    Validates file, course, stores securely via storage abstraction.
    """
    course = await get_course(db, courseId)
    if course is None:
        raise HTTPException(status_code=400, detail=f"Course '{courseId}' not found")

    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")
    allowed_ext = (".pdf", ".txt", ".md", ".docx", ".doc")
    if not any(file.filename.lower().endswith(ext) for ext in allowed_ext):
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(allowed_ext)}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    # Try to decode as text for RAG
    try:
        raw_text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            raw_text = content.decode("latin-1")
        except Exception:
            raw_text = f"[Binary file: {file.filename}, {len(content)} bytes - text extraction requires additional processing]"

    storage = get_storage_service()
    storage_path = await storage.save(file_name=file.filename, content=content, course_id=courseId)

    doc = await create_document(
        db,
        title=title,
        course_id=courseId,
        file_name=file.filename,
        raw_text=raw_text,
        description=description,
        uploader_id=current_user.id,
        storage_path=storage_path,
    )
    return DocumentResponse.from_orm_document(doc)


@router.delete("/{doc_id}", summary="Delete a document (Admin)")
async def delete_admin_document(
    doc_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await get_document(db, doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    # Clean storage
    if doc.storage_path:
        try:
            storage = get_storage_service()
            await storage.delete(doc.storage_path)
        except Exception:
            pass
    success = await delete_document(db, doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "id": doc_id}


@router.post("/{doc_id}/reindex", summary="Reindex a document (Admin)")
async def reindex_admin_document(
    doc_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await reindex_document(db, doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "id": doc_id, "status": doc.status, "chunkCount": doc.chunk_count}
