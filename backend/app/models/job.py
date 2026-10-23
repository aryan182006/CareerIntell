import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

try:
    from app.core.database import Base
except ImportError:
    from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=True)
    company = Column(String(200), nullable=True)
    raw_text = Column(Text, nullable=False)
    clean_text = Column(Text, nullable=True)
    required_skills = Column(Text, default="[]")  # JSON string of required skills
    preferred_skills = Column(Text, default="[]")  # JSON string of preferred skills
    min_experience_years = Column(Integer, default=0)
    education_level = Column(String(100), nullable=True)
    analyzed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    importance = Column(String(50), default="Required")  # Required, Preferred
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    job = relationship("JobDescription", back_populates="skills")
