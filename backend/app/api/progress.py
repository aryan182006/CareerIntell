from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.models.intelligence import ReadinessHistory
    from app.models.student import StudentSkill
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.models.intelligence import ReadinessHistory
    from backend.app.models.student import StudentSkill

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/timeline")
async def get_progress_timeline(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ReadinessHistory)
        .where(ReadinessHistory.student_id == profile.id)
        .order_by(ReadinessHistory.recorded_at.asc())
    )
    res = await db.execute(stmt)
    history = res.scalars().all()
    return [
        {
            "date": h.recorded_at.strftime("%b %d") if h.recorded_at else "",
            "score": h.score,
            "role": h.role_title
        }
        for h in history
    ]

@router.get("/skills")
async def get_skills_progression(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentSkill).where(StudentSkill.student_id == profile.id)
    res = await db.execute(stmt)
    skills = res.scalars().all()

    return [
        {
            "name": s.skill_name,
            "level": s.proficiency_level,
            "proficiency": s.proficiency,
            "verified": s.verified,
            "source": s.source
        }
        for s in skills
    ]
