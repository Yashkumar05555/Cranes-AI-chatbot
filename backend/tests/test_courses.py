import pytest


@pytest.mark.asyncio
async def test_list_courses(client):
    r = await client.get("/api/v1/courses")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 6
    ids = {c["id"] for c in data}
    assert "general" in ids
    assert "embedded_systems" in ids
    assert "vlsi_design" in ids
    # Check shape
    sample = data[0]
    for field in ["id", "code", "title", "category", "duration", "description", "highlights", "keySkills", "sampleQuestions"]:
        assert field in sample, f"missing {field}"


@pytest.mark.asyncio
async def test_list_courses_with_slash(client):
    r = await client.get("/api/v1/courses/")
    assert r.status_code == 200
