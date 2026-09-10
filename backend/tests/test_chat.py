import pytest
from tests.conftest import create_user_and_token


@pytest.mark.asyncio
async def test_chat_basic(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post(
        "/api/v1/chat",
        json={"message": "What is embedded systems?", "courseId": "general", "mode": "explain_simply"},
        headers=headers,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert "response" in data
    assert len(data["response"]) > 20
    assert "conversationId" in data
    assert "sources" in data
    assert data["mode"] == "explain_simply"
    assert data["courseId"] == "general"


@pytest.mark.asyncio
async def test_chat_all_learning_modes(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    for mode in ["explain_simply", "explain_detail", "give_example", "summarize", "practical_app", "quiz_me"]:
        r = await client.post(
            "/api/v1/chat",
            json={"message": "Explain priority inversion", "courseId": "embedded_systems", "mode": mode},
            headers=headers,
        )
        assert r.status_code == 200, f"mode {mode} failed: {r.text}"
        assert len(r.json()["response"]) > 10


@pytest.mark.asyncio
async def test_chat_invalid_mode(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post(
        "/api/v1/chat",
        json={"message": "Hello", "mode": "invalid_mode"},
        headers=headers,
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_chat_course_based(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    # Course chat should return appropriate courseId and possibly RAG sources
    r = await client.post(
        "/api/v1/chat",
        json={"message": "What is CAN protocol?", "courseId": "automotive_embedded", "mode": "explain_detail"},
        headers=headers,
    )
    assert r.status_code == 200
    data = r.json()
    assert data["courseId"] == "automotive_embedded"
    # Sources may be present if docs seeded
    assert isinstance(data["sources"], list)


@pytest.mark.asyncio
async def test_chat_conversation_persistence(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    # First message creates conversation
    r1 = await client.post("/api/v1/chat", json={"message": "Hello first"}, headers=headers)
    assert r1.status_code == 200
    conv_id = r1.json()["conversationId"]

    # Second message in same conversation
    r2 = await client.post(
        "/api/v1/chat",
        json={"message": "Second message", "conversationId": conv_id, "history": [{"role": "user", "content": "Hello first"}]},
        headers=headers,
    )
    assert r2.status_code == 200
    assert r2.json()["conversationId"] == conv_id

    # Fetch conversation and verify messages persisted
    r_conv = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers)
    assert r_conv.status_code == 200
    conv = r_conv.json()
    assert len(conv["messages"]) >= 4  # 2 user + 2 assistant


@pytest.mark.asyncio
async def test_chat_user_isolation(client):
    token_a, _ = await create_user_and_token(client, email="chat_a@example.com", password="pass1234")
    token_b, _ = await create_user_and_token(client, email="chat_b@example.com", password="pass1234")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    r1 = await client.post("/api/v1/chat", json={"message": "Secret message A"}, headers=headers_a)
    conv_id_a = r1.json()["conversationId"]

    # B cannot see A's conversation
    r_get = await client.get(f"/api/v1/conversations/{conv_id_a}", headers=headers_b)
    assert r_get.status_code == 403

    # B tries to continue A's conversation -> should create new conversation instead (or still isolate)
    r2 = await client.post("/api/v1/chat", json={"message": "Hijack", "conversationId": conv_id_a}, headers=headers_b)
    assert r2.status_code == 200
    # Should not reuse same id (since ownership check fails, creates new)
    assert r2.json()["conversationId"] != conv_id_a


@pytest.mark.asyncio
async def test_chat_anonymous_allowed_guest(client):
    # Frontend compatibility: unauthenticated chat uses guest user (200)
    r = await client.post("/api/v1/chat", json={"message": "Hello"})
    assert r.status_code == 200
    assert "response" in r.json()


@pytest.mark.asyncio
async def test_chat_invalid_token_rejected(client):
    r = await client.post("/api/v1/chat", json={"message": "Hello"}, headers={"Authorization": "Bearer invalidXYZ"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_chat_empty_message_validation(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/api/v1/chat", json={"message": ""}, headers=headers)
    assert r.status_code == 422

    r2 = await client.post("/api/v1/chat", json={}, headers=headers)
    assert r2.status_code == 422
