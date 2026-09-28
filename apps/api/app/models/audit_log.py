"""
Audit Log model for the Land Governance Platform.

PDF Requirement (Page 2):
  "Full audit trail of logins and access to sensitive documents"

Tracks every significant user action for security and compliance.
"""
import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class AuditLog(SQLModel, table=True):
    """
    Records security-relevant events like logins, failed login attempts,
    password resets, and access to sensitive documents.
    """
    __tablename__ = "audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Who performed the action (nullable for failed logins by unknown users)
    user_id: Optional[uuid.UUID] = Field(default=None, index=True)
    user_email: Optional[str] = Field(default=None, index=True)
    
    # What happened
    action: str = Field(index=True)  # e.g. "LOGIN_SUCCESS", "LOGIN_FAILED", "PASSWORD_RESET"
    detail: Optional[str] = None     # Additional context, e.g. "Invalid password"
    
    # Where it happened from
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # When
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuditLogRead(SQLModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    action: str
    detail: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
