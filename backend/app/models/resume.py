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

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="resumes")
    extractions = relationship("ResumeExtraction", back_populates="resume", cascade="all, delete-orphan")

class ResumeExtraction(Base):
    __tablename__ = "resume_extractions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=False)
    clean_text = Column(Text, nullable=True)
    parsed_skills = Column(Text, default="[]")  # JSON string of extracted skills with confidence
    sections = Column(Text, default="{}")  # JSON string of detected sections (education, work, etc.)
    extraction_metadata = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="extractions")
