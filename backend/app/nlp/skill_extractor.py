import re
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.models.taxonomy import Skill, SkillAlias
    from app.seed.skills_data import SKILLS_DATA
except ImportError:
    from backend.app.models.taxonomy import Skill, SkillAlias
    from backend.app.seed.skills_data import SKILLS_DATA

# Hierarchical implied skill graph: when advanced frameworks/tools are present,
# foundational skills are automatically inferred so candidates are not falsely penalized.
IMPLIED_SKILLS_MAP: Dict[str, List[Dict[str, Any]]] = {
    "React": [
        {"name": "HTML5", "confidence": 0.92, "reason": "Implied by React UI components"},
        {"name": "CSS3", "confidence": 0.88, "reason": "Implied by React UI styling"},
        {"name": "JavaScript", "confidence": 0.95, "reason": "Implied by React framework"},
        {"name": "Responsive Web Design", "confidence": 0.85, "reason": "Implied by modern frontend libraries"}
    ],
    "Angular": [
        {"name": "HTML5", "confidence": 0.92, "reason": "Implied by Angular component templates"},
        {"name": "CSS3", "confidence": 0.88, "reason": "Implied by Angular component styling"},
        {"name": "TypeScript", "confidence": 0.90, "reason": "Implied by Angular framework"},
        {"name": "JavaScript", "confidence": 0.95, "reason": "Implied by Angular framework"}
    ],
    "Vue.js": [
        {"name": "HTML5", "confidence": 0.92, "reason": "Implied by Vue templates"},
        {"name": "CSS3", "confidence": 0.88, "reason": "Implied by Vue styling"},
        {"name": "JavaScript", "confidence": 0.95, "reason": "Implied by Vue framework"}
    ],
    "Next.js": [
        {"name": "React", "confidence": 0.95, "reason": "Next.js is a React production framework"},
        {"name": "HTML5", "confidence": 0.92, "reason": "Implied by Next.js web apps"},
        {"name": "CSS3", "confidence": 0.88, "reason": "Implied by Next.js styling"},
        {"name": "JavaScript", "confidence": 0.95, "reason": "Implied by Next.js runtime"}
    ],
    "Kubernetes": [
        {"name": "Docker", "confidence": 0.90, "reason": "Implied by container orchestration"},
        {"name": "Linux", "confidence": 0.85, "reason": "Implied by cluster operations"}
    ],
    "Django": [
        {"name": "Python", "confidence": 0.95, "reason": "Django is a Python web framework"},
        {"name": "REST APIs", "confidence": 0.88, "reason": "Implied by backend web service development"},
        {"name": "SQL", "confidence": 0.85, "reason": "Implied by Django ORM persistence"}
    ],
    "FastAPI": [
        {"name": "Python", "confidence": 0.95, "reason": "FastAPI is a Python framework"},
        {"name": "REST APIs", "confidence": 0.92, "reason": "Implied by API framework"}
    ],
    "Spring Boot": [
        {"name": "Java", "confidence": 0.95, "reason": "Spring Boot is a Java framework"},
        {"name": "REST APIs", "confidence": 0.90, "reason": "Implied by microservices API development"},
        {"name": "Object-Oriented Programming", "confidence": 0.90, "reason": "Implied by enterprise Java"}
    ],
    "Ruby on Rails": [
        {"name": "Ruby", "confidence": 0.95, "reason": "Rails is a Ruby framework"},
        {"name": "REST APIs", "confidence": 0.88, "reason": "Implied by Rails backend MVC"},
        {"name": "SQL", "confidence": 0.85, "reason": "Implied by ActiveRecord ORM"}
    ],
    "Express.js": [
        {"name": "Node.js", "confidence": 0.95, "reason": "Express is a Node.js framework"},
        {"name": "REST APIs", "confidence": 0.90, "reason": "Implied by Express web APIs"}
    ],
    "TypeScript": [
        {"name": "JavaScript", "confidence": 0.95, "reason": "TypeScript is a superset of JavaScript"}
    ]
}

# Academic degrees that inherently establish core CS competencies
CS_DEGREE_PATTERNS = [
    r'\b(?:master(?:\'?s)?|bachelor(?:\'?s)?|b\.tech|m\.tech|b\.e\.|m\.e\.|b\.s\.|m\.s\.)\b.*?\b(?:computer\s+science|computer\s+engineering|software\s+engineering|information\s+technology)\b',
    r'\b(?:computer\s+science|computer\s+engineering|software\s+engineering)\b.*?\b(?:master(?:\'?s)?|bachelor(?:\'?s)?|b\.tech|m\.tech|degree)\b'
]

class SkillExtractor:
    def __init__(self):
        self.taxonomy: Dict[str, Dict[str, Any]] = {}
        self.alias_map: Dict[str, str] = {}
        self._load_fallback_taxonomy()

    def _load_fallback_taxonomy(self):
        for item in SKILLS_DATA:
            canonical = item["name"]
            self.taxonomy[canonical] = {
                "category": item["category"],
                "description": item.get("description", "")
            }
            # Add exact canonical name as alias
            self.alias_map[canonical.lower()] = canonical
            for a in item.get("aliases", []):
                self.alias_map[a.lower().strip()] = canonical

    async def refresh_from_db(self, db: AsyncSession):
        """Optionally refresh taxonomy from database."""
        try:
            stmt = select(Skill).options(selectinload(Skill.aliases))
            result = await db.execute(stmt)
            skills = result.scalars().all()
            if skills:
                self.taxonomy.clear()
                self.alias_map.clear()
                for s in skills:
                    self.taxonomy[s.name] = {"category": s.category, "description": s.description}
                    self.alias_map[s.name.lower()] = s.name
                    for a in s.aliases:
                        self.alias_map[a.alias.lower()] = s.name
        except Exception as e:
            print(f"Warning: Could not refresh taxonomy from DB: {e}")

    def extract_skills_from_text(self, text: str, sections: Dict[str, str] = None) -> List[Dict[str, Any]]:
        """
        Extract direct skills from text, resolve aliases, and infer prerequisite skills.
        Returns a list of dicts:
        [{'name': 'Python', 'category': 'Programming', 'confidence': 0.95, 'source': 'resume'}]
        """
        if not text:
            return []

        lower_text = text.lower()
        extracted: Dict[str, Dict[str, Any]] = {}

        # 1. Direct Pattern & Alias Matching with Word Boundaries
        for pattern_str, canonical in self.alias_map.items():
            escaped = re.escape(pattern_str)
            # Use strict boundaries for short single/double letter tokens (c, r, go)
            if pattern_str in ["c", "r", "go", "ts", "js"]:
                regex = rf'(?:^|[\s,;./(])({escaped})(?:[\s,;./)]|$)'
            else:
                regex = rf'(?:^|[\s,;./(\-_])({escaped})(?:[\s,;./)\-_]|$)'

            matches = list(re.finditer(regex, lower_text, re.IGNORECASE))
            if matches:
                confidence = 0.85
                count = len(matches)
                if count > 1:
                    confidence = min(0.98, confidence + 0.05 * (count - 1))

                # Boost confidence if present in a designated 'skills' section
                if sections and "skills" in sections:
                    if re.search(regex, sections["skills"].lower()):
                        confidence = min(1.0, confidence + 0.1)

                # Boost if present in 'projects' or 'experience' section
                if sections:
                    if "projects" in sections and re.search(regex, sections["projects"].lower()):
                        confidence = min(1.0, confidence + 0.05)
                    if "experience" in sections and re.search(regex, sections["experience"].lower()):
                        confidence = min(1.0, confidence + 0.05)

                if canonical in extracted:
                    if confidence > extracted[canonical]["confidence"]:
                        extracted[canonical]["confidence"] = confidence
                else:
                    cat = self.taxonomy.get(canonical, {}).get("category", "Technical")
                    extracted[canonical] = {
                        "name": canonical,
                        "category": cat,
                        "confidence": confidence,
                        "source": "resume"
                    }

        # 2. Hierarchical Implied Skills Inference
        # If candidate has React/Angular, infer HTML5/CSS3. If Kubernetes, infer Docker.
        direct_skills = list(extracted.keys())
        for skill_name in direct_skills:
            if skill_name in IMPLIED_SKILLS_MAP:
                for implied in IMPLIED_SKILLS_MAP[skill_name]:
                    target_name = implied["name"]
                    # If target skill was not directly matched or has lower confidence
                    if target_name not in extracted:
                        cat = self.taxonomy.get(target_name, {}).get("category", "Technical")
                        extracted[target_name] = {
                            "name": target_name,
                            "category": cat,
                            "confidence": implied["confidence"],
                            "source": "implied",
                            "implied_by": skill_name,
                            "reason": implied["reason"]
                        }

        # 3. Academic Degree Core CS Competency Inference
        # If the candidate has a Master's or Bachelor's in CS / CE, infer fundamental Data Structures & Algorithms
        has_cs_degree = any(re.search(pat, lower_text, re.IGNORECASE) for pat in CS_DEGREE_PATTERNS)
        if has_cs_degree:
            core_cs_inferred = [
                ("Data Structures", 0.90, "Implied by accredited CS/CE degree curriculum"),
                ("Algorithms", 0.90, "Implied by accredited CS/CE degree curriculum"),
                ("Object-Oriented Programming", 0.88, "Implied by CS degree curriculum")
            ]
            for cs_skill, conf, reason in core_cs_inferred:
                if cs_skill not in extracted:
                    cat = self.taxonomy.get(cs_skill, {}).get("category", "Core CS")
                    extracted[cs_skill] = {
                        "name": cs_skill,
                        "category": cat,
                        "confidence": conf,
                        "source": "implied",
                        "implied_by": "Academic Degree",
                        "reason": reason
                    }

        # Sort: Direct resume skills first, then by confidence descending
        def sort_key(item):
            # Direct resume skills get priority 0, implied get 1
            src_order = 0 if item["source"] == "resume" else 1
            return (src_order, -item["confidence"])

        sorted_skills = sorted(extracted.values(), key=sort_key)
        for s in sorted_skills:
            s["confidence"] = round(s["confidence"], 2)

        return sorted_skills

skill_extractor = SkillExtractor()
