from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class InterviewProgressUpdateRequest(BaseModel):
    status: str  # NOT_STARTED, PRACTICING, MASTERED
    self_rating: Optional[int] = None
    user_notes: Optional[str] = None

class InterviewQuestionItem(BaseModel):
    id: str
    role_title: str
    skill_name: str
    round_type: str
    company_tags: List[str]
    company_tier: str
    difficulty: str
    question_text: str
    key_concepts: List[str]
    interviewer_criteria: Optional[str] = None
    model_answer: str
    tips: Optional[str] = None
    is_skill_gap: bool = False
    gap_type: Optional[str] = None
    status: str = "NOT_STARTED"
    self_rating: int = 0
    user_notes: Optional[str] = ""
    last_practiced_at: Optional[str] = None

class InterviewHubResponse(BaseModel):
    target_role: str
    total_questions: int
    mastered_count: int
    practicing_count: int
    skill_gap_questions_count: int
    readiness_percentage: float
    questions: List[InterviewQuestionItem]

class FilterOptionsResponse(BaseModel):
    roles: List[str]
    companies: List[str]
    round_types: List[str]
    tiers: List[str]
    difficulties: List[str]
