from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.schemas.intelligence import RecommendationItem
    from app.services.recommendation_service import RecommendationService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.schemas.intelligence import RecommendationItem
    from backend.app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationItem])
async def get_recommendations(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    items = await RecommendationService.get_recommendations(db, profile)
    return [
        RecommendationItem(
            id=item["id"],
            type=item["type"],
            title=item["title"],
            description=item["description"],
            priority=item["priority"],
            action_url=item.get("action_url")
        )
        for item in items
    ]
