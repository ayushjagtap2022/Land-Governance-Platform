"""
Authentication Service — Business Logic Layer.

Handles:
  - User registration with email domain-based role detection
  - Login with password verification and JWT issuance
  - Audit logging for security compliance
  - Password reset token generation
"""
import uuid
from typing import Optional
from datetime import datetime
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User, UserRole, UserRegister
from app.models.audit_log import AuditLog
from app.core.security import hash_password, verify_password, create_access_token


# ---------------------------------------------------------------------------
# Known email domains for auto-role detection
# PDF Requirement (Page 2): "Institution/government email domain verification
# (so a .gov.in or recognized university email auto-suggests the correct role)"
# ---------------------------------------------------------------------------
GOVERNMENT_DOMAINS = {
    "gov.in", "nic.in", "dolr.gov.in",
    "nic.gov.in", "mha.gov.in",
}

UNIVERSITY_DOMAINS = {
    "ac.in", "edu.in", "edu",
    "iitb.ac.in", "iitd.ac.in", "iitm.ac.in",
    "iisc.ac.in", "jnu.ac.in", "du.ac.in",
    "bits-pilani.ac.in", "nls.ac.in",
}


def detect_role_from_email(email: str) -> UserRole:
    """
    Auto-detect the most appropriate role based on email domain.
    
    - .gov.in / .nic.in → Official
    - .ac.in / .edu.in → Researcher
    - Everything else → Public
    
    The user can always request a role change through admin verification later.
    """
    domain = email.split("@")[-1].lower()
    
    # Check government domains (match full domain or parent domain)
    for gov_domain in GOVERNMENT_DOMAINS:
        if domain == gov_domain or domain.endswith("." + gov_domain):
            return UserRole.OFFICIAL
    
    # Check university/research domains
    for uni_domain in UNIVERSITY_DOMAINS:
        if domain == uni_domain or domain.endswith("." + uni_domain):
            return UserRole.RESEARCHER
    
    return UserRole.PUBLIC


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Fetch a user by their email address."""
    statement = select(User).where(User.email == email)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """Fetch a user by their UUID."""
    statement = select(User).where(User.id == user_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def register_user(db: AsyncSession, user_in: UserRegister) -> User:
    """
    Register a new user.
    
    1. Check for duplicate email
    2. Auto-detect role from email domain
    3. Hash password
    4. Save to database
    5. Log the registration event
    """
    # Check if email already exists
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise ValueError("A user with this email already exists.")
    
    # Detect role from email domain
    detected_role = detect_role_from_email(user_in.email)
    
    # Create the User record
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role=detected_role,
        institution=user_in.institution,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Log the registration
    await log_audit_event(
        db=db,
        user_id=user.id,
        user_email=user.email,
        action="REGISTER_SUCCESS",
        detail=f"Registered with auto-detected role: {detected_role.value}",
    )
    
    return user


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Optional[User]:
    """
    Authenticate a user by email and password.
    
    Returns the User if credentials are valid, None otherwise.
    Logs both successful and failed login attempts for audit trail.
    """
    user = await get_user_by_email(db, email)
    
    if not user:
        # Log failed attempt (unknown email)
        await log_audit_event(
            db=db,
            user_email=email,
            action="LOGIN_FAILED",
            detail="Email not found",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return None
    
    if not verify_password(password, user.hashed_password):
        # Log failed attempt (wrong password)
        await log_audit_event(
            db=db,
            user_id=user.id,
            user_email=user.email,
            action="LOGIN_FAILED",
            detail="Invalid password",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return None
    
    if not user.is_active:
        # Log failed attempt (deactivated account)
        await log_audit_event(
            db=db,
            user_id=user.id,
            user_email=user.email,
            action="LOGIN_FAILED",
            detail="Account is deactivated",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return None
    
    # Log successful login
    await log_audit_event(
        db=db,
        user_id=user.id,
        user_email=user.email,
        action="LOGIN_SUCCESS",
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    return user


def create_user_token(user: User) -> str:
    """Create a JWT access token for an authenticated user."""
    return create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
    )


async def log_audit_event(
    db: AsyncSession,
    action: str,
    user_id: Optional[uuid.UUID] = None,
    user_email: Optional[str] = None,
    detail: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> None:
    """
    Write an entry to the audit_logs table.
    
    This fulfills the PDF requirement:
    "Full audit trail of logins and access to sensitive documents"
    """
    log_entry = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        detail=detail,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log_entry)
    await db.commit()
