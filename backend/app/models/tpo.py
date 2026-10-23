import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

try:
    from app.core.database import Base
except ImportError:
    from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class TpoProfile(Base):
    __tablename__ = "tpo_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation = Column(String(150), default="Head of Training & Placement")
    institution_name = Column(String(200), default="Apex Institute of Technology & Management")
    department = Column(String(150), default="Corporate Relations & Placement Cell")
    emp_id = Column(String(50), default="TPO-OFFICER-01")
    office_room = Column(String(100), default="Admin Block, Placement Directorate Room 204")
    official_phone = Column(String(50), default="+91 98765 12340")
    office_hours = Column(String(100), default="Mon - Fri, 9:00 AM - 5:30 PM")
    placement_season = Column(String(50), default="2025 - 2026 Season")
    authorized_code_used = Column(String(100), default="TPO-SECURE-2026")
    bio = Column(Text, default="Committed to facilitating tier-1 corporate partnerships and elevating student career readiness.")
    min_cgpa_cutoff = Column(Float, default=7.0)
    target_grad_batches = Column(String(100), default="2025, 2026, 2027")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="tpo_profile")
