from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.models.intelligence import ReadinessHistory
    from app.schemas.intelligence import ReadinessResponse, ReadinessHistoryPoint
    from app.services.readiness_service import ReadinessService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.models.intelligence import ReadinessHistory
    from backend.app.schemas.intelligence import ReadinessResponse, ReadinessHistoryPoint
    from backend.app.services.readiness_service import ReadinessService

router = APIRouter(prefix="/readiness", tags=["Readiness"])

@router.get("", response_model=ReadinessResponse)
async def get_current_readiness(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    result = await ReadinessService.compute_readiness(db, profile)
    return result

@router.get("/history", response_model=List[ReadinessHistoryPoint])
async def get_readiness_history(
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
        ReadinessHistoryPoint(
            recorded_at=h.recorded_at,
            score=h.score,
            role_title=h.role_title
        )
        for h in history
    ]
