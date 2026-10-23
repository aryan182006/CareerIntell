import pytest

@pytest.mark.asyncio
async def test_interview_filters(client):
    res = await client.get("/api/interviews/filters")
    assert res.status_code == 200
    data = res.json()
    assert "roles" in data
    assert "companies" in data
    assert "round_types" in data
    assert "Amazon" in data["companies"]
    assert "Full Stack Developer" in data["roles"] or "Data Scientist" in data["roles"]

@pytest.mark.asyncio
async def test_interview_questions_retrieval_and_progress(client):
    # Login as student
    login_res = await client.post("/api/auth/login", json={
        "email": "student@careerintell.com",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch interview questions for student's target role
    res = await client.get("/api/interviews/questions", headers=headers)
    assert res.status_code == 200
    hub_data = res.json()
    assert "target_role" in hub_data
    assert hub_data["total_questions"] > 0
    assert len(hub_data["questions"]) > 0

    first_q = hub_data["questions"][0]
    assert "question_text" in first_q
    assert "model_answer" in first_q
    assert "company_tags" in first_q
    assert "key_concepts" in first_q
    assert "round_type" in first_q

    # Update progress for this question
    prog_res = await client.post(
        f"/api/interviews/{first_q['id']}/progress",
        headers=headers,
        json={
            "status": "MASTERED",
            "self_rating": 5,
            "user_notes": "Practiced explaining with STAR method; mentioned Big-O trade-offs."
        }
    )
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["status"] == "MASTERED"
    assert prog_data["self_rating"] == 5

    # Re-fetch and check updated stats
    refetch_res = await client.get("/api/interviews/questions", headers=headers)
    assert refetch_res.status_code == 200
    updated_hub = refetch_res.json()
    assert updated_hub["mastered_count"] >= 1
