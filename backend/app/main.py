import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.core.config import settings
    from app.core.database import init_db, AsyncSessionLocal
    from app.api import api_router
    from app.seed.seeder import run_all_seeders
except ImportError:
    from backend.app.core.config import settings
    from backend.app.core.database import init_db, AsyncSessionLocal
    from backend.app.api import api_router
    from backend.app.seed.seeder import run_all_seeders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed default data if needed
    try:
        await init_db()
        await run_all_seeders()
    except Exception as e:
        print(f"Startup initialization warning: {e}")
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="AI-Powered Career Intelligence & Placement Readiness System API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local frontend dev on port 5173 / any local port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_v1": "/api"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "sqlite_async", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
