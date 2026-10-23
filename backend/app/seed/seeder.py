import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import AsyncSessionLocal, init_db
    from app.core.security import get_password_hash
    from app.models.taxonomy import Skill, SkillAlias, CareerRole, RoleSkill
    from app.models.user import User
    from app.models.tpo import TpoProfile
    from app.models.student import StudentProfile, StudentSkill, Project, Certification
    from app.models.roadmap import LearningResource
    from app.models.assessment import Assessment, Question
    from app.models.intelligence import ReadinessHistory
    from app.models.interview import InterviewQuestion, StudentInterviewProgress
    from app.seed.skills_data import SKILLS_DATA
    from app.seed.roles_data import ROLES_DATA
    from app.seed.resources_data import RESOURCES_DATA
    from app.seed.questions_data import ASSESSMENTS_DATA
    from app.seed.interview_data import INTERVIEW_QUESTIONS_DATA
except ImportError:
    from backend.app.core.database import AsyncSessionLocal, init_db
    from backend.app.core.security import get_password_hash
    from backend.app.models.taxonomy import Skill, SkillAlias, CareerRole, RoleSkill
    from backend.app.models.user import User
    from backend.app.models.tpo import TpoProfile
    from backend.app.models.student import StudentProfile, StudentSkill, Project, Certification
    from backend.app.models.roadmap import LearningResource
    from backend.app.models.assessment import Assessment, Question
    from backend.app.models.intelligence import ReadinessHistory
    from backend.app.models.interview import InterviewQuestion, StudentInterviewProgress
    from backend.app.seed.skills_data import SKILLS_DATA
    from backend.app.seed.roles_data import ROLES_DATA
    from backend.app.seed.resources_data import RESOURCES_DATA
    from backend.app.seed.questions_data import ASSESSMENTS_DATA
    from backend.app.seed.interview_data import INTERVIEW_QUESTIONS_DATA

async def seed_skills(session: AsyncSession):
    # Check if skills exist
    result = await session.execute(select(Skill))
    if result.scalars().first():
        print("Skills already seeded.")
        return

    print("Seeding skills taxonomy...")
    for item in SKILLS_DATA:
        skill = Skill(
            name=item["name"],
            category=item["category"],
            description=item.get("description", "")
        )
        session.add(skill)
        await session.flush()

        for alias_name in item.get("aliases", []):
            alias = SkillAlias(
                skill_id=skill.id,
                alias=alias_name.lower().strip()
            )
            session.add(alias)
    await session.commit()
    print("Skills seeded successfully.")

async def seed_roles(session: AsyncSession):
    result = await session.execute(select(CareerRole))
    if result.scalars().first():
        print("Roles already seeded.")
        return

    print("Seeding career roles...")
    # Map skill names to skill IDs
    skills_result = await session.execute(select(Skill))
    skills_map = {s.name.lower(): s.id for s in skills_result.scalars().all()}

    for role_item in ROLES_DATA:
        role = CareerRole(
            title=role_item["title"],
            category=role_item.get("category", "Tech"),
            description=role_item["description"],
            average_salary_range=role_item.get("average_salary_range")
        )
        session.add(role)
        await session.flush()

        for skill_req in role_item["skills"]:
            skill_id = skills_map.get(skill_req["name"].lower())
            if skill_id:
                role_skill = RoleSkill(
                    role_id=role.id,
                    skill_id=skill_id,
                    importance=skill_req.get("importance", "Required"),
                    required_level=skill_req.get("required_level", 75)
                )
                session.add(role_skill)
    await session.commit()
    print("Career roles seeded successfully.")

async def seed_resources(session: AsyncSession):
    result = await session.execute(select(LearningResource))
    if result.scalars().first():
        print("Learning resources already seeded.")
        return

    print("Seeding learning resources...")
    for item in RESOURCES_DATA:
        res = LearningResource(
            skill_name=item["skill_name"],
            title=item["title"],
            provider=item["provider"],
            url=item["url"],
            type=item.get("type", "Course"),
            difficulty=item.get("difficulty", "Intermediate"),
            duration_hours=item.get("duration_hours", 10),
            rating=item.get("rating", 4.5)
        )
        session.add(res)
    await session.commit()
    print("Learning resources seeded successfully.")

async def seed_assessments(session: AsyncSession):
    result = await session.execute(select(Assessment))
    if result.scalars().first():
        print("Assessments already seeded.")
        return

    print("Seeding assessments...")
    for a_data in ASSESSMENTS_DATA:
        assessment = Assessment(
            title=a_data["title"],
            description=a_data["description"],
            category=a_data["category"],
            difficulty=a_data.get("difficulty", "Intermediate"),
            time_limit_minutes=a_data.get("time_limit_minutes", 15),
            passing_percentage=a_data.get("passing_percentage", 60.0)
        )
        session.add(assessment)
        await session.flush()

        for q in a_data.get("questions", []):
            question = Question(
                assessment_id=assessment.id,
                category=a_data["category"],
                skill_name=q.get("skill_name"),
                question_text=q["question_text"],
                options=json.dumps(q["options"]),
                correct_option_index=q["correct_option_index"],
                explanation=q.get("explanation", ""),
                difficulty=q.get("difficulty", "Intermediate")
            )
            session.add(question)
    await session.commit()
    print("Assessments seeded successfully.")

async def seed_users(session: AsyncSession):
    result = await session.execute(select(User).where(User.email == "student@careerintell.com"))
    if result.scalars().first():
        print("Demo users already seeded.")
        return

    print("Seeding demo users...")
    
    # 1. Primary Demo Student: Alex Chen
    student_user = User(
        email="student@careerintell.com",
        hashed_password=get_password_hash("student123"),
        full_name="Alex Chen",
        role="student",
        is_active=True
    )
    session.add(student_user)
    await session.flush()

    # Get Data Scientist role id if available
    role_res = await session.execute(select(CareerRole).where(CareerRole.title == "Data Scientist"))
    ds_role = role_res.scalars().first()
    target_role_id = ds_role.id if ds_role else None

    student_profile = StudentProfile(
        user_id=student_user.id,
        department="Computer Science & Engineering",
        degree="B.Tech Computer Science",
        graduation_year=2026,
        current_cgpa=8.8,
        bio="Aspiring Data Scientist with strong foundational skills in Python, Machine Learning, and SQL. Actively building end-to-end data analytics and predictive models.",
        phone="+91 98765 43210",
        target_role_id=target_role_id,
        target_role_title="Data Scientist",
        readiness_score=78.5
    )
    session.add(student_profile)
    await session.flush()

    # Seed sample skills for Alex
    sample_skills = [
        {"name": "Python", "proficiency": "Advanced", "level": 85, "source": "verified"},
        {"name": "SQL", "proficiency": "Intermediate", "level": 75, "source": "assessment"},
        {"name": "Machine Learning", "proficiency": "Advanced", "level": 82, "source": "verified"},
        {"name": "Pandas", "proficiency": "Advanced", "level": 80, "source": "manual"},
        {"name": "NumPy", "proficiency": "Intermediate", "level": 78, "source": "manual"},
        {"name": "Scikit-Learn", "proficiency": "Intermediate", "level": 75, "source": "manual"},
        {"name": "Data Analysis", "proficiency": "Advanced", "level": 85, "source": "resume"},
        {"name": "Data Visualization", "proficiency": "Intermediate", "level": 70, "source": "manual"},
        {"name": "Git", "proficiency": "Intermediate", "level": 75, "source": "resume"},
        {"name": "Deep Learning", "proficiency": "Beginner", "level": 45, "source": "manual"}
    ]
    for s in sample_skills:
        sk = StudentSkill(
            student_id=student_profile.id,
            skill_name=s["name"],
            proficiency=s["proficiency"],
            proficiency_level=s["level"],
            source=s["source"],
            verified=(s["source"] == "verified")
        )
        session.add(sk)

    # Seed sample projects for Alex
    p1 = Project(
        student_id=student_profile.id,
        title="Customer Churn Prediction Platform",
        description="Built an end-to-end machine learning model with Random Forest and XGBoost to predict telecommunications churn with 89% precision. Deployed interactive Streamlit dashboard.",
        technologies=json.dumps(["Python", "Machine Learning", "Scikit-Learn", "Pandas"]),
        github_url="https://github.com/example/churn-prediction",
        live_url="https://churn-predictor.example.com"
    )
    p2 = Project(
        student_id=student_profile.id,
        title="Retail Sales Analytics & Forecast Pipeline",
        description="Engineered automated data ingestion and aggregation pipeline in PostgreSQL with Python ETL scripts; visualized store performance trends and seasonal anomalies.",
        technologies=json.dumps(["Python", "SQL", "Data Analysis", "Matplotlib"]),
        github_url="https://github.com/example/sales-analytics"
    )
    session.add(p1)
    session.add(p2)

    # Seed sample certification
    cert = Certification(
        student_id=student_profile.id,
        name="IBM Data Science Professional Certificate",
        issuing_organization="Coursera / IBM",
        issue_date="2025-06",
        expiration_date="2028-06",
        credential_id="IBM-DS-994821",
        credential_url="https://coursera.org/verify/professional-cert/IBM-DS"
    )
    session.add(cert)

    # Seed readiness history (showing progression over last 4 months)
    now = datetime.now(timezone.utc)
    for i, score in enumerate([62.0, 68.0, 73.0, 78.5]):
        rh = ReadinessHistory(
            student_id=student_profile.id,
            score=score,
            role_title="Data Scientist",
            recorded_at=now - timedelta(days=(3 - i) * 30)
        )
        session.add(rh)

    # 2. TPO User: Dr. Priya Sharma
    tpo_user = User(
        email="tpo@careerintell.com",
        hashed_password=get_password_hash("tpo123"),
        full_name="Dr. Priya Sharma",
        role="tpo",
        is_active=True
    )
    session.add(tpo_user)
    await session.flush()

    tpo_prof = TpoProfile(
        user_id=tpo_user.id,
        designation="Head of Training & Placement",
        institution_name="Apex Institute of Technology & Management",
        department="Corporate Relations & Placement Cell",
        emp_id="TPO-DIR-2024",
        office_room="Admin Block, Directorate of Corporate Relations Room 204",
        official_phone="+91 98765 12340",
        office_hours="Mon - Fri, 9:00 AM - 5:30 PM",
        placement_season="2025 - 2026 Placement Season",
        authorized_code_used="TPO-SECURE-2026",
        bio="Director of Training & Placements with 14+ years fostering institutional partnerships with Fortune 500 tech firms and unicorn startups.",
        min_cgpa_cutoff=7.0,
        target_grad_batches="2025, 2026, 2027"
    )
    session.add(tpo_prof)

    # 3. Admin User: System Administrator
    admin_user = User(
        email="admin@careerintell.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin Director",
        role="admin",
        is_active=True
    )
    session.add(admin_user)

    # 4. Additional Sample Students for TPO Aggregated Analytics
    additional_students = [
        ("Sarah Jenkins", "sarah.j@college.edu", "Computer Science", 8.4, "Full Stack Developer", 84.0),
        ("Rohan Verma", "rohan.v@college.edu", "Information Technology", 7.9, "Cloud / DevOps Engineer", 71.0),
        ("Ananya Patel", "ananya.p@college.edu", "Data Science", 9.1, "Data Scientist", 91.5),
        ("Kavita Rao", "kavita.r@college.edu", "Computer Science", 7.5, "Data Analyst", 66.0),
        ("David Miller", "david.m@college.edu", "Electronics & Comm", 8.0, "Machine Learning Engineer", 75.0)
    ]

    for name, email, dept, cgpa, target_role, readiness in additional_students:
        u = User(
            email=email,
            hashed_password=get_password_hash("student123"),
            full_name=name,
            role="student",
            is_active=True
        )
        session.add(u)
        await session.flush()

        sp = StudentProfile(
            user_id=u.id,
            department=dept,
            degree="B.Tech",
            graduation_year=2026,
            current_cgpa=cgpa,
            bio=f"Student interested in {target_role}.",
            target_role_title=target_role,
            readiness_score=readiness
        )
        session.add(sp)
        await session.flush()

        # Add readiness history for this student
        for j, sc in enumerate([readiness - 12, readiness - 6, readiness]):
            session.add(ReadinessHistory(
                student_id=sp.id,
                score=max(30.0, sc),
                role_title=target_role,
                recorded_at=now - timedelta(days=(2 - j) * 30)
            ))

    await session.commit()
    print("Users and student profiles seeded successfully.")

async def seed_interview_questions(session: AsyncSession):
    result = await session.execute(select(InterviewQuestion))
    if result.scalars().first():
        print("Interview questions already seeded.")
        return

    print("Seeding company interview questions bank...")
    for item in INTERVIEW_QUESTIONS_DATA:
        # Match role_id if career role exists
        role_res = await session.execute(select(CareerRole).where(CareerRole.title == item["role_title"]))
        role_obj = role_res.scalars().first()
        role_id = role_obj.id if role_obj else None

        question = InterviewQuestion(
            role_id=role_id,
            role_title=item["role_title"],
            skill_name=item["skill_name"],
            round_type=item["round_type"],
            company_tags=json.dumps(item["company_tags"]),
            company_tier=item.get("company_tier", "MAANG / Product"),
            difficulty=item.get("difficulty", "Intermediate"),
            question_text=item["question_text"],
            key_concepts=json.dumps(item["key_concepts"]),
            interviewer_criteria=item.get("interviewer_criteria", ""),
            model_answer=item["model_answer"],
            tips=item.get("tips", "")
        )
        session.add(question)
    await session.commit()
    print("Interview questions seeded successfully.")

async def run_all_seeders():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_skills(session)
        await seed_roles(session)
        await seed_resources(session)
        await seed_assessments(session)
        await seed_interview_questions(session)

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_all_seeders())
