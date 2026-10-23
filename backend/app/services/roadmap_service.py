import json
from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.models.student import StudentProfile
    from app.models.roadmap import Roadmap, RoadmapItem, LearningResource
    from app.services.matching_service import MatchingService
except ImportError:
    from backend.app.models.student import StudentProfile
    from backend.app.models.roadmap import Roadmap, RoadmapItem, LearningResource
    from backend.app.services.matching_service import MatchingService

class RoadmapService:
    @staticmethod
    async def get_or_create_roadmap(db: AsyncSession, profile: StudentProfile) -> Roadmap:
        # Check if roadmap exists for current target role
        stmt = (
            select(Roadmap)
            .where(
                Roadmap.student_id == profile.id,
                Roadmap.target_role_title == profile.target_role_title
            )
            .options(selectinload(Roadmap.items))
        )
        res = await db.execute(stmt)
        roadmap = res.scalars().first()

        if roadmap and roadmap.items:
            return roadmap

        # Create new roadmap based on role and skill gaps
        gaps_data = await MatchingService.analyze_skill_gaps(
            db, profile.id, role_id=profile.target_role_id, role_title=profile.target_role_title
        )
        missing_skills = [g["skill_name"] for g in gaps_data.get("gaps", []) if g["status"] == "MISSING"]
        partial_skills = [g["skill_name"] for g in gaps_data.get("gaps", []) if g["status"] == "PARTIAL"]

        new_roadmap = Roadmap(
            student_id=profile.id,
            target_role_title=profile.target_role_title,
            completion_percentage=0.0
        )
        db.add(new_roadmap)
        await db.flush()

        # Build 4 cohesive phases
        target_role = profile.target_role_title

        # Phase 1: Core Fundamentals & Prerequisite Tools
        items_p1 = [
            ("Core Language Proficiency", f"Deepen syntax, idioms, and algorithmic patterns for {target_role}.", "Programming", "2 weeks"),
            ("Data Structures & Complexity Analysis", "Master arrays, hash maps, trees, and Big-O computational time complexity.", "Core CS", "2 weeks")
        ]

        # Phase 2: Missing & Partial Skills Focus
        items_p2 = []
        if missing_skills:
            top_missing = missing_skills[:2]
            for s in top_missing:
                items_p2.append((f"Intensive Study: {s}", f"Bridge fundamental knowledge gap in {s} required for {target_role}.", "Technical", "3 weeks"))
        if partial_skills:
            top_partial = partial_skills[0]
            items_p2.append((f"Advanced Practice: {top_partial}", f"Elevate proficiency from intermediate to professional mastery in {top_partial}.", "Technical", "2 weeks"))
        if not items_p2:
            items_p2.append(("Advanced Frameworks & Tooling", f"Master ecosystem tools and industry frameworks for {target_role}.", "Technical", "3 weeks"))

        # Phase 3: Applied Systems & Portfolio Projects
        items_p3 = [
            ("Production Capstone Project", f"Design and implement a full-scale portfolio project tailored for {target_role}.", "Project", "4 weeks"),
            ("Deployment & Cloud Infrastructure", "Containerize with Docker and set up automated testing and deployment.", "DevOps", "2 weeks")
        ]

        # Phase 4: Placement Readiness & Interview Preparation
        items_p4 = [
            ("Technical Interview Simulations", "Timed MCQ assessments and live problem-solving practice.", "Assessments", "2 weeks"),
            ("Resume Optimization & ATS Alignment", "Refine project impact bullet points and tailor resume keywords to job postings.", "Career", "1 week")
        ]

        phases = [
            ("Phase 1: Foundations", items_p1),
            ("Phase 2: Core Competencies", items_p2),
            ("Phase 3: Portfolio & Production", items_p3),
            ("Phase 4: Placement Readiness", items_p4)
        ]

        order_idx = 0
        for phase_name, items in phases:
            for title, desc, cat, dur in items:
                # Find matching resource if any
                res_list = []
                r_stmt = select(LearningResource).where(LearningResource.title.ilike(f"%{title.split(':')[0]}%"))
                r_res = await db.execute(r_stmt)
                r_item = r_res.scalars().first()
                if r_item:
                    res_list.append({
                        "title": r_item.title,
                        "provider": r_item.provider,
                        "url": r_item.url,
                        "type": r_item.type
                    })

                roadmap_item = RoadmapItem(
                    roadmap_id=new_roadmap.id,
                    phase=phase_name,
                    title=title,
                    description=desc,
                    category=cat,
                    duration=dur,
                    status="NOT_STARTED",
                    order_index=order_idx,
                    resources=json.dumps(res_list)
                )
                db.add(roadmap_item)
                order_idx += 1

        await db.commit()

        # Reload with items
        stmt_reload = (
            select(Roadmap)
            .where(Roadmap.id == new_roadmap.id)
            .options(selectinload(Roadmap.items))
        )
        res_reload = await db.execute(stmt_reload)
        return res_reload.scalars().first()

    @staticmethod
    async def update_item_status(db: AsyncSession, item_id: str, new_status: str) -> RoadmapItem:
        stmt = select(RoadmapItem).where(RoadmapItem.id == item_id)
        res = await db.execute(stmt)
        item = res.scalars().first()
        if not item:
            raise ValueError("Roadmap item not found")

        item.status = new_status
        await db.flush()

        # Re-compute roadmap completion percentage
        all_items_res = await db.execute(
            select(RoadmapItem).where(RoadmapItem.roadmap_id == item.roadmap_id)
        )
        items = all_items_res.scalars().all()
        if items:
            completed = sum(1 for i in items if i.status == "COMPLETED")
            in_progress = sum(0.5 for i in items if i.status == "IN_PROGRESS")
            percentage = round(((completed + in_progress) / len(items)) * 100, 1)

            roadmap_stmt = select(Roadmap).where(Roadmap.id == item.roadmap_id)
            r_res = await db.execute(roadmap_stmt)
            roadmap = r_res.scalars().first()
            if roadmap:
                roadmap.completion_percentage = percentage

        await db.commit()
        await db.refresh(item)
        return item
