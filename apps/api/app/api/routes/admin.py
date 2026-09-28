"""
Admin Portal API Routes (Module 10).
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_role
from app.models.user import User, UserRead, UserRole, UserStatusUpdate, UserRoleUpdate
from app.models.audit_log import AuditLogRead
from app.services import admin_service

# Apply the super_admin requirement to EVERY route in this router
router = APIRouter(dependencies=[Depends(require_role("super_admin"))])


@router.get("/users", response_model=List[UserRead], summary="List all platform users")
async def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter active/suspended"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all registered users. Only accessible to Super Admins."""
    users = await admin_service.list_users(db, role=role, is_active=is_active, skip=skip, limit=limit)
    return [UserRead.model_validate(u) for u in users]


@router.patch("/users/{user_id}/status", response_model=UserRead, summary="Suspend or reactivate a user")
async def update_user_status(
    user_id: uuid.UUID,
    update: UserStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Suspend a user (is_active=False) or reactivate them (is_active=True).
    This immediately blocks them from logging in.
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot suspend your own account.")
        
    user = await admin_service.update_user_status(db, user_id, update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # Log the action
    action = "suspended user" if not update.is_active else "reactivated user"
    await admin_service.log_admin_action(db, current_user.id, action, "users", user_id)
    
    return UserRead.model_validate(user)


@router.patch("/users/{user_id}/role", response_model=UserRead, summary="Change a user's role")
async def update_user_role(
    user_id: uuid.UUID,
    update: UserRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Promote or demote a user's role.
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role.")
        
    user = await admin_service.update_user_role(db, user_id, update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # Log the action
    await admin_service.log_admin_action(db, current_user.id, f"changed role to {update.role.value}", "users", user_id)
    
    return UserRead.model_validate(user)


@router.get("/audit-logs", response_model=List[AuditLogRead], summary="View system audit logs")
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    View a chronological log of sensitive actions taken on the platform.
    """
    logs = await admin_service.list_audit_logs(db, skip=skip, limit=limit)
    return [AuditLogRead.model_validate(log) for log in logs]
