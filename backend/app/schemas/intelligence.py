from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    status: str  # MATCHED, EQUIVALENT, IMPLIED, PARTIAL, MISSING
    current_level: int
    required_level: int
    importance: str  # Required, Preferred
    justification: Optional[str] = None
    satisfied_by: Optional[str] = None

class ModelAccuracyMetrics(BaseModel):
    overall_accuracy: float
    layout_accuracy: float
    skill_confidence: float
    structural_completeness: float
    semantic_precision: float
    evaluation_label: str
    details: Optional[Dict[str, Any]] = None

class SkillGapAnalysisResponse(BaseModel):
    target_role: str
    match_score: float
    total_required: int
    matched_count: int
    equivalent_count: Optional[int] = 0
    implied_count: Optional[int] = 0
    partial_count: int
    missing_count: int
    gaps: List[SkillGapItem]
    model_accuracy: Optional[ModelAccuracyMetrics] = None

class ReadinessBreakdown(BaseModel):
    technical_skills: float
    role_match: float
    projects: float
    resume_quality: float
    assessments: float

class ReadinessHistoryPoint(BaseModel):
    recorded_at: datetime
    score: float
    role_title: str

class ReadinessResponse(BaseModel):
    overall_score: float
    breakdown: ReadinessBreakdown
    explanation_summary: str
    target_role: str
    history: List[ReadinessHistoryPoint] = []

class RoleMatchItem(BaseModel):
    id: str
    title: str
    category: str
    description: str
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    salary_range: Optional[str] = None

class RecommendationItem(BaseModel):
    id: str
    type: str  # skill, project, resource, certification
    title: str
    description: str
    priority: str  # Critical, High, Medium, Low
    action_url: Optional[str] = None
