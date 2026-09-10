from abc import ABC, abstractmethod
from typing import Optional


class StorageInterface(ABC):
    @abstractmethod
    async def save(self, file_name: str, content: bytes, course_id: str) -> str:
        """Save content, return storage path/key. Do NOT expose public URL."""
        pass

    @abstractmethod
    async def get(self, storage_path: str) -> Optional[bytes]:
        pass

    @abstractmethod
    async def delete(self, storage_path: str) -> bool:
        pass
