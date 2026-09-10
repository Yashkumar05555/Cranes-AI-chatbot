from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class AIService(ABC):
    """Abstract AI service - provider agnostic. Allows switching Gemini/OpenAI/Mock without rewriting business logic."""

    @abstractmethod
    async def generate(
        self,
        message: str,
        system_instruction: str,
        history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        model: Optional[str] = None,
    ) -> str:
        """Generate a response given the user message, system instruction and history."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        pass


class RAGServiceInterface(ABC):
    """Abstract RAG service - the AI/RAG developer implements retrieval, grounding, citation."""

    @abstractmethod
    async def search(
        self,
        query: str,
        course_id: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Return top-K chunks with metadata:
        {
            "id": "...",
            "docName": "...",
            "courseId": "...",
            "courseName": "...",
            "page": 1,
            "chunkIndex": 1,
            "content": "...",
            "excerpt": "...",
            "similarity": 0.85,
            "score": 0.85
        }
        """
        pass

    @abstractmethod
    async def ingest_document(
        self,
        doc_id: str,
        raw_text: str,
        course_id: str,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> int:
        """Ingest raw text -> chunk -> embed -> vector store. Returns chunk count."""
        pass


class StorageServiceInterface(ABC):
    @abstractmethod
    async def save(self, file_name: str, content: bytes, course_id: str) -> str:
        """Save file to object storage. Returns storage path."""
        pass

    @abstractmethod
    async def get(self, storage_path: str) -> Optional[bytes]:
        pass

    @abstractmethod
    async def delete(self, storage_path: str) -> bool:
        pass
