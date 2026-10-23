from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.schemas.interview import (
        InterviewHubResponse,
        InterviewProgressUpdateRequest,
        FilterOptionsResponse
    )
    from app.services.interview_service import InterviewService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.schemas.interview import (
        InterviewHubResponse,
        InterviewProgressUpdateRequest,
        FilterOptionsResponse
    )
    from backend.app.services.interview_service import InterviewService

router = APIRouter(prefix="/interviews", tags=["Interview Preparation"])

@router.get("/questions", response_model=InterviewHubResponse)
async def get_interview_questions(
    role: Optional[str] = Query(None, description="Target career role filter"),
    round_type: Optional[str] = Query(None, description="Interview round type filter"),
    company: Optional[str] = Query(None, description="Company tag filter"),
    difficulty: Optional[str] = Query(None, description="Difficulty filter"),
    gap_only: bool = Query(False, description="Filter only questions addressing detected skill gaps"),
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch company interview questions personalized to the student's target role,
    with priority tagging for detected skill gaps.
    """
    return await InterviewService.get_questions_for_student(
        db=db,
        student_id=profile.id,
        role_title=role,
        round_type=round_type,
        company=company,
        difficulty=difficulty,
        gap_only=gap_only
    )

@router.post("/{question_id}/progress")
async def update_interview_progress(
    question_id: str,
    req: InterviewProgressUpdateRequest,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a student's practice status, notes, or rating for a specific interview question.
    """
    if req.status not in ["NOT_STARTED", "PRACTICING", "MASTERED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be NOT_STARTED, PRACTICING, or MASTERED.")

    return await InterviewService.update_question_progress(
        db=db,
        student_id=profile.id,
        question_id=question_id,
        status=req.status,
        self_rating=req.self_rating,
        user_notes=req.user_notes
    )

@router.get("/filters", response_model=FilterOptionsResponse)
async def get_interview_filters(db: AsyncSession = Depends(get_db)):
    """
    Retrieve filter options including supported companies, roles, and interview rounds.
    """
    return await InterviewService.get_filter_options(db)
