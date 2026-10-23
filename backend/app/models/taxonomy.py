import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
try:
    from app.core.database import Base
except ImportError:
    from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False) # e.g. Programming, Data Science, Web, Cloud, Databases
    description = Column(String, nullable=True)

    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")
    role_associations = relationship("RoleSkill", back_populates="skill", cascade="all, delete-orphan")

class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    alias = Column(String(100), index=True, nullable=False)

    skill = relationship("Skill", back_populates="aliases")

class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String(100), default="Tech")
    average_salary_range = Column(String(100), nullable=True)

    role_skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")

class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_id = Column(String(36), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    importance = Column(String(20), default="Required") # Required, Preferred
    required_level = Column(Integer, default=75) # 1-100

    role = relationship("CareerRole", back_populates="role_skills")
    skill = relationship("Skill", back_populates="role_associations")
