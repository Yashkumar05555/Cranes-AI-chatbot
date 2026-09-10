"""
RAG Interface - Phase 1

Provides a clean abstraction for retrieval.
- Production: will query Qdrant/pgvector with embeddings (to be implemented by AI/RAG developer)
- Current: implements lightweight in-memory keyword + course-aware search over Document table chunks
  Serves as the integration point - chat_service depends only on this interface.

Flow:
Admin upload -> storage -> chunk -> embed (future) -> vector DB
User query -> similarity search -> top-K -> LLM -> grounded response + sources
"""
import math
import re
from typing import List, Dict, Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.document import Document


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    clean = text.replace("\r\n", "\n").strip()
    chunks: List[str] = []
    start = 0
    while start < len(clean):
        end = start + chunk_size
        if end >= len(clean):
            chunk = clean[start:].strip()
            if len(chunk) > 50:
                chunks.append(chunk)
            break
        # Prefer break at paragraph or sentence
        newline = clean.rfind("\n\n", start, end)
        if newline > start + 300:
            end = newline
        else:
            sentence = clean.rfind(". ", start, end)
            if sentence > start + 300:
                end = sentence + 1
        chunk = clean[start:end].strip()
        if len(chunk) > 50:
            chunks.append(chunk)
        start = max(start + 100, end - chunk_overlap)
    return chunks


class SimpleRAGService:
    """
    Interface-compatible RAG service that works with DB Documents.
    Can be replaced by LangChain/LlamaIndex + Qdrant/pgvector without changing callers.
    """

    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db
        self.settings = get_settings()

    async def _load_documents(self) -> List[Document]:
        if self.db is None:
            return []
        result = await self.db.execute(select(Document).where(Document.status == "indexed"))
        return list(result.scalars().all())

    async def _build_chunks(self, docs: List[Document]) -> List[Dict[str, Any]]:
        all_chunks: List[Dict[str, Any]] = []
        # We need course titles for display - fetch if possible
        course_map: Dict[str, str] = {}
        if self.db is not None:
            from app.models.course import Course
            result = await self.db.execute(select(Course))
            for c in result.scalars().all():
                course_map[c.id] = c.title

        for doc in docs:
            if not doc.raw_text:
                continue
            pieces = chunk_text(doc.raw_text, self.settings.chunk_size, self.settings.chunk_overlap)
            for idx, piece in enumerate(pieces):
                est_page = min(doc.pages or 1, max(1, math.floor((idx / max(1, len(pieces))) * (doc.pages or 1)) + 1))
                all_chunks.append({
                    "id": f"{doc.id}-chunk-{idx+1}",
                    "docId": doc.id,
                    "docName": doc.file_name,
                    "courseId": doc.course_id,
                    "courseName": doc.title,
                    "courseTitle": course_map.get(doc.course_id, doc.title),
                    "page": est_page,
                    "chunkIndex": idx + 1,
                    "content": piece,
                })
        return all_chunks

    async def search(self, query: str, course_id: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        if not query:
            return []
        docs = await self._load_documents()
        if not docs:
            return []
        chunks = await self._build_chunks(docs)
        if not chunks:
            return []

        query_words = [w for w in re.split(r"[^a-z0-9_-]+", query.lower()) if len(w) > 2]

        scored = []
        for ch in chunks:
            score = 0.0
            lower_content = ch["content"].lower()
            lower_doc = ch["docName"].lower()
            lower_course_name = ch["courseName"].lower()

            # Course awareness - must not mix contexts
            if course_id and course_id not in ("all", "general"):
                if ch["courseId"] == course_id:
                    score += 15
                elif ch["courseId"] == "general":
                    score += 2
                else:
                    score -= 8  # penalty but not full exclusion - still possible if query strongly matches
            # General queries favor general docs slightly

            for word in query_words:
                if word in lower_doc:
                    score += 6
                if word in lower_course_name:
                    score += 4
                # Count occurrences
                matches = len(re.findall(rf"\b{re.escape(word)}", lower_content))
                if matches:
                    score += min(matches * 3, 18)

            if query.lower().strip() in lower_content and len(query.strip()) > 5:
                score += 20

            # Build excerpt
            excerpt = ""
            first_word = next((w for w in query_words if w in lower_content), None)
            if first_word:
                idx = lower_content.index(first_word)
                start = max(0, idx - 60)
                end = min(len(ch["content"]), idx + 180)
                excerpt = ("..." if start > 0 else "") + ch["content"][start:end].replace("\n", " ") + ("..." if end < len(ch["content"]) else "")
            else:
                excerpt = ch["content"][:180].replace("\n", " ") + "..."

            scored.append((score, ch, excerpt))

        # Filter positive, sort, take topK
        relevant = [(s, c, e) for s, c, e in scored if s > 0]
        relevant.sort(key=lambda x: x[0], reverse=True)
        relevant = relevant[:top_k]

        if not relevant and course_id and course_id not in ("all", "general"):
            # Fallback to course-specific chunks
            course_chunks = [c for c in chunks if c["courseId"] == course_id][:top_k]
            return [
                {
                    "id": c["id"],
                    "docName": c["docName"],
                    "courseId": c["courseId"],
                    "courseName": c["courseTitle"] or c["courseName"],
                    "page": c["page"],
                    "chunkIndex": c["chunkIndex"],
                    "content": c["content"],
                    "excerpt": c["content"][:180].replace("\n", " ") + "...",
                    "similarity": 0.72,
                    "score": 5,
                }
                for c in course_chunks
            ]

        if not relevant:
            return []

        max_score = max(s for s, _, _ in relevant) or 1
        result = []
        for score, ch, excerpt in relevant:
            norm = min(0.98, max(0.70, 0.70 + (score / max_score) * 0.25))
            result.append({
                "id": ch["id"],
                "docName": ch["docName"],
                "courseId": ch["courseId"],
                "courseName": ch["courseTitle"] or ch["courseName"],
                "page": ch["page"],
                "chunkIndex": ch["chunkIndex"],
                "content": ch["content"],
                "excerpt": excerpt,
                "similarity": round(norm, 2),
                "score": round(norm, 2),
            })
        return result

    async def ingest_document(self, doc_id: str, raw_text: str, course_id: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> int:
        pieces = chunk_text(raw_text, chunk_size, chunk_overlap)
        # In production: embed and store in vector DB (Qdrant/pgvector)
        # Here we just return chunk count; persistence is via Document raw_text
        return len(pieces)
