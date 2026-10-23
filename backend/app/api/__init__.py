from fastapi import APIRouter

try:
    from app.api.auth import router as auth_router
    from app.api.students import router as students_router
    from app.api.resumes import router as resumes_router
    from app.api.jobs import router as jobs_router
    from app.api.matching import router as matching_router
    from app.api.readiness import router as readiness_router
    from app.api.recommendations import router as recommendations_router
    from app.api.roadmap import router as roadmap_router
    from app.api.assessments import router as assessments_router
    from app.api.progress import router as progress_router
    from app.api.tpo import router as tpo_router
    from app.api.admin import router as admin_router
    from app.api.interviews import router as interviews_router
except ImportError:
    from backend.app.api.auth import router as auth_router
    from backend.app.api.students import router as students_router
    from backend.app.api.resumes import router as resumes_router
    from backend.app.api.jobs import router as jobs_router
    from backend.app.api.matching import router as matching_router
    from backend.app.api.readiness import router as readiness_router
    from backend.app.api.recommendations import router as recommendations_router
    from backend.app.api.roadmap import router as roadmap_router
    from backend.app.api.assessments import router as assessments_router
    from backend.app.api.progress import router as progress_router
    from backend.app.api.tpo import router as tpo_router
    from backend.app.api.admin import router as admin_router
    from backend.app.api.interviews import router as interviews_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(students_router)
api_router.include_router(resumes_router)
api_router.include_router(jobs_router)
api_router.include_router(matching_router)
api_router.include_router(readiness_router)
api_router.include_router(recommendations_router)
api_router.include_router(roadmap_router)
api_router.include_router(assessments_router)
api_router.include_router(progress_router)
api_router.include_router(tpo_router)
api_router.include_router(admin_router)
api_router.include_router(interviews_router)
