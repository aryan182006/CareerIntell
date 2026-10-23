from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ExtractedSkill(BaseModel):
    name: str
    category: str
    confidence: float
    source: str = "resume"

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    file_size: int
    uploaded_at: datetime
    skills_extracted: List[ExtractedSkill] = []
    sections_detected: Dict[str, Any] = {}
    raw_text_snippet: Optional[str] = None

class ResumeSkillsReview(BaseModel):
    confirmed_skills: List[str]
    proficiency: Optional[str] = "Intermediate"
