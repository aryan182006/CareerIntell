import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

try:
    from app.core.database import Base
except ImportError:
    from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    skill_name = Column(String(100), nullable=False)
    category = Column(String(100), default="Technical")
    status = Column(String(50), nullable=False)  # MATCHED, PARTIAL, MISSING
    current_level = Column(Integer, default=0)
    required_level = Column(Integer, default=75)
    importance = Column(String(50), default="Required")  # Required, Preferred
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ReadinessAssessment(Base):
    __tablename__ = "readiness_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    target_role_id = Column(String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    target_role_title = Column(String(100), default="Data Scientist")
    overall_score = Column(Float, nullable=False)
    technical_score = Column(Float, nullable=False)
    role_match_score = Column(Float, nullable=False)
    project_score = Column(Float, nullable=False)
    resume_score = Column(Float, nullable=False)
    assessment_score = Column(Float, nullable=False)
    explanation_summary = Column(Text, nullable=True)
    breakdown = Column(Text, default="{}")  # JSON representation of breakdown
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ReadinessHistory(Base):
    __tablename__ = "readiness_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    role_title = Column(String(100), default="Data Scientist")
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="readiness_history")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # skill, project, resource, certification
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="High")  # Critical, High, Medium, Low
    action_url = Column(String(500), nullable=True)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
