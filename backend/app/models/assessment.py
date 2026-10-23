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

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # Python, SQL, Machine Learning, Data Science, Core CS
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    time_limit_minutes = Column(Integer, default=15)
    passing_percentage = Column(Float, default=60.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=True)
    category = Column(String(100), index=True, nullable=False)
    skill_name = Column(String(100), index=True, nullable=True)
    question_text = Column(Text, nullable=False)
    options = Column(Text, nullable=False)  # JSON encoded list of strings
    correct_option_index = Column(Integer, nullable=False)  # 0, 1, 2, 3
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Intermediate")

    assessment = relationship("Assessment", back_populates="questions")

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    score_percentage = Column(Float, nullable=False)
    total_questions = Column(Integer, default=10)
    correct_answers = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    user_answers = Column(Text, default="{}")  # JSON map of question_id -> chosen_option
    passed = Column(Integer, default=0)  # 1 if passed, 0 if failed
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="assessment_attempts")
    assessment = relationship("Assessment", back_populates="attempts")
