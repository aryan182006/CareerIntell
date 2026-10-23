import pytest
import pytest_asyncio
import sys
import os
import httpx
from sqlalchemy import select

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.database import AsyncSessionLocal, init_db
from app.models.user import User
from app.models.student import StudentProfile, StudentSkill
from app.core.security import get_password_hash

@pytest_asyncio.fixture(autouse=True)
async def setup_test_user():
    await init_db()
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.email == "student@careerintell.com"))
        user = res.scalars().first()
        if not user:
            user = User(
                email="student@careerintell.com",
                hashed_password=get_password_hash("student123"),
                full_name="Test Student",
                role="student",
                is_active=True
            )
            session.add(user)
            await session.flush()
            
            profile = StudentProfile(
                user_id=user.id,
                department="Computer Science",
                degree="B.Tech",
                graduation_year=2026,
                current_cgpa=8.5,
                target_role_title="Data Scientist",
                readiness_score=75.0
            )
            session.add(profile)
            await session.flush()
            
            skill = StudentSkill(
                student_id=profile.id,
                skill_name="Python",
                proficiency="Advanced",
                proficiency_level=85,
                source="manual",
                verified=True
            )
            session.add(skill)
            await session.commit()
    yield

@pytest_asyncio.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
