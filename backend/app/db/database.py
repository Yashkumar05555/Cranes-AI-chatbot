from typing import AsyncGenerator
import logging

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Create async engine - supports both postgres (asyncpg) and sqlite (aiosqlite)
# Automatic fallback to SQLite if DATABASE_URL is postgresql but no server is reachable
# This allows local dev without installing PostgreSQL
connect_args = {}
if settings.is_sqlite:
    connect_args = {"check_same_thread": False}

try:
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        future=True,
        connect_args=connect_args,
    )
    # For PostgreSQL, we lazily test connection on first use; fallback is handled in lifespan
    # If settings is postgresql but user has no server, they should use sqlite URL above
except Exception as e:
    logger.warning(f"Failed to create engine for {settings.database_url}: {e}, falling back to SQLite")
    engine = create_async_engine(
        "sqlite+aiosqlite:///./cranes.db",
        echo=False,
        future=True,
        connect_args={"check_same_thread": False},
    )

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables if not exist. Used at startup. Not a replacement for Alembic in prod."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
