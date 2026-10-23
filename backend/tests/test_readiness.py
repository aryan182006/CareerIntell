import pytest

@pytest.mark.asyncio
async def test_readiness_calculation(client):
    # Login as student
    login_res = await client.post("/api/auth/login", json={
        "email": "student@careerintell.com",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch readiness
    res = await client.get("/api/readiness", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "overall_score" in data
    assert 0 <= data["overall_score"] <= 100
    assert "breakdown" in data
    assert "technical_skills" in data["breakdown"]
    assert "role_match" in data["breakdown"]
    assert "projects" in data["breakdown"]
    assert "resume_quality" in data["breakdown"]
    assert "assessments" in data["breakdown"]
    assert len(data["explanation_summary"]) > 10

@pytest.mark.asyncio
async def test_roadmap_interactive(client):
    login_res = await client.post("/api/auth/login", json={
        "email": "student@careerintell.com",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch roadmap
    res = await client.get("/api/roadmap", headers=headers)
    assert res.status_code == 200
    roadmap = res.json()
    assert len(roadmap["items"]) > 0

    first_item = roadmap["items"][0]
    # Update status to IN_PROGRESS
    put_res = await client.put(f"/api/roadmap/items/{first_item['id']}", headers=headers, json={"status": "IN_PROGRESS"})
    assert put_res.status_code == 200
    updated_roadmap = put_res.json()
    updated_item = next(i for i in updated_roadmap["items"] if i["id"] == first_item["id"])
    assert updated_item["status"] == "IN_PROGRESS"
