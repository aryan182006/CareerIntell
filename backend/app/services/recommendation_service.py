import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.models.student import StudentProfile
    from app.models.roadmap import LearningResource
    from app.services.matching_service import MatchingService
except ImportError:
    from backend.app.models.student import StudentProfile
    from backend.app.models.roadmap import LearningResource
    from backend.app.services.matching_service import MatchingService

class RecommendationService:
    @staticmethod
    async def get_recommendations(db: AsyncSession, profile: StudentProfile) -> List[Dict[str, Any]]:
        # 1. Analyze gaps for target role
        gaps_data = await MatchingService.analyze_skill_gaps(
            db, profile.id, role_id=profile.target_role_id, role_title=profile.target_role_title
        )

        recommendations = []

        # Find learning resources for missing/partial skills
        missing_skills = [g for g in gaps_data.get("gaps", []) if g["status"] in ["MISSING", "PARTIAL"]]

        # Prioritize: Required MISSING -> Required PARTIAL -> Preferred MISSING
        for item in missing_skills[:6]:
            skill_name = item["skill_name"]
            is_req = item["importance"] == "Required"
            is_missing = item["status"] == "MISSING"

            priority = "Critical" if (is_req and is_missing) else ("High" if is_req else "Medium")

            # Look up learning resource
            res_stmt = select(LearningResource).where(LearningResource.skill_name.ilike(skill_name))
            res_result = await db.execute(res_stmt)
            learning_res = res_result.scalars().first()

            action_url = learning_res.url if learning_res else f"https://www.google.com/search?q=learn+{skill_name.replace(' ', '+')}"

            recommendations.append({
                "id": str(uuid.uuid4()),
                "type": "skill",
                "title": f"Master {skill_name} ({'Required' if is_req else 'Preferred'} for {profile.target_role_title})",
                "description": f"Close your {item['status'].lower()} gap in {skill_name}. Target proficiency level: {item['required_level']}%.",
                "priority": priority,
                "action_url": action_url
            })

        # Project recommendation based on target role
        target_role = profile.target_role_title.lower()
        if "data scientist" in target_role or "analyst" in target_role:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "type": "project",
                "title": "Build an End-to-End Predictive Analytics Pipeline",
                "description": "Demonstrate data wrangling, exploratory analysis, ML modeling, and interactive visualization on a real-world Kaggle/HuggingFace dataset.",
                "priority": "High",
                "action_url": "https://www.kaggle.com/datasets"
            })
        elif "full stack" in target_role:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "type": "project",
                "title": "Deploy Full Stack SaaS with Authentication & DB",
                "description": "Construct a responsive React frontend paired with a modular REST API and relational database persistence with JWT auth.",
                "priority": "High",
                "action_url": "https://github.com"
            })
        elif "devops" in target_role or "cloud" in target_role:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "type": "project",
                "title": "Containerize & Deploy Multi-Service App with Kubernetes",
                "description": "Write Dockerfiles, Compose specs, Helm charts, and a GitHub Actions CI/CD deployment pipeline.",
                "priority": "High",
                "action_url": "https://kubernetes.io/docs/tutorials/"
            })

        # Assessment recommendation
        recommendations.append({
            "id": str(uuid.uuid4()),
            "type": "resource",
            "title": "Take Verified Skill Assessment",
            "description": "Validate your proficiency with our timed MCQ assessments to boost your placement readiness score.",
            "priority": "Medium",
            "action_url": "/assessments"
        })

        return recommendations
