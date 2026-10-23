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

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    skill_name = Column(String(100), index=True, nullable=False)
    title = Column(String(200), nullable=False)
    provider = Column(String(100), default="Coursera")  # Coursera, Udemy, YouTube, Docs, edX
    url = Column(String(500), nullable=False)
    type = Column(String(50), default="Course")  # Course, Project, Tutorial, Article, Certification
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    duration_hours = Column(Integer, default=10)
    rating = Column(Float, default=4.5)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    target_role_title = Column(String(100), default="Data Scientist")
    completion_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("StudentProfile", back_populates="roadmaps")
    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.order_index")

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase = Column(String(50), default="Phase 1: Foundations")
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Technical")
    duration = Column(String(50), default="2 weeks")
    status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, COMPLETED
    order_index = Column(Integer, default=0)
    resources = Column(Text, default="[]")  # JSON list of resource references
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    roadmap = relationship("Roadmap", back_populates="items")
