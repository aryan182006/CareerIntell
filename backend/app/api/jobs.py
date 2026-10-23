from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from app.core.database import get_db
    from app.schemas.job import JobAnalyzeRequest, JobAnalyzeResponse
    from app.services.jd_analyzer import jd_analyzer
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.schemas.job import JobAnalyzeRequest, JobAnalyzeResponse
    from backend.app.services.jd_analyzer import jd_analyzer

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/analyze", response_model=JobAnalyzeResponse)
async def analyze_job_description(req: JobAnalyzeRequest):
    result = jd_analyzer.analyze_jd(
        raw_text=req.raw_text,
        title=req.title,
        company=req.company
    )
    print(f"\n[CAREERINTELL JD PARSER] Parsed Job Description: '{result['title']}' ({len(result['required_skills'])} Required, {len(result['preferred_skills'])} Preferred skills detected)", flush=True)
    return JobAnalyzeResponse(
        title=result["title"],
        company=result["company"],
        clean_text=result["clean_text"],
        required_skills=result["required_skills"],
        preferred_skills=result["preferred_skills"],
        min_experience_years=result["min_experience_years"],
        education_level=result["education_level"]
    )
