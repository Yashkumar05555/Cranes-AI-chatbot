import os
from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "Cranes AI Chatbot - Phase 1"
    app_env: str = "development"
    debug: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///./cranes.db"
    # Allow DATABASE_URL env var to override
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Auth
    secret_key: str = "dev-secret-key-change-in-production-please-32chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # LLM
    llm_provider: str = "mock"  # gemini | openai | mock
    llm_model: str = "gemini-2.0-flash"
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    max_tokens: int = 2048
    temperature: float = 0.7

    # RAG
    embedding_model: str = "text-embedding-004"
    vector_database_url: Optional[str] = None
    top_k: int = 5
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # Storage
    storage_provider: str = "local"
    storage_path: str = "./storage"

    # CORS
    cors_origins: str = "*"

    @property
    def cors_origins_list(self) -> List[str]:
        if self.cors_origins == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_postgres(self) -> bool:
        return self.database_url.startswith("postgresql")

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    # Explicitly map DATABASE_URL (uppercase with underscore) to database_url
    # pydantic-settings handles case-insensitive, but ensure compat
    db_url = os.getenv("DATABASE_URL")
    overrides = {}
    if db_url:
        overrides["database_url"] = db_url
    # Also check for individual vars if not set via .env
    for key in ["SECRET_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "LLM_MODEL", "LLM_PROVIDER"]:
        val = os.getenv(key)
        if val:
            overrides[key.lower()] = val
    # Map GEMINI_API_KEY -> gemini_api_key already handled by lower
    # pydantic will read from env directly for most fields, but we provide explicit database_url
    settings = Settings(**overrides) if overrides else Settings()
    # Override from env again for keys that pydantic-settings didn't pick due to naming
    if os.getenv("GEMINI_API_KEY"):
        settings.gemini_api_key = os.getenv("GEMINI_API_KEY")
    if os.getenv("OPENAI_API_KEY"):
        settings.openai_api_key = os.getenv("OPENAI_API_KEY")
    if os.getenv("SECRET_KEY"):
        settings.secret_key = os.getenv("SECRET_KEY")
    if os.getenv("LLM_MODEL"):
        settings.llm_model = os.getenv("LLM_MODEL")
    if os.getenv("LLM_PROVIDER"):
        settings.llm_provider = os.getenv("LLM_PROVIDER")
    if os.getenv("MAX_TOKENS"):
        try:
            settings.max_tokens = int(os.getenv("MAX_TOKENS"))
        except Exception:
            pass
    if os.getenv("TEMPERATURE"):
        try:
            settings.temperature = float(os.getenv("TEMPERATURE"))
        except Exception:
            pass
    if os.getenv("TOP_K"):
        try:
            settings.top_k = int(os.getenv("TOP_K"))
        except Exception:
            pass
    if os.getenv("CHUNK_SIZE"):
        try:
            settings.chunk_size = int(os.getenv("CHUNK_SIZE"))
        except Exception:
            pass
    if os.getenv("CHUNK_OVERLAP"):
        try:
            settings.chunk_overlap = int(os.getenv("CHUNK_OVERLAP"))
        except Exception:
            pass
    if os.getenv("EMBEDDING_MODEL"):
        settings.embedding_model = os.getenv("EMBEDDING_MODEL")
    if os.getenv("VECTOR_DATABASE_URL"):
        settings.vector_database_url = os.getenv("VECTOR_DATABASE_URL")
    if os.getenv("CORS_ORIGINS"):
        settings.cors_origins = os.getenv("CORS_ORIGINS")
    return settings
