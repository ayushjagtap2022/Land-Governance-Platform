"""
Workspace Service — Business Logic Layer (Module 4).
"""
import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import select, and_
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.workspace import (
    Workspace, WorkspaceCreate,
    WorkspaceMember, WorkspaceRole,
    Task, TaskCreate, TaskUpdate
)
from app.models.message import Message


async def create_workspace(
    db: AsyncSession,
    workspace_in: WorkspaceCreate,
    created_by: uuid.UUID,
) -> Workspace:
    workspace = Workspace(
        name=workspace_in.name,
        description=workspace_in.description,
        created_by=created_by,
    )
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    
    # Automatically add the creator as an ADMIN member
    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=created_by,
        role=WorkspaceRole.ADMIN
    )
    db.add(member)
    await db.commit()
    
    return workspace


async def get_workspace(
    db: AsyncSession,
    workspace_id: uuid.UUID,
) -> Optional[Workspace]:
    statement = select(Workspace).where(Workspace.id == workspace_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def list_user_workspaces(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[Workspace]:
    """Get all workspaces the user is a member of."""
    statement = (
        select(Workspace)
        .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
        .where(WorkspaceMember.user_id == user_id)
    )
    result = await db.execute(statement)
    return list(result.scalars().all())


async def check_membership(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Optional[WorkspaceMember]:
    """Check if a user is a member of a workspace."""
    statement = select(WorkspaceMember).where(
        and_(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id
        )
    )
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def add_member(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    role: WorkspaceRole = WorkspaceRole.MEMBER,
) -> WorkspaceMember:
    # Check if already a member
    existing = await check_membership(db, workspace_id, user_id)
    if existing:
        return existing
        
    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user_id,
        role=role
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


async def create_task(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    task_in: TaskCreate,
) -> Task:
    task = Task(
        workspace_id=workspace_id,
        title=task_in.title,
        description=task_in.description,
        assigned_to=task_in.assigned_to,
        due_date=task_in.due_date,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def list_tasks(
    db: AsyncSession,
    workspace_id: uuid.UUID,
) -> list[Task]:
    statement = select(Task).where(Task.workspace_id == workspace_id)
    result = await db.execute(statement)
    return list(result.scalars().all())


async def update_task(
    db: AsyncSession,
    task_id: uuid.UUID,
    updates: TaskUpdate,
) -> Optional[Task]:
    statement = select(Task).where(Task.id == task_id)
    result = await db.execute(statement)
    task = result.scalar_one_or_none()
    
    if not task:
        return None
        
    if updates.status is not None:
        task.status = updates.status
    if updates.assigned_to is not None:
        task.assigned_to = updates.assigned_to
    if updates.due_date is not None:
        task.due_date = updates.due_date
        
    task.updated_at = datetime.now(timezone.utc)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def save_message(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    sender_id: uuid.UUID,
    content: str,
) -> Message:
    """Save a chat message to the database."""
    message = Message(
        workspace_id=workspace_id,
        sender_id=sender_id,
        content=content,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def get_recent_messages(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    limit: int = 50,
) -> list[Message]:
    """Fetch recent messages for a workspace chat."""
    statement = (
        select(Message)
        .where(Message.workspace_id == workspace_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(statement)
    # Return chronologically (oldest first for frontend display)
    return list(reversed(list(result.scalars().all())))
