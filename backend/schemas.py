from pydantic import BaseModel
from typing import List, Optional
import datetime

# ─── User / Auth Schemas ──────────────────────────────────────────────────────

class UserBase(BaseModel):
    name: str
    city: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    constituency: Optional[str] = None
    village: Optional[str] = None
    ward: Optional[str] = None
    panchayat: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserRegister(BaseModel):
    """New registration with credentials."""
    user_login_id: str
    password: str
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None

class LoginRequest(BaseModel):
    user_login_id: str
    password: str
    role: str = "user"   # "user" or "admin"

class LoginResponse(BaseModel):
    id: int
    user_login_id: str
    name: str
    role: str
    city: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    points: int = 0

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    points: int
    role: str = "user"
    user_login_id: Optional[str] = None

    class Config:
        from_attributes = True

# ─── Confirmation Schemas ─────────────────────────────────────────────────────

class ConfirmationBase(BaseModel):
    user_id: int
    confirmation_status: str
    latitude: float
    longitude: float

class ConfirmationCreate(ConfirmationBase):
    pass

class Confirmation(ConfirmationBase):
    id: int
    report_id: int

    class Config:
        from_attributes = True

# ─── Report Schemas ───────────────────────────────────────────────────────────

class ReportBase(BaseModel):
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    area_name: Optional[str] = None
    hazard_type: str
    severity: str = "Low"
    priority: Optional[str] = "Low"
    recommended_action: Optional[str] = "Monitor"

class ReportCreate(ReportBase):
    user_id: int

class ReportStatusUpdate(BaseModel):
    """Admin — update status/priority/approval."""
    admin_status: Optional[str] = None    # Pending, In Progress, Completed
    priority: Optional[str] = None        # Low, Moderate, Critical
    is_approved: Optional[bool] = None    # True=approve, False=reject

class Report(ReportBase):
    id: int
    user_id: int
    severity_score: float
    predicted_risk: float
    status: str
    admin_status: str = "Pending"
    is_approved: bool = True
    estimated_cost: float
    verification_count: int = 0
    created_at: datetime.datetime
    confirmations: List[Confirmation] = []

    class Config:
        from_attributes = True
