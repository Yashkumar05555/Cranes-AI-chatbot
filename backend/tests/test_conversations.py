import pytest
from tests.conftest import create_user_and_token


@pytest.mark.asyncio
async def test_create_and_list_conversations(client, user_token):
    token, user = user_token
    headers = {"Authorization": f"Bearer {token}"}

    # Create
    r = await client.post("/api/v1/conversations", json={"title": "Test Conv", "courseId": "general", "mode": "explain_simply"}, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Test Conv"
    conv_id = data["id"]

    # List
    r2 = await client.get("/api/v1/conversations", headers=headers)
    assert r2.status_code == 200
    lst = r2.json()
    assert len(lst) == 1
    assert lst[0]["id"] == conv_id


@pytest.mark.asyncio
async def test_conversation_isolation_list(client):
    # Two users
    token_a, _ = await create_user_and_token(client, email="a@example.com", password="pass1234")
    token_b, _ = await create_user_and_token(client, email="b@example.com", password="pass1234")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # A creates 2
    await client.post("/api/v1/conversations", json={"title": "A1"}, headers=headers_a)
    await client.post("/api/v1/conversations", json={"title": "A2"}, headers=headers_a)
    # B creates 1
    await client.post("/api/v1/conversations", json={"title": "B1"}, headers=headers_b)

    r_a = await client.get("/api/v1/conversations", headers=headers_a)
    r_b = await client.get("/api/v1/conversations", headers=headers_b)
    assert len(r_a.json()) == 2
    assert len(r_b.json()) == 1
    assert all(c["title"].startswith("A") for c in r_a.json())
    assert r_b.json()[0]["title"] == "B1"


@pytest.mark.asyncio
async def test_get_conversation_ownership(client):
    token_a, _ = await create_user_and_token(client, email="a2@example.com", password="pass1234")
    token_b, _ = await create_user_and_token(client, email="b2@example.com", password="pass1234")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    r = await client.post("/api/v1/conversations", json={"title": "Secret"}, headers=headers_a)
    conv_id = r.json()["id"]

    # Owner can fetch
    r_owner = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_a)
    assert r_owner.status_code == 200
    assert r_owner.json()["id"] == conv_id

    # Other user cannot fetch -> 403
    r_other = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_b)
    assert r_other.status_code == 403

    # Non-existent -> 404
    r_none = await client.get("/api/v1/conversations/nonexistent-id", headers=headers_a)
    assert r_none.status_code == 404


@pytest.mark.asyncio
async def test_delete_conversation(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/api/v1/conversations", json={"title": "ToDelete"}, headers=headers)
    conv_id = r.json()["id"]

    del_r = await client.delete(f"/api/v1/conversations/{conv_id}", headers=headers)
    assert del_r.status_code == 200
    assert del_r.json()["success"] is True

    # Verify gone
    get_r = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers)
    assert get_r.status_code == 404


@pytest.mark.asyncio
async def test_delete_not_owner_forbidden(client):
    token_a, _ = await create_user_and_token(client, email="a3@example.com", password="pass1234")
    token_b, _ = await create_user_and_token(client, email="b3@example.com", password="pass1234")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    r = await client.post("/api/v1/conversations", json={"title": "OwnedByA"}, headers=headers_a)
    conv_id = r.json()["id"]

    # B tries to delete A's conversation -> 403
    del_r = await client.delete(f"/api/v1/conversations/{conv_id}", headers=headers_b)
    assert del_r.status_code == 403

    # A can still fetch it
    get_r = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_a)
    assert get_r.status_code == 200


@pytest.mark.asyncio
async def test_create_conversation_validation(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    # Empty title is okay (defaults), but courseId long etc?
    # Title too long
    r = await client.post("/api/v1/conversations", json={"title": "x" * 1000}, headers=headers)
    # Should be 422 due to max_length 500
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_unauthenticated_create_guest(client):
    # Frontend compatibility: unauthenticated create falls back to guest (201), not 401
    r = await client.post("/api/v1/conversations", json={"title": "NoAuth"})
    assert r.status_code == 201
    assert r.json()["title"] == "NoAuth"


@pytest.mark.asyncio
async def test_invalid_token_still_rejected(client):
    r = await client.post("/api/v1/conversations", json={"title": "Bad"}, headers={"Authorization": "Bearer invalidtoken123"})
    assert r.status_code == 401
