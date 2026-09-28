"""
Notification models for real-time alerting engine (Module 11).
"""
import uuid
from enum import Enum
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class NotificationType(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


# ---------------------------------------------------------------------------
# Request / Response Schemas
# ---------------------------------------------------------------------------
class NotificationRead(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    type: NotificationType
    is_read: bool
    created_at: datetime


class NotificationUpdate(SQLModel):
    is_read: bool


# ---------------------------------------------------------------------------
# Database Tables
# ---------------------------------------------------------------------------
class Notification(SQLModel, table=True):
    """A system notification sent to a specific user."""
    __tablename__ = "notifications"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(index=True)  # FK to users.id
    
    title: str
    content: str
    type: NotificationType = Field(default=NotificationType.INFO)
    
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
