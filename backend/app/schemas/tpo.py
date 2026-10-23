from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TpoProfileBase(BaseModel):
    designation: Optional[str] = "Head of Training & Placement"
    institution_name: Optional[str] = "Apex Institute of Technology & Management"
    department: Optional[str] = "Corporate Relations & Placement Cell"
    emp_id: Optional[str] = "TPO-OFFICER-01"
    office_room: Optional[str] = "Admin Block, Placement Directorate Room 204"
    official_phone: Optional[str] = "+91 98765 12340"
    office_hours: Optional[str] = "Mon - Fri, 9:00 AM - 5:30 PM"
    placement_season: Optional[str] = "2025 - 2026 Season"
    bio: Optional[str] = "Committed to facilitating tier-1 corporate partnerships and elevating student career readiness."
    min_cgpa_cutoff: Optional[float] = 7.0
    target_grad_batches: Optional[str] = "2025, 2026, 2027"

class TpoProfileUpdate(TpoProfileBase):
    full_name: Optional[str] = None

class TpoProfileResponse(TpoProfileBase):
    id: str
    user_id: str
    full_name: str
    email: str
    authorized_code_used: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Oversight stats
    total_supervised_students: int = 0
    batch_average_readiness: float = 0.0
    eligible_students_count: int = 0
    active_drives_count: int = 4

    model_config = ConfigDict(from_attributes=True)
