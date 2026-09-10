import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.database import init_db, Base, engine
from app.api.v1 import auth, chat, conversations, courses, admin_documents

# Import models so Base.metadata includes them for create_all
from app.models import user, course, conversation, message, document  # noqa: F401

settings = get_settings()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        # Seed courses
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.db.database import AsyncSessionLocal
        from app.services.course_service import ensure_seed_courses
        async with AsyncSessionLocal() as session:
            await ensure_seed_courses(session)
            # Seed initial documents for RAG if none exist
            from sqlalchemy import select
            from app.models.document import Document
            from app.services.course_service import SEED_COURSES
            result = await session.execute(select(Document))
            if not result.scalars().first():
                # Seed from legacy knowledgeData - mirror server/knowledgeData.ts initial docs
                # Minimal seed for RAG grounding
                seed_docs = [
                    {
                        "title": "Cranes Varsity Institute Prospectus & Placement Record (2025-26)",
                        "course_id": "general",
                        "file_name": "Cranes_Varsity_Prospectus_2025_26.pdf",
                        "raw_text": (
                            "Cranes Varsity - Pioneers in Technical Education Since 1996. "
                            "Bangalore Rajajinagar & Jayanagar. 28+ years, 50,000+ engineers trained, 2000+ hiring partners "
                            "(Qualcomm, Intel, Texas Instruments, AMD, Bosch, Continental). "
                            "100% placement support. Labs: STM32F4, Xilinx FPGA, CANoe. "
                            "Eligibility: B.E/B.Tech ECE/EEE/CSE, 60% aggregate. Batches 1st & 3rd Monday monthly."
                        ),
                        "description": "Official prospectus, admissions, placements",
                        "pages": 28,
                    },
                    {
                        "title": "Embedded Systems Design PG Diploma Curriculum & Technical Manual",
                        "course_id": "embedded_systems",
                        "file_name": "Embedded_Systems_Curriculum_Manual.pdf",
                        "raw_text": (
                            "MODULE 1: Embedded C - volatile qualifier prevents optimization, Memory: Text/Data/BSS/Heap/Stack, "
                            "Bitwise REG|= (1<<n). Circular buffers. "
                            "MODULE 2: ARM Cortex-M4 32-bit RISC ARMv7-M, NVIC 240 interrupts, MMIO, RCC. "
                            "MODULE 3: UART async, SPI MOSI/MISO/SCK/CS CPOL/CPHA, I2C SDA/SCL pull-ups, CAN. "
                            "MODULE 4: FreeRTOS tasks Running/Ready/Blocked/Suspended, queues/semaphores/mutexes, "
                            "Priority inversion solved by priority inheritance."
                        ),
                        "description": "Embedded curriculum manual",
                        "pages": 42,
                    },
                    {
                        "title": "Advanced VLSI Verification & SystemVerilog UVM Handbook",
                        "course_id": "vlsi_design",
                        "file_name": "VLSI_Verification_UVM_Handbook.pdf",
                        "raw_text": (
                            "Verilog HDL blocking vs non-blocking, FSM Moore vs Mealy. "
                            "SystemVerilog OOP classes inheritance, rand/randc constraints, covergroup, SVA |-> |=>. "
                            "UVM hierarchy: Sequence Item, Sequence, Sequencer, Driver, Monitor, Scoreboard, Agent, Env, Test. "
                            "Phases: Build, Connect, Run. TLM ports. FPGA synthesis, STA, CDC 2-FF synchronizer."
                        ),
                        "description": "VLSI UVM handbook",
                        "pages": 36,
                    },
                    {
                        "title": "Automotive Embedded Systems, AUTOSAR & ISO 26262",
                        "course_id": "automotive_embedded",
                        "file_name": "Automotive_AUTOSAR_ISO26262_Spec.pdf",
                        "raw_text": (
                            "AUTOSAR Classic 3 layers: Application SWCs, RTE VFB (Rte_Read/Write), BSW (Services, ECU Abstr, MCAL, CDD). "
                            "CAN broadcast arbitration ID priority dominant 0, CAN-FD 64 bytes. LIN 19.2kbps. "
                            "UDS ISO 14229 services 0x10, 0x22, 0x27 seed&key, 0x34/0x36/0x37 flashing. "
                            "ISO 26262 HARA ASIL QM/A/B/C/D based on Severity, Exposure, Controllability."
                        ),
                        "description": "AUTOSAR spec",
                        "pages": 32,
                    },
                ]
                from app.services.document_service import create_document
                for sd in seed_docs:
                    # Check duplicate by file_name
                    from sqlalchemy import select as sel
                    existing = await session.execute(sel(Document).where(Document.file_name == sd["file_name"]))
                    if not existing.scalar_one_or_none():
                        await create_document(
                            session,
                            title=sd["title"],
                            course_id=sd["course_id"],
                            file_name=sd["file_name"],
                            raw_text=sd["raw_text"],
                            description=sd["description"],
                        )
                # Also ensure all seed courses exist (already via ensure_seed_courses)
                logger.info("Seeded initial RAG documents")
    except Exception as e:
        logger.warning(f"Startup init_db failed: {e}")

    yield
    # Shutdown: dispose engine
    await engine.dispose()


app = FastAPI(
    title="Cranes AI Chatbot - CDA Phase 1",
    description=(
        "Phase 1 Extensible MVP - FastAPI backend for Cranes AI Chatbot.\n\n"
        "**Scope:** General Chat, Course-Based Chat, Learning Assistant (6 modes), "
        "Conversation Management, Course Knowledge Base, RAG grounded responses.\n\n"
        "**Auth:** JWT Bearer token. Register/Login to obtain token.\n"
        "**Docs:** All 8 Phase-1 APIs under `/api/v1`."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for validation / generic errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Routers - /api/v1
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(conversations.router, prefix="/api/v1/conversations", tags=["Conversations"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(admin_documents.router, prefix="/api/v1/admin/documents", tags=["Admin - Documents"])


@app.get("/api/v1/health", tags=["System"], summary="Health check")
async def health():
    return {"status": "ok", "service": "cranes-ai-chatbot-backend", "version": "1.0.0"}


@app.get("/api/v1/system/config", tags=["System"], summary="System configuration (sanitized)")
async def system_config():
    s = get_settings()
    return {
        "llmModel": s.llm_model,
        "llmProvider": s.llm_provider,
        "embeddingModel": s.embedding_model,
        "vectorDatabase": s.vector_database_url or "In-Memory (Phase 1 fallback)",
        "database": "PostgreSQL (asyncpg)" if s.is_postgres else "SQLite (dev fallback)",
        "temperature": s.temperature,
        "maxTokens": s.max_tokens,
        "topK": s.top_k,
        "chunkSize": s.chunk_size,
        "chunkOverlap": s.chunk_overlap,
        "hasApiKey": bool(s.gemini_api_key or s.openai_api_key),
    }


@app.get("/", tags=["System"], include_in_schema=False)
async def root():
    return {"message": "Cranes AI Chatbot Backend - Phase 1", "docs": "/docs", "health": "/api/v1/health"}
