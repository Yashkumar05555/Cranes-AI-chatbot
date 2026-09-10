import pytest


@pytest.mark.asyncio
async def test_register_and_login(client):
    # Register
    r = await client.post("/api/v1/auth/register", json={"email": "new@example.com", "password": "secret123"})
    assert r.status_code == 201
    assert "access_token" in r.json()

    # Login
    r2 = await client.post("/api/v1/auth/login", json={"email": "new@example.com", "password": "secret123"})
    assert r2.status_code == 200
    assert "access_token" in r2.json()

    # Me
    token = r2.json()["access_token"]
    r3 = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200
    assert r3.json()["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/v1/auth/register", json={"email": "dup@example.com", "password": "secret123"})
    r = await client.post("/api/v1/auth/register", json={"email": "dup@example.com", "password": "secret123"})
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_login_invalid(client):
    await client.post("/api/v1/auth/register", json={"email": "user@example.com", "password": "correct123"})
    r = await client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "wrongpass"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_protected_without_token_guest_fallback(client):
    # Frontend compatibility: unauthenticated requests fallback to guest user (200) instead of 401
    # Invalid token still must be rejected with 401
    r = await client.get("/api/v1/conversations")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_protected_with_invalid_token(client):
    r = await client.get("/api/v1/conversations", headers={"Authorization": "Bearer invalidtoken"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_without_token(client):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_password_validation(client):
    r = await client.post("/api/v1/auth/register", json={"email": "short@example.com", "password": "123"})
    assert r.status_code == 422
