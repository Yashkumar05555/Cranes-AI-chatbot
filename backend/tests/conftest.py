import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.db.database import Base, get_db
from app.main import app
from app.core.config import get_settings

# Use in-memory SQLite for tests - fast, isolated
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DB_URL, echo=False, future=True, connect_args={"check_same_thread": False})
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed courses for tests
    from app.services.course_service import ensure_seed_courses
    async with TestingSessionLocal() as session:
        await ensure_seed_courses(session)
    yield
    # Drop tables after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


async def create_user_and_token(client, email="test@example.com", password="password123", role="user"):
    # Register
    resp = await client.post("/api/v1/auth/register", json={"email": email, "password": password, "role": role})
    assert resp.status_code == 201, resp.text
    data = resp.json()
    return data["access_token"], data["user"]


@pytest_asyncio.fixture
async def user_token(client):
    token, user = await create_user_and_token(client, email="user1@example.com", password="password123", role="user")
    return token, user


@pytest_asyncio.fixture
async def admin_token(client):
    token, user = await create_user_and_token(client, email="admin@example.com", password="adminpass123", role="admin")
    return token, user
