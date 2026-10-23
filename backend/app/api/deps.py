from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.core.database import get_db
    from app.core.security import decode_token
    from app.models.user import User
    from app.models.student import StudentProfile
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.core.security import decode_token
    from backend.app.models.user import User
    from backend.app.models.student import StudentProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_token(token)
    if not payload:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    stmt = select(User).where(User.id == user_id).options(selectinload(User.student_profile))
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    return user

async def get_current_student_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> StudentProfile:
    if current_user.student_profile:
        return current_user.student_profile

    # If user doesn't have a profile yet, look up directly or create a default one
    stmt = (
        select(StudentProfile)
        .where(StudentProfile.user_id == current_user.id)
        .options(
            selectinload(StudentProfile.skills),
            selectinload(StudentProfile.projects),
            selectinload(StudentProfile.certifications)
        )
    )
    res = await db.execute(stmt)
    profile = res.scalars().first()

    if not profile:
        # Auto-create empty profile
        profile = StudentProfile(
            user_id=current_user.id,
            department="Computer Science",
            degree="B.Tech",
            graduation_year=2026,
            current_cgpa=8.0,
            target_role_title="Data Scientist",
            readiness_score=50.0
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile

def require_role(roles: List[str]):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(roles)}"
            )
        return current_user
    return role_checker
