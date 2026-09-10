import pytest
from tests.conftest import create_user_and_token


@pytest.mark.asyncio
async def test_admin_upload_and_list(client, admin_token):
    token, _ = admin_token
    headers = {"Authorization": f"Bearer {token}"}
    # Upload
    r = await client.post(
        "/api/v1/admin/documents",
        json={
            "title": "Test Doc",
            "courseId": "general",
            "rawText": "This is test content about Cranes Varsity and embedded systems. " * 20,
            "description": "Test",
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["title"] == "Test Doc"
    assert data["status"] in ("pending", "indexed", "failed")

    # List
    r2 = await client.get("/api/v1/admin/documents", headers=headers)
    assert r2.status_code == 200
    assert len(r2.json()) >= 1


@pytest.mark.asyncio
async def test_admin_upload_invalid_course(client, admin_token):
    token, _ = admin_token
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post(
        "/api/v1/admin/documents",
        json={"title": "Bad", "courseId": "nonexistent_course", "rawText": "content"},
        headers=headers,
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_admin_upload_validation(client, admin_token):
    token, _ = admin_token
    headers = {"Authorization": f"Bearer {token}"}
    # Missing rawText
    r = await client.post("/api/v1/admin/documents", json={"title": "Bad", "courseId": "general"}, headers=headers)
    assert r.status_code == 422
    # Empty rawText
    r2 = await client.post("/api/v1/admin/documents", json={"title": "Bad", "courseId": "general", "rawText": ""}, headers=headers)
    assert r2.status_code == 422


@pytest.mark.asyncio
async def test_non_admin_forbidden(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}
    # User cannot upload
    r = await client.post(
        "/api/v1/admin/documents",
        json={"title": "X", "courseId": "general", "rawText": "content"},
        headers=headers,
    )
    assert r.status_code == 403

    # User cannot list
    r2 = await client.get("/api/v1/admin/documents", headers=headers)
    assert r2.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_admin_endpoints(client):
    r = await client.get("/api/v1/admin/documents")
    assert r.status_code == 401
    r2 = await client.post("/api/v1/admin/documents", json={"title": "x", "courseId": "general", "rawText": "y"})
    assert r2.status_code == 401


@pytest.mark.asyncio
async def test_admin_delete_and_reindex(client, admin_token):
    token, _ = admin_token
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post(
        "/api/v1/admin/documents",
        json={"title": "To Delete", "courseId": "general", "rawText": "content for delete test " * 10},
        headers=headers,
    )
    doc_id = r.json()["id"]

    # Reindex
    r2 = await client.post(f"/api/v1/admin/documents/{doc_id}/reindex", headers=headers)
    assert r2.status_code == 200
    assert r2.json()["success"] is True

    # Delete
    r3 = await client.delete(f"/api/v1/admin/documents/{doc_id}", headers=headers)
    assert r3.status_code == 200

    # Verify not found on second delete
    r4 = await client.delete(f"/api/v1/admin/documents/{doc_id}", headers=headers)
    assert r4.status_code == 404


@pytest.mark.asyncio
async def test_admin_upload_file_endpoint(client, admin_token):
    token, _ = admin_token
    headers = {"Authorization": f"Bearer {token}"}
    # Use multipart file upload
    files = {"file": ("test.txt", b"Hello embedded world " * 100, "text/plain")}
    data = {"title": "File Doc", "courseId": "embedded_systems"}
    # httpx multipart via client.post with files requires data+files
    r = await client.post("/api/v1/admin/documents/upload", data=data, files=files, headers=headers)
    assert r.status_code == 201, r.text
    assert r.json()["fileName"] == "test.txt"
