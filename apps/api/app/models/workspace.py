"""
Workspace and Task models for the Collaborative Research Workspaces (Module 4).
"""
import uuid
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship


class WorkspaceRole(str, Enum):
    """Roles within a specific workspace."""
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class TaskStatus(str, Enum):
    """Lifecycle status of a task."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"


# ---------------------------------------------------------------------------
# Request / Response Schemas
# ---------------------------------------------------------------------------
class WorkspaceCreate(SQLModel):
    name: str
    description: str


class WorkspaceRead(SQLModel):
    id: uuid.UUID
    name: str
    description: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime


class WorkspaceMemberCreate(SQLModel):
    user_id: uuid.UUID
    role: WorkspaceRole = WorkspaceRole.MEMBER


class WorkspaceMemberRead(SQLModel):
    workspace_id: uuid.UUID
    user_id: uuid.UUID
    role: WorkspaceRole
    joined_at: datetime


class TaskCreate(SQLModel):
    title: str
    description: str
    assigned_to: Optional[uuid.UUID] = None
    due_date: Optional[datetime] = None


class TaskUpdate(SQLModel):
    status: Optional[TaskStatus] = None
    assigned_to: Optional[uuid.UUID] = None
    due_date: Optional[datetime] = None


class TaskRead(SQLModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    title: str
    description: str
    assigned_to: Optional[uuid.UUID] = None
    status: TaskStatus
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Database Tables
# ---------------------------------------------------------------------------
class Workspace(SQLModel, table=True):
    """A collaborative workspace folder."""
    __tablename__ = "workspaces"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    description: str
    created_by: uuid.UUID = Field(index=True)  # FK to users.id
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WorkspaceMember(SQLModel, table=True):
    """Junction table mapping users to workspaces with a specific role."""
    __tablename__ = "workspace_members"

    workspace_id: uuid.UUID = Field(primary_key=True, index=True)
    user_id: uuid.UUID = Field(primary_key=True, index=True)
    role: WorkspaceRole = Field(default=WorkspaceRole.MEMBER)
    
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Task(SQLModel, table=True):
    """A task/milestone within a workspace."""
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    workspace_id: uuid.UUID = Field(index=True)  # FK to workspaces.id
    
    title: str
    description: str
    assigned_to: Optional[uuid.UUID] = Field(default=None, index=True)  # FK to users.id
    
    status: TaskStatus = Field(default=TaskStatus.TODO, index=True)
    due_date: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
