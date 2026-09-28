"""
User model for the Land Governance Platform.

Roles are derived from the project PDF (Page 1):
  - Public User
  - Researcher / Academic
  - Government Official / Policymaker
  - Institution Admin (State Government / University)
  - Super Admin (DoLR Platform Admin)
"""
import uuid
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class UserRole(str, Enum):
    """Platform roles as defined in the project requirements."""
    PUBLIC       = "public"
    RESEARCHER   = "researcher"
    OFFICIAL     = "official"
    INSTITUTION  = "institution"
    SUPER_ADMIN  = "super_admin"


# ---------------------------------------------------------------------------
# Request / Response Schemas (not database tables)
# ---------------------------------------------------------------------------
class UserRegister(SQLModel):
    """Schema for the /auth/register endpoint request body."""
    email: str
    password: str
    full_name: str
    institution: Optional[str] = None


class UserLogin(SQLModel):
    """Schema for the /auth/login endpoint request body."""
    email: str
    password: str


class UserRead(SQLModel):
    """Schema for returning user data in API responses (no password)."""
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    institution: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserUpdate(SQLModel):
    """Schema for PATCH /auth/me — all fields optional."""
    full_name: Optional[str] = None
    institution: Optional[str] = None


class UserStatusUpdate(SQLModel):
    """Schema for admins to suspend or activate users."""
    is_active: bool


class UserRoleUpdate(SQLModel):
    """Schema for admins to change user roles."""
    role: UserRole


class TokenResponse(SQLModel):
    """Schema for the JWT token response after login."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class ForgotPasswordRequest(SQLModel):
    """Schema for the /auth/forgot-password request."""
    email: str


class ResetPasswordRequest(SQLModel):
    """Schema for the /auth/reset-password request."""
    token: str
    new_password: str


# ---------------------------------------------------------------------------
# Database Table
# ---------------------------------------------------------------------------
class User(SQLModel, table=True):
    """
    The core User table.
    
    Every other module in the platform (Repository, GIS, Simulation, etc.)
    will reference this table via a `user_id` foreign key.
    """
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str = Field(index=True)
    role: UserRole = Field(default=UserRole.PUBLIC, index=True)
    institution: Optional[str] = Field(default=None, index=True)
    
    # Account status
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)  # Email verification status
    is_2fa_enabled: bool = Field(default=False)  # Optional 2FA for official/admin
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
