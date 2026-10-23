import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.models.interview import InterviewQuestion, StudentInterviewProgress
    from app.models.student import StudentProfile
    from app.services.matching_service import MatchingService
except ImportError:
    from backend.app.models.interview import InterviewQuestion, StudentInterviewProgress
    from backend.app.models.student import StudentProfile
    from backend.app.services.matching_service import MatchingService


class InterviewService:
    @staticmethod
    async def get_questions_for_student(
        db: AsyncSession,
        student_id: str,
        role_title: Optional[str] = None,
        round_type: Optional[str] = None,
        company: Optional[str] = None,
        difficulty: Optional[str] = None,
        gap_only: bool = False
    ) -> Dict[str, Any]:
        """
        Retrieves company interview questions dynamically filtered and prioritized
        based on the student's target role and detected skill gaps.
        """
        # 1. Fetch Student Profile
        profile_res = await db.execute(
            select(StudentProfile).where(StudentProfile.id == student_id)
        )
        profile = profile_res.scalars().first()
        active_role = role_title or (profile.target_role_title if profile else "Data Scientist")

        # 2. Extract Student's Missing & Partial Skills to Flag Questions
        missing_skills = set()
        partial_skills = set()
        if profile:
            try:
                gaps_data = await MatchingService.analyze_skill_gaps(
                    db, profile.id, role_id=profile.target_role_id, role_title=active_role
                )
                for g in gaps_data.get("gaps", []):
                    sname = g.get("skill_name", "").lower()
                    if g.get("status") == "MISSING":
                        missing_skills.add(sname)
                    elif g.get("status") == "PARTIAL":
                        partial_skills.add(sname)
            except Exception as e:
                print(f"Warning: Could not compute gaps for interviews: {e}")

        # 3. Build Question Query
        stmt = select(InterviewQuestion).where(
            or_(
                InterviewQuestion.role_title == active_role,
                InterviewQuestion.role_title == "All Roles"
            )
        )

        if round_type and round_type != "ALL":
            stmt = stmt.where(InterviewQuestion.round_type == round_type)

        if difficulty and difficulty != "ALL":
            stmt = stmt.where(InterviewQuestion.difficulty == difficulty)

        q_res = await db.execute(stmt)
        questions = q_res.scalars().all()

        # 4. Fetch Student's Progress Records
        prog_stmt = select(StudentInterviewProgress).where(
            StudentInterviewProgress.student_id == student_id
        )
        prog_res = await db.execute(prog_stmt)
        progress_map = {p.question_id: p for p in prog_res.scalars().all()}

        # 5. Format & Enrich Questions with Skill Gap Indicators
        formatted_list = []
        for q in questions:
            # Check company filter if provided
            tags = json.loads(q.company_tags) if q.company_tags else []
            if company and company != "ALL" and company not in tags:
                continue

            q_skill = q.skill_name.lower()
            is_gap = q_skill in missing_skills or q_skill in partial_skills
            gap_type = "MISSING" if q_skill in missing_skills else ("PARTIAL" if q_skill in partial_skills else None)

            if gap_only and not is_gap:
                continue

            prog = progress_map.get(q.id)
            status = prog.status if prog else "NOT_STARTED"
            self_rating = prog.self_rating if prog else 0
            user_notes = prog.user_notes if prog else ""

            formatted_list.append({
                "id": q.id,
                "role_title": q.role_title,
                "skill_name": q.skill_name,
                "round_type": q.round_type,
                "company_tags": tags,
                "company_tier": q.company_tier,
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "key_concepts": json.loads(q.key_concepts) if q.key_concepts else [],
                "interviewer_criteria": q.interviewer_criteria,
                "model_answer": q.model_answer,
                "tips": q.tips,
                "is_skill_gap": is_gap,
                "gap_type": gap_type,
                "status": status,
                "self_rating": self_rating,
                "user_notes": user_notes,
                "last_practiced_at": prog.last_practiced_at.isoformat() if prog and prog.last_practiced_at else None
            })

        # Sort: Skill gap questions first, then by round type
        formatted_list.sort(key=lambda x: (not x["is_skill_gap"], x["status"] == "MASTERED"))

        # Calculate statistics
        total = len(formatted_list)
        mastered = sum(1 for q in formatted_list if q["status"] == "MASTERED")
        practicing = sum(1 for q in formatted_list if q["status"] == "PRACTICING")
        gaps_count = sum(1 for q in formatted_list if q["is_skill_gap"])

        return {
            "target_role": active_role,
            "total_questions": total,
            "mastered_count": mastered,
            "practicing_count": practicing,
            "skill_gap_questions_count": gaps_count,
            "readiness_percentage": round((mastered / total * 100), 1) if total > 0 else 0.0,
            "questions": formatted_list
        }

    @staticmethod
    async def update_question_progress(
        db: AsyncSession,
        student_id: str,
        question_id: str,
        status: str,
        self_rating: Optional[int] = None,
        user_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Updates a student's practice status or notes for an interview question.
        """
        stmt = select(StudentInterviewProgress).where(
            and_(
                StudentInterviewProgress.student_id == student_id,
                StudentInterviewProgress.question_id == question_id
            )
        )
        res = await db.execute(stmt)
        prog = res.scalars().first()

        now = datetime.now(timezone.utc)
        if not prog:
            prog = StudentInterviewProgress(
                student_id=student_id,
                question_id=question_id,
                status=status,
                self_rating=self_rating or 0,
                user_notes=user_notes,
                last_practiced_at=now
            )
            db.add(prog)
        else:
            prog.status = status
            if self_rating is not None:
                prog.self_rating = self_rating
            if user_notes is not None:
                prog.user_notes = user_notes
            prog.last_practiced_at = now

        await db.commit()
        await db.refresh(prog)

        return {
            "question_id": question_id,
            "status": prog.status,
            "self_rating": prog.self_rating,
            "user_notes": prog.user_notes,
            "last_practiced_at": prog.last_practiced_at.isoformat()
        }

    @staticmethod
    async def get_filter_options(db: AsyncSession) -> Dict[str, Any]:
        """
        Returns list of companies, roles, and round types available in question bank.
        """
        stmt = select(InterviewQuestion)
        res = await db.execute(stmt)
        questions = res.scalars().all()

        companies = set()
        roles = set()
        round_types = set()

        for q in questions:
            roles.add(q.role_title)
            round_types.add(q.round_type)
            if q.company_tags:
                try:
                    for c in json.loads(q.company_tags):
                        companies.add(c)
                except Exception:
                    pass

        return {
            "roles": sorted(list(roles)),
            "companies": sorted(list(companies)),
            "round_types": sorted(list(round_types)),
            "tiers": ["MAANG / Product", "Tier-1 Tech", "Fintech & Startups"],
            "difficulties": ["Beginner", "Intermediate", "Advanced"]
        }
