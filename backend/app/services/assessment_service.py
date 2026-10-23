import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.models.assessment import Assessment, Question, AssessmentAttempt
    from app.models.student import StudentProfile, StudentSkill
    from app.services.readiness_service import ReadinessService
except ImportError:
    from backend.app.models.assessment import Assessment, Question, AssessmentAttempt
    from backend.app.models.student import StudentProfile, StudentSkill
    from backend.app.services.readiness_service import ReadinessService

class AssessmentService:
    @staticmethod
    async def list_assessments(db: AsyncSession) -> List[Dict[str, Any]]:
        stmt = select(Assessment).options(selectinload(Assessment.questions))
        res = await db.execute(stmt)
        assessments = res.scalars().all()

        return [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "category": a.category,
                "difficulty": a.difficulty,
                "time_limit_minutes": a.time_limit_minutes,
                "passing_percentage": a.passing_percentage,
                "question_count": len(a.questions)
            }
            for a in assessments
        ]

    @staticmethod
    async def get_assessment_questions(db: AsyncSession, assessment_id: str) -> List[Dict[str, Any]]:
        stmt = select(Question).where(Question.assessment_id == assessment_id)
        res = await db.execute(stmt)
        questions = res.scalars().all()

        results = []
        for q in questions:
            opts = []
            try:
                opts = json.loads(q.options) if q.options else []
            except Exception:
                opts = []

            # Notice: Do NOT reveal correct_option_index or explanation before submission!
            results.append({
                "id": q.id,
                "question_text": q.question_text,
                "options": opts,
                "category": q.category,
                "difficulty": q.difficulty
            })
        return results

    @staticmethod
    async def grade_assessment(
        db: AsyncSession,
        profile: StudentProfile,
        assessment_id: str,
        user_answers: Dict[str, int],
        time_taken_seconds: int
    ) -> Dict[str, Any]:
        stmt_a = select(Assessment).where(Assessment.id == assessment_id).options(selectinload(Assessment.questions))
        res_a = await db.execute(stmt_a)
        assessment = res_a.scalars().first()
        if not assessment:
            raise ValueError("Assessment not found")

        total = len(assessment.questions)
        if total == 0:
            return {"score_percentage": 0, "total_questions": 0, "correct_answers": 0, "passed": False, "feedback": []}

        correct_count = 0
        feedback = []

        for q in assessment.questions:
            chosen = user_answers.get(q.id)
            is_correct = (chosen is not None and chosen == q.correct_option_index)
            if is_correct:
                correct_count += 1

            feedback.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "user_answer_index": chosen,
                "correct_option_index": q.correct_option_index,
                "is_correct": is_correct,
                "explanation": q.explanation
            })

        score_pct = round((correct_count / total) * 100, 1)
        passed = score_pct >= assessment.passing_percentage

        # Store attempt
        attempt = AssessmentAttempt(
            student_id=profile.id,
            assessment_id=assessment.id,
            score_percentage=score_pct,
            total_questions=total,
            correct_answers=correct_count,
            time_taken_seconds=time_taken_seconds,
            user_answers=json.dumps(user_answers),
            passed=1 if passed else 0
        )
        db.add(attempt)

        # If passed, verify/boost student's skill in this category
        if passed:
            skill_name = assessment.category
            sk_stmt = select(StudentSkill).where(
                StudentSkill.student_id == profile.id,
                StudentSkill.skill_name.ilike(skill_name)
            )
            sk_res = await db.execute(sk_stmt)
            sk = sk_res.scalars().first()
            if sk:
                sk.verified = True
                sk.proficiency_level = max(sk.proficiency_level, int(score_pct))
                sk.source = "assessment"
            else:
                new_sk = StudentSkill(
                    student_id=profile.id,
                    skill_name=skill_name,
                    proficiency="Advanced" if score_pct >= 80 else "Intermediate",
                    proficiency_level=int(score_pct),
                    source="assessment",
                    verified=True
                )
                db.add(new_sk)

        await db.commit()
        await db.refresh(attempt)

        # Re-compute readiness
        await ReadinessService.compute_readiness(db, profile)

        return {
            "attempt_id": attempt.id,
            "score_percentage": score_pct,
            "total_questions": total,
            "correct_answers": correct_count,
            "passed": passed,
            "time_taken_seconds": time_taken_seconds,
            "feedback": feedback
        }

    @staticmethod
    async def get_history(db: AsyncSession, profile_id: str) -> List[Dict[str, Any]]:
        stmt = (
            select(AssessmentAttempt)
            .where(AssessmentAttempt.student_id == profile_id)
            .order_by(AssessmentAttempt.completed_at.desc())
            .options(selectinload(AssessmentAttempt.assessment))
        )
        res = await db.execute(stmt)
        attempts = res.scalars().all()

        return [
            {
                "id": att.id,
                "assessment_title": att.assessment.title if att.assessment else "Assessment",
                "category": att.assessment.category if att.assessment else "General",
                "score_percentage": att.score_percentage,
                "passed": bool(att.passed),
                "completed_at": att.completed_at
            }
            for att in attempts
        ]
