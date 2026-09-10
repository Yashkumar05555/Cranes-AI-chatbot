import pytest
import pytest_asyncio


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_system_config(client):
    r = await client.get("/api/v1/system/config")
    assert r.status_code == 200
    data = r.json()
    assert "llmModel" in data
    assert "embeddingModel" in data
    assert "temperature" in data


@pytest.mark.asyncio
async def test_openapi_available(client):
    r = await client.get("/openapi.json")
    assert r.status_code == 200
    assert "openapi" in r.json()
