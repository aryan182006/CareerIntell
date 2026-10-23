import pytest
from app.nlp.text_processor import clean_text, segment_sections
from app.nlp.skill_extractor import skill_extractor
from app.services.jd_analyzer import jd_analyzer

def test_clean_text():
    raw = "   John Doe   \n\n\n\nSoftware Engineer    "
    cleaned = clean_text(raw)
    assert cleaned == "John Doe\n\nSoftware Engineer"

def test_segment_sections():
    resume_text = """
    John Doe
    john@example.com

    Education
    B.Tech Computer Science 2026

    Skills
    Python, SQL, Machine Learning, React

    Projects
    Predictive Analytics Platform
    """
    sections = segment_sections(resume_text)
    assert "education" in sections
    assert "skills" in sections
    assert "projects" in sections

def test_skill_extraction_and_alias_normalization():
    text = "Proficient with Python, Scikit-learn, ML, k8s, and ReactJS."
    skills = skill_extractor.extract_skills_from_text(text)
    skill_names = [s["name"] for s in skills]

    assert "Python" in skill_names
    assert "Scikit-Learn" in skill_names
    assert "Machine Learning" in skill_names
    assert "Kubernetes" in skill_names
    assert "React" in skill_names

def test_jd_analyzer():
    jd_text = """
    Position: Senior Data Scientist
    Requirements:
    - 3+ years experience with Python, Machine Learning, and SQL
    Nice to have:
    - Deep Learning and Docker
    """
    res = jd_analyzer.analyze_jd(jd_text)
    assert "Data Scientist" in res["title"]
    assert "Python" in res["required_skills"]
    assert "SQL" in res["required_skills"]
    assert "Docker" in res["preferred_skills"]
    assert res["min_experience_years"] >= 3

def test_implied_skills_inference():
    text = "Frontend specialist skilled in React, Redux, and TailwindCSS."
    extracted = skill_extractor.extract_skills_from_text(text)
    names = {s["name"] for s in extracted}
    assert "React" in names
    # React should imply HTML5 and CSS3
    assert "HTML5" in names
    assert "CSS3" in names

def test_entity_extraction():
    from app.nlp.text_processor import extract_resume_entities
    text = """
    Deep M. Mehta
    Email: deep.mehta@example.com | Phone: +1 (206) 555-0199
    LinkedIn: linkedin.com/in/deepmehta | GitHub: github.com/deepmehta
    Master of Science in Computer Science, GPA: 4.0
    """
    entities = extract_resume_entities(text)
    assert entities["email"] == "deep.mehta@example.com"
    assert "206" in entities["phone"]
    assert "github.com/deepmehta" in entities["github"]
    assert float(entities["gpa"]) == 4.0
    assert len(entities["degrees"]) > 0

def test_fullstack_resume_matching_equivalence():
    from app.services.matching_service import MatchingService
    # Full Stack Developer typical required skills:
    fullstack_requirements = [
        {"name": "JavaScript", "importance": "Required", "required_level": 80, "category": "Programming Languages"},
        {"name": "HTML5", "importance": "Required", "required_level": 80, "category": "Frontend"},
        {"name": "CSS3", "importance": "Required", "required_level": 80, "category": "Frontend"},
        {"name": "React", "importance": "Required", "required_level": 80, "category": "Frontend"},
        {"name": "Node.js", "importance": "Required", "required_level": 80, "category": "Backend"},
        {"name": "REST APIs", "importance": "Required", "required_level": 80, "category": "Backend"},
        {"name": "PostgreSQL", "importance": "Required", "required_level": 80, "category": "Database"},
        {"name": "Docker", "importance": "Required", "required_level": 75, "category": "Cloud & DevOps"},
        {"name": "Data Structures", "importance": "Required", "required_level": 80, "category": "Core CS"},
    ]

    # Candidate skills extracted from Deep Mehta's resume (possesses Java, C#, Django, SQL, CosmosDB, K8s, CS Degree)
    student_skill_map = {
        "react": {"name": "React", "proficiency_level": 90, "source": "resume"},
        "angular": {"name": "Angular", "proficiency_level": 88, "source": "resume"},
        "html5": {"name": "HTML5", "proficiency_level": 85, "source": "implied"},
        "css3": {"name": "CSS3", "proficiency_level": 85, "source": "implied"},
        "javascript": {"name": "JavaScript", "proficiency_level": 90, "source": "resume"},
        "java": {"name": "Java", "proficiency_level": 90, "source": "resume"},
        "c#": {"name": "C#", "proficiency_level": 90, "source": "resume"},
        "python": {"name": "Python", "proficiency_level": 90, "source": "resume"},
        "django": {"name": "Django", "proficiency_level": 88, "source": "resume"},
        "rest apis": {"name": "REST APIs", "proficiency_level": 88, "source": "implied"},
        "sql": {"name": "SQL", "proficiency_level": 90, "source": "resume"},
        "cosmosdb": {"name": "CosmosDB", "proficiency_level": 85, "source": "resume"},
        "redis": {"name": "Redis", "proficiency_level": 85, "source": "resume"},
        "kubernetes": {"name": "Kubernetes", "proficiency_level": 88, "source": "resume"},
        "azure": {"name": "Microsoft Azure", "proficiency_level": 90, "source": "resume"},
        "aws": {"name": "AWS", "proficiency_level": 88, "source": "resume"},
        "data structures": {"name": "Data Structures", "proficiency_level": 85, "source": "implied"},
    }

    analysis = MatchingService.evaluate_skill_gaps(
        student_skill_map=student_skill_map,
        requirements=fullstack_requirements,
        target_name="Full Stack Developer"
    )

    # Candidate satisfies ALL 9 requirements (direct, equivalent, or implied) with 0 missing!
    assert analysis["missing_count"] == 0, f"Expected 0 missing skills, got {analysis['missing_count']}: {analysis['gaps']}"
    assert analysis["equivalent_count"] >= 2  # Node.js via Java/C#/Django/Python; PostgreSQL via SQL/CosmosDB; Docker via Kubernetes
    assert analysis["match_score"] >= 95


