from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.schemas.assessment import (
        AssessmentResponse, QuestionPublic, AssessmentSubmitRequest,
        AssessmentResultResponse, AssessmentHistoryItem
    )
    from app.services.assessment_service import AssessmentService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.schemas.assessment import (
        AssessmentResponse, QuestionPublic, AssessmentSubmitRequest,
        AssessmentResultResponse, AssessmentHistoryItem
    )
    from backend.app.services.assessment_service import AssessmentService

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("", response_model=List[AssessmentResponse])
async def list_assessments(db: AsyncSession = Depends(get_db)):
    return await AssessmentService.list_assessments(db)

@router.get("/{assessment_id}/questions", response_model=List[QuestionPublic])
async def get_questions(assessment_id: str, db: AsyncSession = Depends(get_db)):
    return await AssessmentService.get_assessment_questions(db, assessment_id)

@router.post("/{assessment_id}/submit", response_model=AssessmentResultResponse)
async def submit_assessment(
    assessment_id: str,
    req: AssessmentSubmitRequest,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    result = await AssessmentService.grade_assessment(
        db=db,
        profile=profile,
        assessment_id=assessment_id,
        user_answers=req.answers,
        time_taken_seconds=req.time_taken_seconds
    )
    return result

@router.get("/history", response_model=List[AssessmentHistoryItem])
async def get_history(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    return await AssessmentService.get_history(db, profile.id)
