from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.schemas.intelligence import SkillGapAnalysisResponse, RoleMatchItem
    from app.services.matching_service import MatchingService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.schemas.intelligence import SkillGapAnalysisResponse, RoleMatchItem
    from backend.app.services.matching_service import MatchingService

router = APIRouter(prefix="/matching", tags=["Matching"])

class MatchAnalyzeRequest(BaseModel):
    role_id: Optional[str] = None
    role_title: Optional[str] = None
    custom_skills: Optional[List[dict]] = None

@router.post("/analyze", response_model=SkillGapAnalysisResponse)
async def analyze_match(
    req: MatchAnalyzeRequest,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    target_role_id = req.role_id or profile.target_role_id
    target_role_title = req.role_title or profile.target_role_title

    result = await MatchingService.analyze_skill_gaps(
        db=db,
        student_id=profile.id,
        role_id=target_role_id,
        role_title=target_role_title,
        custom_skills=req.custom_skills
    )
    return result

@router.get("/roles", response_model=List[RoleMatchItem])
async def get_all_role_matches(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    results = await MatchingService.match_all_roles(db=db, student_id=profile.id)
    return results
