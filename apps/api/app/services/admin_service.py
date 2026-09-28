"""
Admin Service — Business Logic Layer (Module 10).
Handles fetching and updating users, and reading system audit logs.
"""
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User, UserRole, UserStatusUpdate, UserRoleUpdate
from app.models.audit_log import AuditLog


async def list_users(
    db: AsyncSession,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[User]:
    """Fetch all users on the platform with optional filters."""
    statement = select(User)
    
    if role:
        statement = statement.where(User.role == role)
    if is_active is not None:
        statement = statement.where(User.is_active == is_active)
        
    statement = statement.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(statement)
    return list(result.scalars().all())


async def update_user_status(
    db: AsyncSession,
    user_id: uuid.UUID,
    update: UserStatusUpdate,
) -> Optional[User]:
    """Suspend or reactivate a user account."""
    statement = select(User).where(User.id == user_id)
    result = await db.execute(statement)
    user = result.scalar_one_or_none()
    
    if not user:
        return None
        
    user.is_active = update.is_active
    user.updated_at = datetime.now(timezone.utc)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user_role(
    db: AsyncSession,
    user_id: uuid.UUID,
    update: UserRoleUpdate,
) -> Optional[User]:
    """Change a user's role (e.g., promote to official)."""
    statement = select(User).where(User.id == user_id)
    result = await db.execute(statement)
    user = result.scalar_one_or_none()
    
    if not user:
        return None
        
    user.role = update.role
    user.updated_at = datetime.now(timezone.utc)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def list_audit_logs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> List[AuditLog]:
    """Fetch system-wide audit logs."""
    statement = select(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(statement)
    return list(result.scalars().all())


async def log_admin_action(
    db: AsyncSession,
    admin_id: uuid.UUID,
    action: str,
    target_type: str,
    target_id: Optional[uuid.UUID] = None,
) -> AuditLog:
    """Log an administrative action."""
    log = AuditLog(
        user_id=admin_id,
        action=action,
        detail=f"Target: {target_type} ({target_id})" if target_id else f"Target: {target_type}",
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
