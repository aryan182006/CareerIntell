from app.models.user import User
from app.models.student import StudentProfile, StudentSkill, Project, Certification
from app.models.tpo import TpoProfile
from app.models.resume import Resume, ResumeExtraction
from app.models.taxonomy import Skill, SkillAlias, CareerRole, RoleSkill
from app.models.job import JobDescription, JobSkill
from app.models.roadmap import LearningResource, Roadmap, RoadmapItem
from app.models.assessment import Assessment, Question, AssessmentAttempt
from app.models.interview import InterviewQuestion, StudentInterviewProgress
from app.models.intelligence import SkillGap, ReadinessAssessment, ReadinessHistory, Recommendation
