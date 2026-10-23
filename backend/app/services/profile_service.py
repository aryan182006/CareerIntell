import json
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.models.user import User
    from app.models.student import StudentProfile, StudentSkill, Project, Certification
    from app.models.taxonomy import Skill, CareerRole
    from app.schemas.student import (
        StudentProfileUpdate, SkillCreate, ProjectCreate, CertificationCreate
    )
except ImportError:
    from backend.app.models.user import User
    from backend.app.models.student import StudentProfile, StudentSkill, Project, Certification
    from backend.app.models.taxonomy import Skill, CareerRole
    from backend.app.schemas.student import (
        StudentProfileUpdate, SkillCreate, ProjectCreate, CertificationCreate
    )

class ProfileService:
    @staticmethod
    async def get_profile_by_user_id(db: AsyncSession, user_id: str) -> Optional[StudentProfile]:
        stmt = (
            select(StudentProfile)
            .where(StudentProfile.user_id == user_id)
            .options(
                selectinload(StudentProfile.user),
                selectinload(StudentProfile.skills),
                selectinload(StudentProfile.projects),
                selectinload(StudentProfile.certifications)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        user_id: str,
        update_data: StudentProfileUpdate
    ) -> StudentProfile:
        profile = await ProfileService.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError("Student profile not found")

        # Update User full_name if provided
        if update_data.full_name is not None and profile.user:
            profile.user.full_name = update_data.full_name

        if update_data.department is not None:
            profile.department = update_data.department
        if update_data.degree is not None:
            profile.degree = update_data.degree
        if update_data.graduation_year is not None:
            profile.graduation_year = update_data.graduation_year
        if update_data.current_cgpa is not None:
            profile.current_cgpa = update_data.current_cgpa
        if update_data.bio is not None:
            profile.bio = update_data.bio
        if update_data.phone is not None:
            profile.phone = update_data.phone
        if update_data.target_role_title is not None:
            profile.target_role_title = update_data.target_role_title
            # Update target_role_id if matching role found
            role_res = await db.execute(
                select(CareerRole).where(CareerRole.title.ilike(update_data.target_role_title))
            )
            r = role_res.scalars().first()
            if r:
                profile.target_role_id = r.id

        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def add_skill(
        db: AsyncSession,
        profile_id: str,
        skill_in: SkillCreate
    ) -> StudentSkill:
        # Match skill taxonomy if exists
        skill_res = await db.execute(
            select(Skill).where(Skill.name.ilike(skill_in.skill_name.strip()))
        )
        tax_skill = skill_res.scalars().first()
        skill_id = tax_skill.id if tax_skill else None
        canonical_name = tax_skill.name if tax_skill else skill_in.skill_name.strip()

        # Check if already added
        existing = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_id == profile_id,
                StudentSkill.skill_name.ilike(canonical_name)
            )
        )
        curr = existing.scalars().first()
        if curr:
            curr.proficiency = skill_in.proficiency or curr.proficiency
            curr.proficiency_level = skill_in.proficiency_level or curr.proficiency_level
            curr.source = skill_in.source or curr.source
            await db.commit()
            await db.refresh(curr)
            return curr

        new_skill = StudentSkill(
            student_id=profile_id,
            skill_id=skill_id,
            skill_name=canonical_name,
            proficiency=skill_in.proficiency or "Intermediate",
            proficiency_level=skill_in.proficiency_level or 70,
            source=skill_in.source or "manual",
            verified=(skill_in.source == "verified")
        )
        db.add(new_skill)
        await db.commit()
        await db.refresh(new_skill)
        return new_skill

    @staticmethod
    async def delete_skill(db: AsyncSession, profile_id: str, skill_id: str) -> bool:
        stmt = delete(StudentSkill).where(
            StudentSkill.student_id == profile_id,
            StudentSkill.id == skill_id
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount > 0

    @staticmethod
    async def add_project(
        db: AsyncSession,
        profile_id: str,
        proj_in: ProjectCreate
    ) -> Project:
        proj = Project(
            student_id=profile_id,
            title=proj_in.title,
            description=proj_in.description,
            technologies=json.dumps(proj_in.technologies),
            github_url=proj_in.github_url,
            live_url=proj_in.live_url
        )
        db.add(proj)
        await db.commit()
        await db.refresh(proj)
        return proj

    @staticmethod
    async def delete_project(db: AsyncSession, profile_id: str, project_id: str) -> bool:
        stmt = delete(Project).where(
            Project.student_id == profile_id,
            Project.id == project_id
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount > 0

    @staticmethod
    async def add_certification(
        db: AsyncSession,
        profile_id: str,
        cert_in: CertificationCreate
    ) -> Certification:
        cert = Certification(
            student_id=profile_id,
            name=cert_in.name,
            issuing_organization=cert_in.issuing_organization,
            issue_date=cert_in.issue_date,
            expiration_date=cert_in.expiration_date,
            credential_id=cert_in.credential_id,
            credential_url=cert_in.credential_url
        )
        db.add(cert)
        await db.commit()
        await db.refresh(cert)
        return cert

    @staticmethod
    async def delete_certification(db: AsyncSession, profile_id: str, cert_id: str) -> bool:
        stmt = delete(Certification).where(
            Certification.student_id == profile_id,
            Certification.id == cert_id
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount > 0
