from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


# ==============================================================================
# Authentication & User Schemas
# ==============================================================================

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of user")
    email: str = Field(..., min_length=3, max_length=255, description="User email address")
    password: str = Field(..., min_length=8, description="Plaintext password (min 8 chars)")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Please enter a valid email address.")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required.")
        return v


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, description="User email address")
    password: str = Field(..., min_length=1, description="Password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be blank.")
        return v


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, description="New password (min 8 chars)")


# ==============================================================================
# URL Schemas
# ==============================================================================

from backend.utils import normalize_url, validate_alias_rules


class URLCreate(BaseModel):
    original_url: str = Field(..., min_length=1, max_length=2048, description="Original long URL to shrink")
    custom_alias: Optional[str] = Field(None, max_length=64, description="Optional custom short alias")
    expires_at: Optional[datetime] = Field(None, description="Optional expiration datetime (UTC)")

    @field_validator("original_url")
    @classmethod
    def validate_and_normalize_url(cls, v: str) -> str:
        return normalize_url(v)

    @field_validator("custom_alias")
    @classmethod
    def validate_custom_alias(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        validate_alias_rules(v)
        return v


class URLResponse(BaseModel):
    id: int
    user_id: int
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    status: str = "ACTIVE"
    click_count: int

    class Config:
        from_attributes = True


# ==============================================================================
# Analytics & Dashboard Schemas
# ==============================================================================

class TimelinePoint(BaseModel):
    date: str
    day: str
    clicks: int


class TopLink(BaseModel):
    id: int
    short_code: str
    short_url: str
    original_url: str
    status: str = "ACTIVE"
    click_count: int


class ReferrerStat(BaseModel):
    referrer: str
    count: int
    percentage: float


class DeviceStat(BaseModel):
    device: str
    count: int
    percentage: float


class DashboardStats(BaseModel):
    total_links: int
    total_clicks: int
    active_links: int
    clicks_this_week: int
    recent_links: List[URLResponse]


class AnalyticsOverview(BaseModel):
    total_clicks: int
    clicks_today: int
    clicks_this_week: int
    most_clicked_link: Optional[str] = None
    timeline: List[TimelinePoint]
    top_links: List[TopLink]


class LinkAnalytics(BaseModel):
    id: int
    short_code: str
    short_url: str
    original_url: str
    is_active: bool
    status: str = "ACTIVE"
    created_at: datetime
    expires_at: Optional[datetime] = None
    total_clicks: int
    clicks_today: int
    clicks_this_week: int
    clicks_this_month: int
    timeline: List[TimelinePoint]
    top_referrers: List[ReferrerStat]
    devices: List[DeviceStat]
