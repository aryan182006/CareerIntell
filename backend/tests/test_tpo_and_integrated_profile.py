import pytest
import uuid

@pytest.mark.asyncio
async def test_tpo_registration_security(client):
    # 1. Attempt TPO registration with no auth code -> Expect 403
    random_email = f"tpo_{uuid.uuid4().hex[:6]}@college.edu"
    res1 = await client.post("/api/auth/register", json={
        "email": random_email,
        "password": "secretPassword123",
        "full_name": "Test Officer",
        "role": "tpo"
    })
    assert res1.status_code == 403
    assert "Institutional Authentication Code" in res1.json()["detail"]

    # 2. Attempt TPO registration with invalid auth code -> Expect 403
    res2 = await client.post("/api/auth/register", json={
        "email": random_email,
        "password": "secretPassword123",
        "full_name": "Test Officer",
        "role": "tpo",
        "tpo_auth_code": "WRONG-CODE-999"
    })
    assert res2.status_code == 403

    # 3. Register TPO with valid authorized campus code -> Expect 201
    res3 = await client.post("/api/auth/register", json={
        "email": random_email,
        "password": "secretPassword123",
        "full_name": "Authorized TPO",
        "role": "tpo",
        "tpo_auth_code": "TPO-SECURE-2026"
    })
    assert res3.status_code == 201
    data = res3.json()
    assert "access_token" in data
    assert data["user"]["role"] == "tpo"
    assert data["user"]["tpo_profile_id"] is not None

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Fetch TPO Profile -> Expect 200
    res4 = await client.get("/api/tpo/profile", headers=headers)
    assert res4.status_code == 200
    tpo_data = res4.json()
    assert tpo_data["email"] == random_email
    assert tpo_data["designation"] is not None
    assert "total_supervised_students" in tpo_data

    # 5. Update TPO Profile -> Expect 200
    res5 = await client.put("/api/tpo/profile", headers=headers, json={
        "designation": "Director of Placements",
        "institution_name": "National Engineering College",
        "office_room": "Placement Directorate Room 101",
        "min_cgpa_cutoff": 7.5
    })
    assert res5.status_code == 200
    updated_tpo = res5.json()
    assert updated_tpo["designation"] == "Director of Placements"
    assert updated_tpo["institution_name"] == "National Engineering College"
    assert updated_tpo["min_cgpa_cutoff"] == 7.5

@pytest.mark.asyncio
async def test_student_integrated_profile(client):
    # 1. Login as seeded student
    res = await client.post("/api/auth/login", json={
        "email": "student@careerintell.com",
        "password": "student123"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Fetch Integrated Profile
    res_int = await client.get("/api/students/me/integrated", headers=headers)
    assert res_int.status_code == 200
    data = res_int.json()

    assert "profile" in data
    assert "skills_summary" in data
    assert "assessments_summary" in data
    assert "interview_summary" in data
    assert "readiness_overview" in data

    assert data["profile"]["email"] == "student@careerintell.com"
    assert data["readiness_overview"]["score"] > 0

    # 3. Call 1-Click Sync Resume
    res_sync = await client.post("/api/students/me/sync-resume", headers=headers)
    assert res_sync.status_code == 200
    sync_data = res_sync.json()
    assert "status" in sync_data
