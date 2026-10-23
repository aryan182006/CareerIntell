import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "careerintell.db").replace("\\", "/")
DEFAULT_UPLOAD_PATH = os.path.join(BASE_DIR, "uploads", "resumes").replace("\\", "/")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    PROJECT_NAME: str = "CareerIntell - AI Career Intelligence & Placement Readiness"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "career-intell-secret-jwt-key-2026-super-secure-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite async database anchored to backend directory
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DEFAULT_DB_PATH}")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", DEFAULT_UPLOAD_PATH)
    MAX_UPLOAD_SIZE_MB: int = 10
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Authorized secret codes for Training & Placement Officer (TPO) registration
    TPO_AUTH_CODES: List[str] = [
        "TPO-SECURE-2026",
        "CAMPUS-TPO-99",
        "TPO-ADMIN-2026",
        "CAREER-INTELL-TPO"
    ]

settings = Settings()
