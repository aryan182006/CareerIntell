import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_id = Column(String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    role_title = Column(String(100), index=True, nullable=False, default="All Roles")
    skill_name = Column(String(100), index=True, nullable=False)
    round_type = Column(String(50), index=True, nullable=False)  # Technical Core, System Design & Scenarios, Project Defense, Behavioral (STAR)
    company_tags = Column(Text, default="[]")  # JSON encoded list of companies, e.g. ["Amazon", "Google", "TCS Digital"]
    company_tier = Column(String(50), default="MAANG / Product")  # MAANG / Product, Tier-1 Tech, Fintech & Startups
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    question_text = Column(Text, nullable=False)
    key_concepts = Column(Text, default="[]")  # JSON encoded list of keywords/concepts candidate must hit
    interviewer_criteria = Column(Text, nullable=True)  # What recruiters & hiring managers look for
    model_answer = Column(Text, nullable=False)  # Structured best-practice answer
    tips = Column(Text, nullable=True)  # Tips, pitfalls to avoid, or STAR breakdown
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    progress_entries = relationship("StudentInterviewProgress", back_populates="question", cascade="all, delete-orphan")


class StudentInterviewProgress(Base):
    __tablename__ = "student_interview_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, PRACTICING, MASTERED
    self_rating = Column(Integer, default=0)  # 1-5 scale
    user_notes = Column(Text, nullable=True)
    last_practiced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", backref="interview_progress")
    question = relationship("InterviewQuestion", back_populates="progress_entries")
