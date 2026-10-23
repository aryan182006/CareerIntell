from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class QuestionPublic(BaseModel):
    id: str
    question_text: str
    options: List[str]
    category: str
    difficulty: str

class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    category: str
    difficulty: str
    time_limit_minutes: int
    passing_percentage: float
    question_count: int

class AssessmentSubmitRequest(BaseModel):
    answers: Dict[str, int]
    time_taken_seconds: int

class QuestionFeedback(BaseModel):
    question_id: str
    question_text: str
    user_answer_index: Optional[int]
    correct_option_index: int
    is_correct: bool
    explanation: Optional[str] = None

class AssessmentResultResponse(BaseModel):
    attempt_id: str
    score_percentage: float
    total_questions: int
    correct_answers: int
    passed: bool
    time_taken_seconds: int
    feedback: List[QuestionFeedback]

class AssessmentHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    assessment_title: str
    category: str
    score_percentage: float
    passed: bool
    completed_at: datetime
