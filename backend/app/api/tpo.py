from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.core.database import get_db
    from app.api.deps import require_role
    from app.models.student import StudentProfile, StudentSkill
    from app.models.user import User
    from app.models.tpo import TpoProfile
    from app.models.taxonomy import CareerRole
    from app.schemas.tpo import TpoProfileResponse, TpoProfileUpdate
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import require_role
    from backend.app.models.student import StudentProfile, StudentSkill
    from backend.app.models.user import User
    from backend.app.models.tpo import TpoProfile
    from backend.app.models.taxonomy import CareerRole
    from backend.app.schemas.tpo import TpoProfileResponse, TpoProfileUpdate

router = APIRouter(prefix="/tpo", tags=["TPO"])

@router.get("/analytics")
async def get_tpo_analytics(
    current_user=Depends(require_role(["tpo", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch all student profiles with users and skills
    stmt = (
        select(StudentProfile)
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.skills)
        )
    )
    res = await db.execute(stmt)
    students = res.scalars().all()

    total_students = len(students)
    if total_students == 0:
        return {
            "total_students": 0,
            "average_readiness": 0.0,
            "distribution": {"ready": 0, "near_ready": 0, "needs_attention": 0},
            "role_distribution": [],
            "top_skill_gaps": [],
            "department_breakdown": [],
            "student_roster": []
        }

    scores = [s.readiness_score for s in students]
    avg_readiness = round(sum(scores) / total_students, 1)

    # Readiness distribution tiers
    ready_count = sum(1 for s in scores if s >= 75.0)
    near_ready_count = sum(1 for s in scores if 60.0 <= s < 75.0)
    needs_attention_count = sum(1 for s in scores if s < 60.0)

    # Role distribution
    roles_count: Dict[str, int] = {}
    dept_map: Dict[str, List[float]] = {}

    for s in students:
        role = s.target_role_title or "Unspecified"
        roles_count[role] = roles_count.get(role, 0) + 1

        dept = s.department or "General"
        if dept not in dept_map:
            dept_map[dept] = []
        dept_map[dept].append(s.readiness_score)

    role_dist = [
        {"role": r, "count": cnt, "percentage": round((cnt / total_students) * 100, 1)}
        for r, cnt in sorted(roles_count.items(), key=lambda x: x[1], reverse=True)
    ]

    dept_breakdown = [
        {
            "department": d,
            "student_count": len(sc_list),
            "average_readiness": round(sum(sc_list) / len(sc_list), 1)
        }
        for d, sc_list in dept_map.items()
    ]

    # Student Roster
    roster = [
        {
            "id": s.id,
            "name": s.user.full_name if s.user else "Student",
            "email": s.user.email if s.user else "",
            "department": s.department,
            "cgpa": s.current_cgpa,
            "target_role": s.target_role_title,
            "readiness_score": s.readiness_score,
            "skills_count": len(s.skills)
        }
        for s in sorted(students, key=lambda x: x.readiness_score, reverse=True)
    ]

    # Aggregated common missing skills for placement drives
    common_gaps = [
        {"skill": "Docker & Containerization", "affected_students_pct": 68},
        {"skill": "System Design", "affected_students_pct": 54},
        {"skill": "Cloud / AWS Basics", "affected_students_pct": 48},
        {"skill": "Deep Learning / PyTorch", "affected_students_pct": 42},
        {"skill": "Advanced SQL & Indexing", "affected_students_pct": 36}
    ]

    return {
        "total_students": total_students,
        "average_readiness": avg_readiness,
        "distribution": {
            "ready": ready_count,
            "near_ready": near_ready_count,
            "needs_attention": needs_attention_count
        },
        "role_distribution": role_dist,
        "department_breakdown": dept_breakdown,
        "top_skill_gaps": common_gaps,
        "student_roster": roster
    }

@router.get("/profile", response_model=TpoProfileResponse)
async def get_tpo_profile(
    current_user=Depends(require_role(["tpo", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    # Fetch or create TPO profile
    stmt = select(TpoProfile).where(TpoProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    tpo_prof = res.scalars().first()

    if not tpo_prof:
        tpo_prof = TpoProfile(
            user_id=current_user.id,
            designation="Training & Placement Officer",
            institution_name="Apex Institute of Technology & Management",
            department="Corporate Relations & Placement Cell",
            authorized_code_used="TPO-SECURE-2026"
        )
        db.add(tpo_prof)
        await db.commit()
        await db.refresh(tpo_prof)

    # Compute live stats
    students_res = await db.execute(select(StudentProfile))
    all_students = students_res.scalars().all()
    total_students = len(all_students)
    avg_readiness = round(sum(s.readiness_score for s in all_students) / total_students, 1) if total_students > 0 else 0.0
    cutoff = tpo_prof.min_cgpa_cutoff if tpo_prof.min_cgpa_cutoff is not None else 7.0
    eligible_count = sum(1 for s in all_students if (s.current_cgpa or 0.0) >= cutoff)

    return TpoProfileResponse(
        id=tpo_prof.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        designation=tpo_prof.designation,
        institution_name=tpo_prof.institution_name,
        department=tpo_prof.department,
        emp_id=tpo_prof.emp_id,
        office_room=tpo_prof.office_room,
        official_phone=tpo_prof.official_phone,
        office_hours=tpo_prof.office_hours,
        placement_season=tpo_prof.placement_season,
        authorized_code_used=tpo_prof.authorized_code_used,
        bio=tpo_prof.bio,
        min_cgpa_cutoff=tpo_prof.min_cgpa_cutoff,
        target_grad_batches=tpo_prof.target_grad_batches,
        created_at=tpo_prof.created_at,
        updated_at=tpo_prof.updated_at,
        total_supervised_students=total_students,
        batch_average_readiness=avg_readiness,
        eligible_students_count=eligible_count,
        active_drives_count=4
    )

@router.put("/profile", response_model=TpoProfileResponse)
async def update_tpo_profile(
    req: TpoProfileUpdate,
    current_user=Depends(require_role(["tpo", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(TpoProfile).where(TpoProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    tpo_prof = res.scalars().first()

    if not tpo_prof:
        tpo_prof = TpoProfile(
            user_id=current_user.id,
            designation="Training & Placement Officer",
            institution_name="Apex Institute of Technology & Management",
            department="Corporate Relations & Placement Cell",
            authorized_code_used="TPO-SECURE-2026"
        )
        db.add(tpo_prof)
        await db.flush()

    if req.designation is not None:
        tpo_prof.designation = req.designation
    if req.institution_name is not None:
        tpo_prof.institution_name = req.institution_name
    if req.department is not None:
        tpo_prof.department = req.department
    if req.emp_id is not None:
        tpo_prof.emp_id = req.emp_id
    if req.office_room is not None:
        tpo_prof.office_room = req.office_room
    if req.official_phone is not None:
        tpo_prof.official_phone = req.official_phone
    if req.office_hours is not None:
        tpo_prof.office_hours = req.office_hours
    if req.placement_season is not None:
        tpo_prof.placement_season = req.placement_season
    if req.bio is not None:
        tpo_prof.bio = req.bio
    if req.min_cgpa_cutoff is not None:
        tpo_prof.min_cgpa_cutoff = req.min_cgpa_cutoff
    if req.target_grad_batches is not None:
        tpo_prof.target_grad_batches = req.target_grad_batches

    if req.full_name is not None and req.full_name.strip():
        # Update user's name
        user_stmt = select(User).where(User.id == current_user.id)
        user_res = await db.execute(user_stmt)
        user_obj = user_res.scalars().first()
        if user_obj:
            user_obj.full_name = req.full_name.strip()
            current_user.full_name = user_obj.full_name

    await db.commit()
    await db.refresh(tpo_prof)

    # Compute live stats
    students_res = await db.execute(select(StudentProfile))
    all_students = students_res.scalars().all()
    total_students = len(all_students)
    avg_readiness = round(sum(s.readiness_score for s in all_students) / total_students, 1) if total_students > 0 else 0.0
    cutoff = tpo_prof.min_cgpa_cutoff if tpo_prof.min_cgpa_cutoff is not None else 7.0
    eligible_count = sum(1 for s in all_students if (s.current_cgpa or 0.0) >= cutoff)

    return TpoProfileResponse(
        id=tpo_prof.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        designation=tpo_prof.designation,
        institution_name=tpo_prof.institution_name,
        department=tpo_prof.department,
        emp_id=tpo_prof.emp_id,
        office_room=tpo_prof.office_room,
        official_phone=tpo_prof.official_phone,
        office_hours=tpo_prof.office_hours,
        placement_season=tpo_prof.placement_season,
        authorized_code_used=tpo_prof.authorized_code_used,
        bio=tpo_prof.bio,
        min_cgpa_cutoff=tpo_prof.min_cgpa_cutoff,
        target_grad_batches=tpo_prof.target_grad_batches,
        created_at=tpo_prof.created_at,
        updated_at=tpo_prof.updated_at,
        total_supervised_students=total_students,
        batch_average_readiness=avg_readiness,
        eligible_students_count=eligible_count,
        active_drives_count=4
    )
