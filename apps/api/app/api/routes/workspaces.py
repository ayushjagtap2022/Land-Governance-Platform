"""
Workspaces REST API Routes (Module 4).
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.workspace import (
    WorkspaceCreate, WorkspaceRead,
    WorkspaceMemberCreate, WorkspaceMemberRead,
    TaskCreate, TaskRead, TaskUpdate
)
from app.services import workspace_service

router = APIRouter()


@router.post("/", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workspace = await workspace_service.create_workspace(
        db=db,
        workspace_in=workspace_in,
        created_by=current_user.id,
    )
    return WorkspaceRead.model_validate(workspace)


@router.get("/", response_model=list[WorkspaceRead])
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workspaces = await workspace_service.list_user_workspaces(db, current_user.id)
    return [WorkspaceRead.model_validate(w) for w in workspaces]


@router.post("/{workspace_id}/members", response_model=WorkspaceMemberRead)
async def add_workspace_member(
    workspace_id: uuid.UUID,
    member_in: WorkspaceMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify current user is admin of workspace
    membership = await workspace_service.check_membership(db, workspace_id, current_user.id)
    if not membership or membership.role != "admin":
        raise HTTPException(status_code=403, detail="Must be workspace admin to add members.")
        
    member = await workspace_service.add_member(
        db=db,
        workspace_id=workspace_id,
        user_id=member_in.user_id,
        role=member_in.role,
    )
    return WorkspaceMemberRead.model_validate(member)


@router.post("/{workspace_id}/tasks", response_model=TaskRead)
async def create_task(
    workspace_id: uuid.UUID,
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify member
    membership = await workspace_service.check_membership(db, workspace_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace.")
        
    task = await workspace_service.create_task(
        db=db,
        workspace_id=workspace_id,
        task_in=task_in,
    )
    return TaskRead.model_validate(task)


@router.get("/{workspace_id}/tasks", response_model=list[TaskRead])
async def list_tasks(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    membership = await workspace_service.check_membership(db, workspace_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this workspace.")
        
    tasks = await workspace_service.list_tasks(db, workspace_id)
    return [TaskRead.model_validate(t) for t in tasks]


@router.patch("/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: uuid.UUID,
    updates: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await workspace_service.update_task(db, task_id, updates)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return TaskRead.model_validate(task)
