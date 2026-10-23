import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

import httpx
from app.main import app

async def run_integration_tests():
    print("--- Running Backend Integration Tests ---")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[OK] Health check passed:", res.json())

        # 2. Login
        login_res = await client.post("/api/auth/login", json={
            "email": "student@careerintell.com",
            "password": "student123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[OK] Login passed. Token acquired for student.")

        # 3. Get Student Profile
        me_res = await client.get("/api/students/me", headers=headers)
        assert me_res.status_code == 200, f"Student profile failed: {me_res.text}"
        profile = me_res.json()
        print(f"[OK] Profile loaded: {profile['full_name']} | Target Role: {profile['target_role_title']} | Skills: {len(profile['skills'])}")

        # 4. Job Description Analyzer
        sample_jd = """
        Position: Data Scientist
        Company: DeepTech Innovations
        We are seeking an experienced Data Scientist to design and deploy predictive models.
        Requirements:
        - Strong proficiency in Python, SQL, and Machine Learning
        - Hands-on experience with Pandas, Scikit-Learn, and statistics
        - 2+ years experience in analytical problem solving
        Nice to have:
        - Experience with Deep Learning, PyTorch, and Docker
        """
        jd_res = await client.post("/api/jobs/analyze", json={"raw_text": sample_jd, "company": "DeepTech Innovations"})
        assert jd_res.status_code == 200, f"JD analysis failed: {jd_res.text}"
        jd_data = jd_res.json()
        print(f"[OK] JD Analyzed: Title='{jd_data['title']}', Required={jd_data['required_skills']}, Preferred={jd_data['preferred_skills']}")

        # 5. Matching & Gap Analysis
        match_res = await client.post("/api/matching/analyze", headers=headers, json={})
        assert match_res.status_code == 200, f"Matching failed: {match_res.text}"
        match_data = match_res.json()
        print(f"[OK] Match score: {match_data['match_score']}% (Matched: {match_data['matched_count']}, Missing: {match_data['missing_count']})")

        # 6. Role Comparison
        roles_res = await client.get("/api/matching/roles", headers=headers)
        assert roles_res.status_code == 200, f"Role comparison failed: {roles_res.text}"
        role_matches = roles_res.json()
        print(f"[OK] Role comparisons loaded: {len(role_matches)} roles evaluated. Top: {role_matches[0]['title']} ({role_matches[0]['match_percentage']}%)")

        # 7. Readiness Score Calculation
        read_res = await client.get("/api/readiness", headers=headers)
        assert read_res.status_code == 200, f"Readiness failed: {read_res.text}"
        read_data = read_res.json()
        print(f"[OK] Readiness evaluated: {read_data['overall_score']}% | Breakdown: {read_data['breakdown']}")

        # 8. Dynamic Recommendations
        rec_res = await client.get("/api/recommendations", headers=headers)
        assert rec_res.status_code == 200, f"Recommendations failed: {rec_res.text}"
        recs = rec_res.json()
        print(f"[OK] Recommendations generated: {len(recs)} prioritized items")

        # 9. Personalized Roadmap
        road_res = await client.get("/api/roadmap", headers=headers)
        assert road_res.status_code == 200, f"Roadmap failed: {road_res.text}"
        roadmap = road_res.json()
        print(f"[OK] Roadmap generated: {len(roadmap['items'])} items across 4 phases")

        # 10. Assessments
        ass_res = await client.get("/api/assessments")
        assert ass_res.status_code == 200, f"Assessments list failed: {ass_res.text}"
        assessments = ass_res.json()
        print(f"[OK] Assessments available: {len(assessments)} tests")

        # 11. TPO Analytics (with TPO login)
        tpo_login = await client.post("/api/auth/login", json={
            "email": "tpo@careerintell.com",
            "password": "tpo123"
        })
        tpo_token = tpo_login.json()["access_token"]
        tpo_res = await client.get("/api/tpo/analytics", headers={"Authorization": f"Bearer {tpo_token}"})
        assert tpo_res.status_code == 200, f"TPO analytics failed: {tpo_res.text}"
        tpo_data = tpo_res.json()
        print(f"[OK] TPO Analytics: {tpo_data['total_students']} students enrolled, avg readiness: {tpo_data['average_readiness']}%")

        print("--- ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    asyncio.run(run_integration_tests())
