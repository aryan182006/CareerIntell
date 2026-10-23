import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

try:
    from app.core.database import get_db
    from app.models.user import User
    from app.models.student import StudentProfile, StudentSkill, Project, Certification
    from app.models.resume import Resume, ResumeExtraction
    from app.models.assessment import AssessmentAttempt, Assessment
    from app.models.interview import StudentInterviewProgress
    from app.models.intelligence import ReadinessHistory
    from app.schemas.student import (
        StudentProfileResponse, StudentProfileUpdate, SkillCreate, SkillResponse,
        ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse
    )
    from app.api.deps import get_current_user, get_current_student_profile
    from app.services.profile_service import ProfileService
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.models.user import User
    from backend.app.models.student import StudentProfile, StudentSkill, Project, Certification
    from backend.app.models.resume import Resume, ResumeExtraction
    from backend.app.models.assessment import AssessmentAttempt, Assessment
    from backend.app.models.interview import StudentInterviewProgress
    from backend.app.models.intelligence import ReadinessHistory
    from backend.app.schemas.student import (
        StudentProfileResponse, StudentProfileUpdate, SkillCreate, SkillResponse,
        ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse
    )
    from backend.app.api.deps import get_current_user, get_current_student_profile
    from backend.app.services.profile_service import ProfileService

router = APIRouter(prefix="/students", tags=["Students"])

def serialize_profile(profile, user: User) -> StudentProfileResponse:
    skills_list = [
        SkillResponse(
            id=s.id,
            skill_name=s.skill_name,
            proficiency=s.proficiency,
            proficiency_level=s.proficiency_level,
            source=s.source,
            verified=s.verified
        )
        for s in profile.skills
    ]

    projects_list = []
    for p in profile.projects:
        techs = []
        try:
            techs = json.loads(p.technologies) if p.technologies else []
        except Exception:
            techs = []
        projects_list.append(
            ProjectResponse(
                id=p.id,
                title=p.title,
                description=p.description,
                technologies=techs,
                github_url=p.github_url,
                live_url=p.live_url,
                created_at=p.created_at
            )
        )

    certs_list = [
        CertificationResponse(
            id=c.id,
            name=c.name,
            issuing_organization=c.issuing_organization,
            issue_date=c.issue_date,
            expiration_date=c.expiration_date,
            credential_id=c.credential_id,
            credential_url=c.credential_url
        )
        for c in profile.certifications
    ]

    return StudentProfileResponse(
        id=profile.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        department=profile.department,
        degree=profile.degree,
        graduation_year=profile.graduation_year,
        current_cgpa=profile.current_cgpa,
        bio=profile.bio,
        phone=profile.phone,
        target_role_id=profile.target_role_id,
        target_role_title=profile.target_role_title,
        readiness_score=profile.readiness_score,
        skills=skills_list,
        projects=projects_list,
        certifications=certs_list
    )

@router.get("/me", response_model=StudentProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return serialize_profile(profile, current_user)

@router.put("/me", response_model=StudentProfileResponse)
async def update_my_profile(
    update_data: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await ProfileService.update_profile(db, current_user.id, update_data)
    # Refresh to load relationships
    full_profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    return serialize_profile(full_profile, current_user)

@router.post("/me/skills", response_model=SkillResponse)
async def add_skill(
    skill_in: SkillCreate,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    skill = await ProfileService.add_skill(db, profile.id, skill_in)
    return SkillResponse(
        id=skill.id,
        skill_name=skill.skill_name,
        proficiency=skill.proficiency,
        proficiency_level=skill.proficiency_level,
        source=skill.source,
        verified=skill.verified
    )

@router.delete("/me/skills/{skill_id}")
async def delete_skill(
    skill_id: str,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    success = await ProfileService.delete_skill(db, profile.id, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"message": "Skill deleted successfully"}

@router.post("/me/projects", response_model=ProjectResponse)
async def add_project(
    proj_in: ProjectCreate,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    proj = await ProfileService.add_project(db, profile.id, proj_in)
    techs = []
    try:
        techs = json.loads(proj.technologies) if proj.technologies else []
    except Exception:
        techs = []
    return ProjectResponse(
        id=proj.id,
        title=proj.title,
        description=proj.description,
        technologies=techs,
        github_url=proj.github_url,
        live_url=proj.live_url,
        created_at=proj.created_at
    )

@router.delete("/me/projects/{project_id}")
async def delete_project(
    project_id: str,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    success = await ProfileService.delete_project(db, profile.id, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@router.post("/me/certifications", response_model=CertificationResponse)
async def add_certification(
    cert_in: CertificationCreate,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    cert = await ProfileService.add_certification(db, profile.id, cert_in)
    return CertificationResponse(
        id=cert.id,
        name=cert.name,
        issuing_organization=cert.issuing_organization,
        issue_date=cert.issue_date,
        expiration_date=cert.expiration_date,
        credential_id=cert.credential_id,
        credential_url=cert.credential_url
    )

@router.delete("/me/certifications/{cert_id}")
async def delete_certification(
    cert_id: str,
    profile=Depends(get_current_student_profile),
    db: AsyncSession = Depends(get_db)
):
    success = await ProfileService.delete_certification(db, profile.id, cert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certification not found")
    return {"message": "Certification deleted successfully"}

@router.get("/me/integrated")
async def get_integrated_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns an All-in-One comprehensive profile uniting:
    1. Core student profile & academics
    2. Latest resume metadata & extracted sections (PyMuPDF / OCR)
    3. Multi-source skills matrix (Resume, Verified, Manual)
    4. Projects & Experience integration
    5. Assessments & Interview mastery summary
    6. Placement Readiness breakdown
    """
    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    base_profile = serialize_profile(profile, current_user)

    # 1. Fetch Latest Resume & Extracted NLP Data
    stmt_resume = (
        select(Resume)
        .where(Resume.student_id == profile.id)
        .order_by(Resume.uploaded_at.desc())
        .options(selectinload(Resume.extractions))
    )
    res_resume = await db.execute(stmt_resume)
    latest_resume = res_resume.scalars().first()

    resume_data = None
    if latest_resume:
        sections = {}
        parsed_skills = []
        snippet = ""
        meta = {}
        if latest_resume.extractions:
            ext = latest_resume.extractions[0]
            try:
                sections = json.loads(ext.sections) if ext.sections else {}
                parsed_skills = json.loads(ext.parsed_skills) if ext.parsed_skills else []
                snippet = ext.clean_text[:400] if ext.clean_text else ""
                meta = json.loads(ext.extraction_metadata) if ext.extraction_metadata else {}
            except Exception:
                pass

        resume_data = {
            "id": latest_resume.id,
            "file_name": latest_resume.file_name,
            "file_size": latest_resume.file_size,
            "uploaded_at": latest_resume.uploaded_at,
            "sections": sections,
            "skills_extracted": parsed_skills,
            "raw_text_snippet": snippet,
            "word_count": meta.get("word_count", 0),
            "page_count": meta.get("page_count", 1)
        }

    # 2. Fetch Assessments History & Badges
    stmt_assessments = (
        select(AssessmentAttempt)
        .where(AssessmentAttempt.student_id == profile.id)
        .options(selectinload(AssessmentAttempt.assessment))
        .order_by(AssessmentAttempt.completed_at.desc())
    )
    res_assess = await db.execute(stmt_assessments)
    attempts = res_assess.scalars().all()

    completed_count = len(attempts)
    passed_count = sum(1 for a in attempts if a.passed)
    avg_score = round(sum(a.score_percentage for a in attempts) / completed_count, 1) if completed_count > 0 else 0.0

    recent_attempts = [
        {
            "id": a.id,
            "title": a.assessment.title if a.assessment else "Skill Assessment",
            "category": a.assessment.category if a.assessment else "General",
            "score": a.score_percentage,
            "passed": bool(a.passed),
            "completed_at": a.completed_at
        }
        for a in attempts[:5]
    ]

    # 3. Fetch Interview Practice Stats
    stmt_interview = (
        select(StudentInterviewProgress)
        .where(StudentInterviewProgress.student_id == profile.id)
    )
    res_int = await db.execute(stmt_interview)
    int_progress = res_int.scalars().all()

    practiced_count = len(int_progress)
    mastered_count = sum(1 for p in int_progress if p.status == "MASTERED")
    rated = [p.self_rating for p in int_progress if p.self_rating]
    avg_rating = round(sum(rated) / len(rated), 1) if rated else 0.0

    # 4. Fetch Readiness Progression
    stmt_rh = (
        select(ReadinessHistory)
        .where(ReadinessHistory.student_id == profile.id)
        .order_by(ReadinessHistory.recorded_at.asc())
    )
    res_rh = await db.execute(stmt_rh)
    history_records = res_rh.scalars().all()
    trajectory = [
        {"score": h.score, "recorded_at": h.recorded_at, "role": h.role_title}
        for h in history_records
    ]

    # 5. Calculate Multi-Source Skills Breakdown
    all_skills = base_profile.skills
    resume_skills_count = sum(1 for s in all_skills if s.source == "resume")
    verified_skills_count = sum(1 for s in all_skills if s.verified or s.source in ["verified", "assessment"])
    manual_skills_count = sum(1 for s in all_skills if s.source == "manual")

    readiness = profile.readiness_score or 65.0
    readiness_tier = "Ready for Placement" if readiness >= 75.0 else ("Near Ready" if readiness >= 60.0 else "Needs Focused Prep")

    return {
        "profile": base_profile,
        "latest_resume": resume_data,
        "skills_summary": {
            "total_skills": len(all_skills),
            "resume_extracted_count": resume_skills_count,
            "verified_count": verified_skills_count,
            "manual_count": manual_skills_count,
            "skills": all_skills
        },
        "projects": base_profile.projects,
        "certifications": base_profile.certifications,
        "assessments_summary": {
            "completed_tests": completed_count,
            "passed_tests": passed_count,
            "average_score": avg_score,
            "recent_attempts": recent_attempts
        },
        "interview_summary": {
            "questions_practiced": practiced_count,
            "mastered_questions": mastered_count,
            "average_rating": avg_rating
        },
        "readiness_overview": {
            "score": readiness,
            "tier": readiness_tier,
            "target_role": profile.target_role_title,
            "trajectory": trajectory
        }
    }

@router.post("/me/sync-resume")
async def sync_resume_to_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    1-Click Auto-Synchronization from latest extracted resume:
    1. Synchronizes all extracted skills not yet present in profile
    2. Populates detected project/internship sections if missing
    3. Updates bio if currently empty
    """
    profile = await ProfileService.get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    stmt = (
        select(Resume)
        .where(Resume.student_id == profile.id)
        .order_by(Resume.uploaded_at.desc())
        .options(selectinload(Resume.extractions))
    )
    res = await db.execute(stmt)
    latest_resume = res.scalars().first()

    if not latest_resume or not latest_resume.extractions:
        return {
            "status": "warning",
            "message": "No resume found. Please upload a PDF resume first to enable auto-sync.",
            "skills_added": 0,
            "projects_added": 0,
            "bio_updated": False
        }

    ext = latest_resume.extractions[0]
    parsed_skills = []
    sections = {}
    try:
        if ext.parsed_skills:
            parsed_skills = json.loads(ext.parsed_skills)
        if ext.sections:
            sections = json.loads(ext.sections)
    except Exception:
        pass

    # 1. Sync Skills
    skills_added = 0
    existing_skills_res = await db.execute(
        select(StudentSkill).where(StudentSkill.student_id == profile.id)
    )
    existing_skills_map = {s.skill_name.lower(): s for s in existing_skills_res.scalars().all()}

    for s in parsed_skills:
        s_name = s.get("name", "").strip()
        if s_name and s_name.lower() not in existing_skills_map:
            conf = s.get("confidence", 0.75)
            new_sk = StudentSkill(
                student_id=profile.id,
                skill_name=s_name,
                proficiency="Intermediate",
                proficiency_level=int(conf * 80),
                source="resume",
                verified=False
            )
            db.add(new_sk)
            skills_added += 1

    # 2. Sync Projects if none exist
    projects_added = 0
    existing_proj_res = await db.execute(
        select(Project).where(Project.student_id == profile.id)
    )
    if len(existing_proj_res.scalars().all()) == 0:
        proj_text = sections.get("projects") or sections.get("experience")
        if proj_text and len(proj_text.strip()) > 30:
            lines = [l.strip() for l in proj_text.splitlines() if l.strip()]
            proj_title = lines[0][:150] if lines else "Resume Highlight Project"
            proj_desc = "\n".join(lines[1:5]) if len(lines) > 1 else proj_text[:300]
            new_proj = Project(
                student_id=profile.id,
                title=proj_title,
                description=proj_desc,
                technologies=json.dumps([sk.get("name") for sk in parsed_skills[:4]]),
                github_url=None,
                live_url=None
            )
            db.add(new_proj)
            projects_added += 1

    # 3. Update Bio if empty
    bio_updated = False
    if not profile.bio or len(profile.bio.strip()) < 10:
        header_text = sections.get("header") or ""
        skills_str = ", ".join([s.get("name") for s in parsed_skills[:5]])
        summary_bio = f"Student specializing in {profile.target_role_title}. Proficient in {skills_str}."
        profile.bio = summary_bio
        bio_updated = True

    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully integrated resume intelligence! Synced {skills_added} skills and {projects_added} projects.",
        "skills_added": skills_added,
        "projects_added": projects_added,
        "bio_updated": bio_updated
    }
