import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.core.database import get_db
    from app.api.deps import require_role
    from app.models.taxonomy import Skill, SkillAlias, CareerRole, RoleSkill
    from app.models.assessment import Assessment, Question
    from app.models.roadmap import LearningResource
    from app.models.user import User
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.api.deps import require_role
    from backend.app.models.taxonomy import Skill, SkillAlias, CareerRole, RoleSkill
    from backend.app.models.assessment import Assessment, Question
    from backend.app.models.roadmap import LearningResource
    from backend.app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"])

class NewSkillRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    aliases: List[str] = []

class NewRoleRequest(BaseModel):
    title: str
    category: Optional[str] = "Tech"
    description: str
    average_salary_range: Optional[str] = None

class NewQuestionRequest(BaseModel):
    assessment_id: Optional[str] = None
    category: str
    skill_name: Optional[str] = None
    question_text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"

@router.get("/overview")
async def get_system_overview(
    current_user=Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    skills_count = (await db.execute(select(func.count(Skill.id)))).scalar() or 0
    roles_count = (await db.execute(select(func.count(CareerRole.id)))).scalar() or 0
    questions_count = (await db.execute(select(func.count(Question.id)))).scalar() or 0
    resources_count = (await db.execute(select(func.count(LearningResource.id)))).scalar() or 0

    return {
        "users_count": users_count,
        "skills_count": skills_count,
        "roles_count": roles_count,
        "questions_count": questions_count,
        "resources_count": resources_count
    }

@router.post("/skills", status_code=status.HTTP_201_CREATED)
async def create_skill(
    req: NewSkillRequest,
    current_user=Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(Skill).where(Skill.name.ilike(req.name.strip())))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Skill already exists in taxonomy")

    skill = Skill(
        name=req.name.strip(),
        category=req.category.strip(),
        description=req.description
    )
    db.add(skill)
    await db.flush()

    for a in req.aliases:
        alias = SkillAlias(skill_id=skill.id, alias=a.strip().lower())
        db.add(alias)

    await db.commit()
    return {"id": skill.id, "name": skill.name, "category": skill.category}

@router.post("/roles", status_code=status.HTTP_201_CREATED)
async def create_role(
    req: NewRoleRequest,
    current_user=Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(CareerRole).where(CareerRole.title.ilike(req.title.strip())))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Career role already exists")

    role = CareerRole(
        title=req.title.strip(),
        category=req.category,
        description=req.description,
        average_salary_range=req.average_salary_range
    )
    db.add(role)
    await db.commit()
    return {"id": role.id, "title": role.title}

@router.post("/questions", status_code=status.HTTP_201_CREATED)
async def create_question(
    req: NewQuestionRequest,
    current_user=Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    question = Question(
        assessment_id=req.assessment_id,
        category=req.category,
        skill_name=req.skill_name,
        question_text=req.question_text,
        options=json.dumps(req.options),
        correct_option_index=req.correct_option_index,
        explanation=req.explanation,
        difficulty=req.difficulty or "Intermediate"
    )
    db.add(question)
    await db.commit()
    return {"id": question.id, "question_text": question.question_text}
