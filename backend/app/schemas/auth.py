from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "student"
    department: Optional[str] = "Computer Science"
    degree: Optional[str] = "B.Tech"
    graduation_year: Optional[int] = 2026
    target_role_title: Optional[str] = "Data Scientist"
    tpo_auth_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    student_profile_id: Optional[str] = None
    tpo_profile_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
