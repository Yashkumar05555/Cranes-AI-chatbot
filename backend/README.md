# Cranes AI Chatbot — Phase 1 Backend (FastAPI)

Extensible MVP backend for CDA AI Chatbot covering:
- General Chat, Course-Based Chat, Learning Assistant (6 modes)
- Conversation Management (CRUD + user isolation)
- Course Knowledge Base & Admin document upload
- RAG grounded responses with source citations

## Tech Stack
- **Python 3.12**, **FastAPI**, **PostgreSQL** (asyncpg) with SQLite fallback for local dev/tests
- **SQLAlchemy 2.0 Async**, **Pydantic v2**, **JWT (python-jose) + passlib/bcrypt**
- Provider-agnostic AI: `AIService` interface → `GeminiProvider` / `OpenAIProvider` / `Mock`
- RAG interface: `SimpleRAGService` (keyword + course-aware) pluggable with LangChain/Qdrant/pgvector
- Storage abstraction: `LocalStorage` (S3/Cloudinary/Supabase pluggable)

## Project Structure
```
backend/
├── app/
│   ├── main.py                 # FastAPI app, lifespan, CORS, routers
│   ├── api/v1/                 # 8 Phase-1 APIs + auth/system
│   ├── core/ {config,security,dependencies}
│   ├── models/ {user,conversation,message,course,document}
│   ├── schemas/ {chat,conversation,course,document,auth}
│   ├── services/ {chat,conversation,course,document}
│   ├── ai/ {interface,service,learning_modes, providers/gemini,openai, rag_interface}
│   ├── db/ {database,session}
│   └── storage/ {interface,local}
├── tests/
├── requirements.txt
└── .env.example
```

## Setup

### 1. Install
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure env
```bash
cp .env.example .env
# Edit .env:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/cranes_chatbot
# or leave as sqlite+aiosqlite:///./cranes.db for local dev
# SECRET_KEY=...
# GEMINI_API_KEY=... or OPENAI_API_KEY=...
```

If PostgreSQL not available, the app automatically detects and uses SQLite.

### 3. Run
```bash
uvicorn app.main:app --reload --port 8000
# or
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health
- Config: http://localhost:8000/api/v1/system/config

### 4. Run Tests
```bash
pytest -v
# or with coverage
pytest -v --tb=short
```

All tests use in-memory SQLite and require no external services.

## Environment Variables
| Var | Required | Description |
|-----|----------|-------------|
| `DATABASE_URL` | No (defaults to SQLite) | PostgreSQL: `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY` | Yes in prod | JWT signing secret (32+ chars) |
| `ALGORITHM` | No | JWT alg (default HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default 10080 (7d) |
| `LLM_PROVIDER` | No | `gemini` / `openai` / `mock` |
| `LLM_MODEL` | No | e.g. `gemini-2.0-flash`, `gpt-4o-mini` |
| `GEMINI_API_KEY` | No | Gemini key (if provider=gemini) |
| `OPENAI_API_KEY` | No | OpenAI key (if provider=openai) |
| `MAX_TOKENS` | No | Default 2048 |
| `TEMPERATURE` | No | Default 0.7 |
| `EMBEDDING_MODEL` | No | Default `text-embedding-004` |
| `VECTOR_DATABASE_URL` | No | Qdrant/pgvector URL (future) |
| `TOP_K` | No | Default 5 |
| `CHUNK_SIZE` | No | Default 1000 |
| `CHUNK_OVERLAP` | No | Default 200 |
| `STORAGE_PROVIDER` | No | `local` (S3/Cloudinary future) |
| `CORS_ORIGINS` | No | Default `*` |

Never commit `.env`. Never expose API keys to frontend.

## API Contracts (8 Phase-1 APIs)

### Auth (helper, not counted in 8)
- `POST /api/v1/auth/register` {email, password, role?} → {access_token, user}
- `POST /api/v1/auth/login` {email, password} → {access_token, user}
- `GET /api/v1/auth/me` (Bearer) → user

### 1. POST /api/v1/chat (Auth required)
**Body:**
```json
{
  "message": "What is priority inversion?",
  "conversationId": "opt",
  "courseId": "embedded_systems",
  "mode": "explain_simply",
  "history": [{"role":"user","content":"..."}]
}
```
Modes: `explain_simply | explain_detail | give_example | summarize | practical_app | quiz_me`
**Response 200:**
```json
{"response":"...", "sources":[{"id","docName","courseId","courseName","page","chunkIndex","excerpt","similarity"}], "conversationId":"...","mode":"...","courseId":"..."}
```

### 2. GET /api/v1/conversations (Auth, user-isolated)
→ `[{id,title,courseId,mode,createdAt,updatedAt,messages:[]}]`

### 3. POST /api/v1/conversations (Auth)
Body: `{title?, courseId?, mode?}` → 201 Conversation

### 4. GET /api/v1/conversations/{id} (Auth, owner-only)
→ 200 Conversation or 403/404

### 5. DELETE /api/v1/conversations/{id} (Auth, owner-only)
→ `{"success":true}` or 403/404

### 6. GET /api/v1/courses
→ `[{id,code,title,category,duration,description,highlights,keySkills,sampleQuestions}]`

### 7. POST /api/v1/admin/documents (Admin)
JSON: `{title, courseId, fileName?, rawText, description?}` → 201 Document
or multipart: `POST /api/v1/admin/documents/upload` with form `title, courseId, file, description`

### 8. GET /api/v1/admin/documents (Admin)
→ `[{id,title,courseId,fileName,fileSize,status,pages,uploadDate,description,chunkCount}]`
Statuses: `pending | indexed | failed`

### System
- `GET /api/v1/health` → `{status:"ok"}`
- `GET /api/v1/system/config` → sanitized config

## Authentication
- JWT Bearer tokens via `Authorization: Bearer <token>`
- Passwords hashed with bcrypt
- `get_current_user` dependency enforces auth; `get_current_admin_user` enforces ADMIN role
- User isolation: all conversation queries filter by `user_id`; direct access checks return 403 if owner mismatch

## RAG Integration
- `SimpleRAGService.search(query, courseId, topK)` scans `documents` table (status=indexed), chunks via `chunk_text()`, scores keyword overlap + course bonus
- `process_chat()` handles: retrieve → build sources → course context + mode directive + RAG context → system prompt → AI generate → persist messages
- **For AI/RAG developer:** Replace `SimpleRAGService` with LangChain/LlamaIndex + embeddings + Qdrant/pgvector by implementing `RAGServiceInterface`. No chat business logic changes needed.
- Chunks: `CHUNK_SIZE`/`CHUNK_OVERLAP` env-configurable. Vector DB URL ready via `VECTOR_DATABASE_URL`.

## Learning Assistant (6 modes)
Implemented as prompt routing in `app/ai/learning_modes.py`:
- `explain_simply`, `explain_detail`, `give_example`, `summarize`, `practical_app`, `quiz_me`
Validated via Pydantic pattern in `ChatRequest.mode`.

## Course-Based Chat
- `courseId` passed through chat → conversation → RAG `search(course_id=...)` ensures course-specific context not mixed
- Course isolation penalty/boost in RAG scoring prevents cross-course contamination

## Security
- JWT auth on all user-facing APIs
- Admin role check for `/admin/*`
- Ownership checks (403 vs 404) on conversation access
- Input validation via Pydantic (max lengths, patterns, types)
- No API keys in responses; `/system/config` only shows `hasApiKey: bool`
- CORS configured; storage paths not exposed as public URLs

## Database Schema
- `users(id PK, email unique, hashed_password, role, created_at, updated_at)`
- `courses(id PK, code, title, category, duration, description, highlights JSON, key_skills JSON, sample_questions JSON)`
- `conversations(id PK, user_id FK → users, course_id FK → courses, title, mode, created_at, updated_at)`
- `messages(id PK, conversation_id FK → conversations, role, content, mode, course_id, sources JSON, created_at)`
- `documents(id PK, title, course_id FK → courses, file_name, file_size, status, pages, description, raw_text, chunk_count, uploader_id FK → users, storage_path, created_at, updated_at)`

Relationships: User 1—N Conversations 1—N Messages; Course 1—N Conversations & 1—N Documents.

## Frontend Integration
- Frontend expects `/api/v1/courses`, `/api/v1/conversations`, `/api/v1/chat` exactly as implemented
- Swagger at `/docs` documents all request/response schemas for frontend dev
- Frontend must send `Authorization: Bearer <token>` (obtain via login/register)
- For local dev without auth, frontend can register a dev user first

## Seeding
- Courses auto-seeded from `SEED_COURSES` on startup
- Initial RAG documents seeded if `documents` table empty (prospectus, embedded, VLSI, automotive)

## Remaining Work
- **AI/RAG dev:** Replace `SimpleRAGService` with real embeddings + vector DB; wire `VECTOR_DATABASE_URL`/`EMBEDDING_MODEL`; implement true chunk embedding pipeline in `ingest_document`.
- **Frontend dev:** Integrate auth (store JWT, add header to all requests); handle 401 → redirect to login.

## Deployment Notes
- PostgreSQL recommended for production (`DATABASE_URL` with `asyncpg`)
- Set strong `SECRET_KEY`
- Configure `GEMINI_API_KEY` or `OPENAI_API_KEY` and `LLM_PROVIDER`
- Storage: `local` suffices for MVP; configure S3/Cloudinary by swapping `get_storage_service()`
