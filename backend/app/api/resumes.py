import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

try:
    from app.core.database import get_db
    from app.api.deps import get_current_student_profile
    from app.models.resume import Resume, ResumeExtraction
    from app.models.student import StudentSkill
    from app.services.resume_service import ResumeService
    from app.schemas.resume import ResumeResponse, ExtractedSkill, ResumeSkillsReview
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import get_current_student_profile
    from backend.app.models.resume import Resume, ResumeExtraction
    from backend.app.models.student import StudentSkill
    from backend.app.services.resume_service import ResumeService
    from backend.app.schemas.resume import ResumeResponse, ExtractedSkill, ResumeSkillsReview

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    result = await ResumeService.process_resume_upload(db, profile.id, file)
    return result

@router.get("/latest")
async def get_latest_resume(
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Resume)
        .where(Resume.student_id == profile.id)
        .order_by(Resume.uploaded_at.desc())
        .options(selectinload(Resume.extractions))
    )
    res = await db.execute(stmt)
    resume = res.scalars().first()
    if not resume:
        return {"resume": None}

    skills = []
    sections = {}
    snippet = ""
    if resume.extractions:
        ext = resume.extractions[0]
        try:
            skills = json.loads(ext.parsed_skills) if ext.parsed_skills else []
            sections = json.loads(ext.sections) if ext.sections else {}
            snippet = ext.clean_text[:300] if ext.clean_text else ""
        except Exception:
            pass

    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "file_size": resume.file_size,
        "uploaded_at": resume.uploaded_at,
        "skills_extracted": skills,
        "sections_detected": sections,
        "raw_text_snippet": snippet
    }

@router.post("/confirm-skills")
async def confirm_skills(
    review: ResumeSkillsReview,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    added_count = 0
    for skill_name in review.confirmed_skills:
        existing = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_id == profile.id,
                StudentSkill.skill_name.ilike(skill_name.strip())
            )
        )
        if not existing.scalars().first():
            new_skill = StudentSkill(
                student_id=profile.id,
                skill_name=skill_name.strip(),
                proficiency=review.proficiency or "Intermediate",
                proficiency_level=75,
                source="resume",
                verified=False
            )
            db.add(new_skill)
            added_count += 1

    await db.commit()
    return {"message": f"Successfully confirmed {added_count} skills.", "skills_added": added_count}
