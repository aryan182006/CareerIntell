import re
from typing import Dict, Any, List

try:
    from app.nlp.text_processor import clean_text
    from app.nlp.skill_extractor import skill_extractor
except ImportError:
    from backend.app.nlp.text_processor import clean_text
    from backend.app.nlp.skill_extractor import skill_extractor

class JDAnalyzer:
    @staticmethod
    def analyze_jd(raw_text: str, title: str = None, company: str = None) -> Dict[str, Any]:
        cleaned = clean_text(raw_text)
        lower = cleaned.lower()

        # 1. Infer title if not given
        if not title:
            # Check for patterns like "Role: Data Scientist" or "Job Title: Full Stack"
            title_match = re.search(r'(?:role|job\s*title|position)\s*[:\-]\s*([^\n\r]+)', cleaned, re.IGNORECASE)
            if title_match:
                title = title_match.group(1).strip()
            else:
                first_line = cleaned.split('\n')[0].strip()
                title = first_line if len(first_line) < 60 else "Software Engineer"

        # 2. Extract experience requirement
        exp_years = 0
        exp_match = re.search(r'(\d+)(?:\+|\s*-\s*\d+)?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:relevant)?\s*experience', lower)
        if exp_match:
            try:
                exp_years = int(exp_match.group(1))
            except ValueError:
                exp_years = 0

        # 3. Extract education requirement
        education = "Bachelor's Degree in CS/related field"
        if "master" in lower or "m.s." in lower or "m.tech" in lower:
            education = "Master's Degree in Computer Science, Data Science, or related"
        elif "phd" in lower or "doctorate" in lower:
            education = "Ph.D. in Computer Science or quantitative discipline"

        # 4. Partition sections into Required vs Preferred
        required_text_parts = []
        preferred_text_parts = []
        lines = cleaned.split('\n')
        current_zone = "required"  # default to required

        for line in lines:
            line_l = line.lower()
            if any(k in line_l for k in ["preferred", "nice to have", "good to have", "bonus", "desirable"]):
                current_zone = "preferred"
            elif any(k in line_l for k in ["requirement", "qualification", "must have", "what you need", "responsibilities"]):
                current_zone = "required"

            if current_zone == "required":
                required_text_parts.append(line)
            else:
                preferred_text_parts.append(line)

        req_text = "\n".join(required_text_parts)
        pref_text = "\n".join(preferred_text_parts)

        # Extract skills from each partition
        all_skills = skill_extractor.extract_skills_from_text(cleaned)
        pref_skills_data = skill_extractor.extract_skills_from_text(pref_text) if pref_text else []
        pref_names = {s["name"].lower() for s in pref_skills_data}

        required_skills = []
        preferred_skills = []

        for s in all_skills:
            if s["name"].lower() in pref_names:
                preferred_skills.append(s["name"])
            else:
                required_skills.append(s["name"])

        # If all were put into preferred or required, balance reasonably
        if not required_skills and preferred_skills:
            required_skills = preferred_skills[:len(preferred_skills)//2]
            preferred_skills = preferred_skills[len(preferred_skills)//2:]

        return {
            "title": title,
            "company": company or "Target Company",
            "clean_text": cleaned,
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "min_experience_years": exp_years,
            "education_level": education
        }

jd_analyzer = JDAnalyzer()
