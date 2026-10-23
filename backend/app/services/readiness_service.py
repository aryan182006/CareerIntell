from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.student import StudentProfile, StudentSkill, Project, Certification
from app.models.resume import Resume
from app.models.assessment import AssessmentAttempt
from app.models.interview import StudentInterviewProgress
from app.models.intelligence import ReadinessAssessment, ReadinessHistory
from app.services.matching_service import MatchingService

class ReadinessService:
    @staticmethod
    async def compute_readiness(db: AsyncSession, profile: StudentProfile) -> Dict[str, Any]:
        # 1. Technical Skills Score (Weight 40%)
        # Based on average proficiency of skills + quantity of skills
        stmt_skills = select(StudentSkill).where(StudentSkill.student_id == profile.id)
        res_skills = await db.execute(stmt_skills)
        skills = res_skills.scalars().all()

        if skills:
            avg_prof = sum(s.proficiency_level for s in skills) / len(skills)
            skill_count_factor = min(1.0, len(skills) / 8.0)  # 8 skills is full breadth
            tech_score = round(avg_prof * 0.7 + (skill_count_factor * 100) * 0.3, 1)
        else:
            tech_score = 30.0

        # 2. Role Match Score (Weight 25%)
        gap_analysis = await MatchingService.analyze_skill_gaps(
            db, profile.id, role_id=profile.target_role_id, role_title=profile.target_role_title
        )
        role_match_score = gap_analysis.get("match_score", 50.0)

        # 3. Projects Score (Weight 15%)
        stmt_proj = select(Project).where(Project.student_id == profile.id)
        res_proj = await db.execute(stmt_proj)
        projects = res_proj.scalars().all()
        # 1 project = 60%, 2 projects = 85%, 3+ = 100%
        if len(projects) >= 3:
            project_score = 95.0
        elif len(projects) == 2:
            project_score = 85.0
        elif len(projects) == 1:
            project_score = 65.0
        else:
            project_score = 25.0

        # 4. Resume Quality (Weight 10%)
        stmt_res = select(Resume).where(Resume.student_id == profile.id)
        res_res = await db.execute(stmt_res)
        resumes = res_res.scalars().all()
        resume_score = 85.0 if resumes else 30.0

        # 5. Assessment & Interview Score (Weight 10%)
        stmt_att = select(AssessmentAttempt).where(AssessmentAttempt.student_id == profile.id)
        res_att = await db.execute(stmt_att)
        attempts = res_att.scalars().all()
        base_mcq = (sum(a.score_percentage for a in attempts) / len(attempts)) if attempts else 45.0

        # Interview practice bonus
        stmt_int = select(StudentInterviewProgress).where(StudentInterviewProgress.student_id == profile.id)
        res_int = await db.execute(stmt_int)
        interview_progresses = res_int.scalars().all()
        mastered_int = sum(1 for p in interview_progresses if p.status == "MASTERED")
        practicing_int = sum(1 for p in interview_progresses if p.status == "PRACTICING")
        interview_bonus = min(25.0, (mastered_int * 5.0) + (practicing_int * 2.0))

        assessment_score = min(100.0, round((base_mcq * 0.75) + interview_bonus, 1))

        # Weighted Overall Score
        overall = round(
            (tech_score * 0.40) +
            (role_match_score * 0.25) +
            (project_score * 0.15) +
            (resume_score * 0.10) +
            (assessment_score * 0.10),
            1
        )

        # Generate natural language summary
        strengths = []
        improvements = []

        if tech_score >= 75:
            strengths.append("strong technical foundation across claimed tools")
        else:
            improvements.append("expanding depth in core programming and analytics competencies")

        if role_match_score >= 75:
            strengths.append(f"high alignment ({role_match_score}%) with {profile.target_role_title} requirements")
        else:
            improvements.append(f"bridging key required skill gaps for {profile.target_role_title}")

        if project_score >= 80:
            strengths.append(f"demonstrated practical experience across {len(projects)} portfolio projects")
        else:
            improvements.append("building more end-to-end projects with production deployments")

        if mastered_int >= 4:
            strengths.append(f"proactive technical interview readiness ({mastered_int} company scenarios mastered)")
        elif mastered_int < 2:
            improvements.append("practicing role-specific technical and scenario interview questions")

        if base_mcq < 60:
            improvements.append("taking verified technical assessments to validate competencies")

        explanation = f"Your current readiness score is {overall}%. You demonstrate " + ", ".join(strengths) if strengths else "Profile initialized."
        if improvements:
            explanation += ". Priority areas to accelerate placement readiness include: " + "; ".join(improvements) + "."

        # Update profile score
        profile.readiness_score = overall
        await db.commit()

        # Record point in readiness history if changed or recent point > 7 days old
        history_stmt = (
            select(ReadinessHistory)
            .where(ReadinessHistory.student_id == profile.id)
            .order_by(ReadinessHistory.recorded_at.desc())
        )
        hist_res = await db.execute(history_stmt)
        latest_hist = hist_res.scalars().first()

        now = datetime.now(timezone.utc)
        should_record = True
        if latest_hist:
            # Check if recorded today with identical score
            delta = now - latest_hist.recorded_at.replace(tzinfo=timezone.utc)
            if delta.days < 1 and abs(latest_hist.score - overall) < 0.5:
                should_record = False

        if should_record:
            new_hist = ReadinessHistory(
                student_id=profile.id,
                score=overall,
                role_title=profile.target_role_title,
                recorded_at=now
            )
            db.add(new_hist)
            await db.commit()

        # Load all history for graph
        all_hist_res = await db.execute(
            select(ReadinessHistory)
            .where(ReadinessHistory.student_id == profile.id)
            .order_by(ReadinessHistory.recorded_at.asc())
        )
        all_history = all_hist_res.scalars().all()
        history_list = [
            {"recorded_at": h.recorded_at.isoformat(), "score": h.score, "role_title": h.role_title}
            for h in all_history
        ]

        return {
            "overall_score": overall,
            "target_role": profile.target_role_title,
            "breakdown": {
                "technical_skills": tech_score,
                "role_match": role_match_score,
                "projects": project_score,
                "resume_quality": resume_score,
                "assessments": assessment_score
            },
            "explanation_summary": explanation,
            "history": history_list
        }
