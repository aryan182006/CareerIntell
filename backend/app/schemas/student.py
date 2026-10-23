from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SkillCreate(BaseModel):
    skill_name: str
    proficiency: Optional[str] = "Intermediate"
    proficiency_level: Optional[int] = 70
    source: Optional[str] = "manual"

class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    skill_name: str
    proficiency: str
    proficiency_level: int
    source: str
    verified: bool

class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    technologies: List[str]
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    created_at: Optional[datetime] = None

class CertificationCreate(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class CertificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    current_cgpa: Optional[float] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    target_role_id: Optional[str] = None
    target_role_title: Optional[str] = None

class StudentProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    full_name: str
    email: str
    department: str
    degree: str
    graduation_year: int
    current_cgpa: float
    bio: Optional[str] = None
    phone: Optional[str] = None
    target_role_id: Optional[str] = None
    target_role_title: str
    readiness_score: float
    skills: List[SkillResponse] = []
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []
