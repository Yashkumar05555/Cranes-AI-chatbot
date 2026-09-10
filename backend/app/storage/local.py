import os
import uuid
import aiofiles
from pathlib import Path
from typing import Optional

from app.storage.interface import StorageInterface
from app.core.config import get_settings


class LocalStorage(StorageInterface):
    def __init__(self, base_path: Optional[str] = None):
        settings = get_settings()
        self.base_path = Path(base_path or settings.storage_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file_name: str, content: bytes, course_id: str) -> str:
        # Sanitize file_name
        safe_name = "".join(c for c in file_name if c.isalnum() or c in ("-", "_", ".")).strip() or "document.pdf"
        # Prefix with course and uuid to avoid collisions
        key = f"{course_id}/{uuid.uuid4().hex[:8]}_{safe_name}"
        full_path = self.base_path / key
        full_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(full_path, "wb") as f:
            await f.write(content)
        return str(key)

    async def get(self, storage_path: str) -> Optional[bytes]:
        full_path = self.base_path / storage_path
        if not full_path.exists():
            return None
        async with aiofiles.open(full_path, "rb") as f:
            return await f.read()

    async def delete(self, storage_path: str) -> bool:
        full_path = self.base_path / storage_path
        try:
            if full_path.exists():
                full_path.unlink()
            # Try to remove empty parent dir if empty
            try:
                if full_path.parent != self.base_path and not any(full_path.parent.iterdir()):
                    full_path.parent.rmdir()
            except Exception:
                pass
            return True
        except Exception:
            return False


def get_storage_service() -> StorageInterface:
    # Factory - can be extended to S3/Cloudinary/Supabase based on STORAGE_PROVIDER
    # For Phase 1, we use local storage abstraction; cloud providers can be plugged without changing callers
    settings = get_settings()
    provider = (settings.storage_provider or "local").lower()
    # Future: if provider == "s3": return S3Storage()
    return LocalStorage()
