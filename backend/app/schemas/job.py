from typing import Optional, List
from pydantic import BaseModel

class JobAnalyzeRequest(BaseModel):
    raw_text: str
    title: Optional[str] = None
    company: Optional[str] = None

class JobSkillRequirement(BaseModel):
    name: str
    importance: str  # Required, Preferred
    category: Optional[str] = "General"

class JobAnalyzeResponse(BaseModel):
    id: Optional[str] = None
    title: str
    company: Optional[str] = None
    clean_text: str
    required_skills: List[str]
    preferred_skills: List[str]
    min_experience_years: int
    education_level: Optional[str] = None
