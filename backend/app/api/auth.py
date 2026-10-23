from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from app.core.config import settings
    from app.core.database import get_db
    from app.core.security import verify_password, get_password_hash, create_access_token
    from app.models.user import User
    from app.models.student import StudentProfile
    from app.models.tpo import TpoProfile
    from app.models.taxonomy import CareerRole
    from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
    from app.api.deps import get_current_user
except ImportError:
    from backend.app.core.config import settings
    from backend.app.core.database import get_db
    from backend.app.core.security import verify_password, get_password_hash, create_access_token
    from backend.app.models.user import User
    from backend.app.models.student import StudentProfile
    from backend.app.models.tpo import TpoProfile
    from backend.app.models.taxonomy import CareerRole
    from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
    from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing = await db.execute(select(User).where(User.email == req.email.lower()))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # If registering as TPO, enforce institutional authentication code
    user_role = (req.role or "student").lower()
    if user_role == "tpo":
        authorized_codes = [c.strip().upper() for c in settings.TPO_AUTH_CODES]
        entered_code = (req.tpo_auth_code or "").strip().upper()
        if not entered_code or entered_code not in authorized_codes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or missing Institutional Authentication Code. Placement Officer privileges require an authorized campus secret code."
            )

    # Hash password & create user
    hashed_pwd = get_password_hash(req.password)
    user = User(
        email=req.email.lower(),
        hashed_password=hashed_pwd,
        full_name=req.full_name,
        role=user_role
    )
    db.add(user)
    await db.flush()

    student_profile_id = None
    tpo_profile_id = None

    if user.role == "student":
        # Find target role id if exists
        target_role_id = None
        if req.target_role_title:
            role_res = await db.execute(
                select(CareerRole).where(CareerRole.title.ilike(req.target_role_title))
            )
            r = role_res.scalars().first()
            if r:
                target_role_id = r.id

        profile = StudentProfile(
            user_id=user.id,
            department=req.department or "Computer Science",
            degree=req.degree or "B.Tech",
            graduation_year=req.graduation_year or 2026,
            current_cgpa=8.0,
            target_role_id=target_role_id,
            target_role_title=req.target_role_title or "Data Scientist",
            readiness_score=50.0
        )
        db.add(profile)
        await db.flush()
        student_profile_id = profile.id
    elif user.role == "tpo":
        tpo_prof = TpoProfile(
            user_id=user.id,
            designation="Training & Placement Officer",
            institution_name="Apex Institute of Technology & Management",
            department=req.department or "Corporate Relations & Placement Cell",
            authorized_code_used=(req.tpo_auth_code or "TPO-SECURE-2026").strip().upper()
        )
        db.add(tpo_prof)
        await db.flush()
        tpo_profile_id = tpo_prof.id

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(subject=user.id)
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
        student_profile_id=student_profile_id,
        tpo_profile_id=tpo_profile_id
    )

    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
async def login(req: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(User)
        .where(User.email == req.email.lower())
        .options(
            selectinload(User.student_profile),
            selectinload(User.tpo_profile)
        )
    )
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive."
        )

    access_token = create_access_token(subject=user.id)
    student_profile_id = user.student_profile.id if user.student_profile else None
    tpo_profile_id = user.tpo_profile.id if user.tpo_profile else None

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
        student_profile_id=student_profile_id,
        tpo_profile_id=tpo_profile_id
    )

    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    student_profile_id = None
    tpo_profile_id = None

    if current_user.role == "student":
        stmt = select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        res = await db.execute(stmt)
        prof = res.scalars().first()
        if prof:
            student_profile_id = prof.id
    elif current_user.role == "tpo":
        stmt = select(TpoProfile).where(TpoProfile.user_id == current_user.id)
        res = await db.execute(stmt)
        tpo_prof = res.scalars().first()
        if tpo_prof:
            tpo_profile_id = tpo_prof.id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        avatar_url=current_user.avatar_url,
        student_profile_id=student_profile_id,
        tpo_profile_id=tpo_profile_id
    )

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out."}
