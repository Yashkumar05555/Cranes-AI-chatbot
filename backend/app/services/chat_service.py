import logging
from typing import List, Dict, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.service import get_ai_service
from app.ai.rag_interface import SimpleRAGService
from app.ai.learning_modes import get_mode_directive
from app.core.config import get_settings
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.course import Course
from app.schemas.chat import ChatResponse, SourceCitation

logger = logging.getLogger(__name__)


async def _get_course_context(db: AsyncSession, course_id: str) -> str:
    if not course_id or course_id == "general":
        return "Active Subject Focus: General Cranes Varsity Inquiries & Admissions"
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if course:
        return f"Active Subject Focus: {course.title} ({course.code})\nCourse Context: {course.description}"
    return f"Active Subject Focus: {course_id}"


async def process_chat(
    db: AsyncSession,
    user_id: str,
    message: str,
    course_id: str = "general",
    mode: str = "explain_simply",
    conversation_id: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None,
) -> Tuple[ChatResponse, Conversation]:
    settings = get_settings()

    # 1. RAG retrieval
    rag = SimpleRAGService(db)
    retrieved = await rag.search(query=message, course_id=course_id, top_k=settings.top_k)

    sources = [
        SourceCitation(
            id=r["id"],
            docName=r["docName"],
            courseId=r["courseId"],
            courseName=r["courseName"],
            page=r["page"],
            chunkIndex=r["chunkIndex"],
            excerpt=r["excerpt"],
            similarity=r["similarity"],
        )
        for r in retrieved
    ]

    # 2. Mode directive
    mode_directive = get_mode_directive(mode)

    # 3. Course context
    course_context = await _get_course_context(db, course_id)

    # 4. RAG context text
    if retrieved:
        rag_context_text = "\n\n".join(
            f"[SOURCE {i+1}] Document: {r['docName']} (Page {r['page']}, Chunk {r['chunkIndex']}):\n{r['content']}"
            for i, r in enumerate(retrieved)
        )
    else:
        rag_context_text = "No specific document chunks matched this exact query. Answer using verified engineering knowledge regarding Cranes Varsity curriculum."

    system_instruction = (
        f"You are the official AI Learning Assistant & Chatbot for Cranes Varsity (cranesvarsity.com), "
        f"Bangalore's premier technical institute for Embedded Systems, VLSI Design, Automotive Systems (AUTOSAR), and IoT.\n\n"
        f"{course_context}\n\n{mode_directive}\n\n"
        f"OFFICIAL CRANES VARSITY KNOWLEDGE (RETRIEVED VIA RAG):\n{rag_context_text}\n\n"
        f"INSTRUCTIONS FOR YOUR RESPONSE:\n"
        f"1. Ground answers primarily on the retrieved Cranes Varsity knowledge base.\n"
        f"2. Cite sources when relevant (e.g. \"[Cranes_Varsity_Prospectus_2025_26.pdf, p. 3]\").\n"
        f"3. Maintain technical accuracy, format code with syntax highlighting, adhere to requested learning mode.\n"
        f"4. Keep tone encouraging, professional, for engineering learners."
    )

    # 5. Generate via AI service (provider-agnostic)
    ai_service = get_ai_service()
    try:
        generated_text = await ai_service.generate(
            message=message,
            system_instruction=system_instruction,
            history=history,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
        )
    except Exception as e:
        logger.warning(f"AI provider {ai_service.get_provider_name()} failed: {e}, falling back to mock")
        from app.ai.service import MockAIService
        mock = MockAIService()
        generated_text = await mock.generate(
            message=message,
            system_instruction=system_instruction,
            history=history,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
        )

    # 6. Conversation persistence
    conversation: Optional[Conversation] = None
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(Conversation.id == conversation_id).options(selectinload(Conversation.messages))
        )
        conv = result.scalar_one_or_none()
        # Verify ownership
        if conv and conv.user_id == user_id:
            conversation = conv

    if conversation is None:
        # Create new conversation
        title = message[:38] + ("..." if len(message) > 38 else "")
        conversation = Conversation(
            user_id=user_id,
            title=title,
            course_id=course_id,
            mode=mode,
        )
        db.add(conversation)
        await db.flush()  # to get id

    # Update conversation metadata
    conversation.course_id = course_id
    conversation.mode = mode
    # updated_at will auto-update via onupdate, but set explicitly
    from datetime import datetime, timezone
    conversation.updated_at = datetime.now(timezone.utc)

    # Save messages
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=message,
        mode=mode,
        course_id=course_id,
    )
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=generated_text,
        mode=mode,
        course_id=course_id,
        sources=[s.model_dump() for s in sources],
    )
    db.add_all([user_msg, assistant_msg])
    await db.commit()
    # Reload conversation with messages
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation.id).options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one()

    response = ChatResponse(
        response=generated_text,
        sources=sources,
        conversationId=conversation.id,
        mode=mode,
        courseId=course_id,
    )
    return response, conversation
