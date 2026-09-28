"""
FastAPI Dependencies — Injected into route handlers via Depends().

Provides:
  - get_db: Async database session per request
  - get_current_user: Extracts and validates the JWT token, returns the User
  - require_role: Factory that returns a dependency checking for a specific role
  - require_permission: Factory that returns a dependency checking for a specific permission
"""
import uuid
from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import AsyncGenerator

from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token
from app.core.permissions import Permission, has_permission


# ---------------------------------------------------------------------------
# Database Session Dependency
# ---------------------------------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get a database session per request.
    Closes the session automatically after the request finishes.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ---------------------------------------------------------------------------
# JWT Bearer Token Extraction
# ---------------------------------------------------------------------------
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """
    Extracts the JWT from the Authorization header, decodes it,
    and returns the corresponding User from the database.
    
    Raises 401 if the token is missing, invalid, or the user doesn't exist.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )
    
    # Import here to avoid circular imports
    from app.services.auth_service import get_user_by_id
    
    user = await get_user_by_id(db, uuid.UUID(user_id_str))
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )
    
    return user


# ---------------------------------------------------------------------------
# Role-Based Access Control Dependencies
# ---------------------------------------------------------------------------
def require_role(*allowed_roles: str) -> Callable:
    """
    Factory that creates a dependency to restrict access to specific roles.
    
    Usage in a route:
        @router.get("/admin-only", dependencies=[Depends(require_role("super_admin"))])
        async def admin_only_route(): ...
    """
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}",
            )
        return current_user
    return role_checker


def require_permission(permission: Permission) -> Callable:
    """
    Factory that creates a dependency to restrict access based on the
    granular permission matrix defined in core/permissions.py.
    
    Usage in a route:
        @router.post("/upload", dependencies=[Depends(require_permission(Permission.UPLOAD_DOCS))])
        async def upload_document(): ...
    """
    async def permission_checker(current_user = Depends(get_current_user)):
        if not has_permission(current_user.role.value, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have the '{permission.value}' permission.",
            )
        return current_user
    return permission_checker
