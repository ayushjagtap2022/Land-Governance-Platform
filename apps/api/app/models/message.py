"""
Message model for threaded chat in Collaborative Workspaces (Module 4).
"""
import uuid
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


# ---------------------------------------------------------------------------
# Request / Response Schemas
# ---------------------------------------------------------------------------
class MessageCreate(SQLModel):
    content: str


class MessageRead(SQLModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Database Tables
# ---------------------------------------------------------------------------
class Message(SQLModel, table=True):
    """A chat message sent in a workspace."""
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    workspace_id: uuid.UUID = Field(index=True)  # FK to workspaces.id
    sender_id: uuid.UUID = Field(index=True)     # FK to users.id
    
    content: str
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
