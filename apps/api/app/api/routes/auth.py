"""
Authentication API Routes — The Controller Layer.

Endpoints:
  POST /auth/register       — Create a new account
  POST /auth/login          — Authenticate and receive a JWT token
  GET  /auth/me             — Get current user's profile
  PATCH /auth/me            — Update current user's profile
  POST /auth/forgot-password — Request a password reset (stub)
  POST /auth/reset-password  — Reset password with token (stub)

Future hooks (documented for architecture, not yet implemented):
  POST /auth/sso/digilocker — DigiLocker / NIC SSO callback
  POST /auth/verify-otp     — OTP verification for email
  POST /auth/enable-2fa     — Enable 2FA for official/admin roles
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from app.api.dependencies import get_db, get_current_user
from app.models.user import (
    User, UserRegister, UserLogin, UserRead, UserUpdate,
    TokenResponse, ForgotPasswordRequest, ResetPasswordRequest,
)
from app.services import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    user_in: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user account.
    
    The system auto-detects the user's role based on their email domain:
    - `.gov.in` / `.nic.in` → Government Official
    - `.ac.in` / `.edu.in` → Researcher
    - All others → Public User
    
    Returns a JWT access token so the user is logged in immediately after registration.
    """
    try:
        user = await auth_service.register_user(db, user_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    
    # Generate token so user is logged in immediately
    access_token = auth_service.create_user_token(user)
    
    return TokenResponse(
        access_token=access_token,
        user=UserRead.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT access token",
)
async def login(
    credentials: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate with email and password.
    
    Returns a JWT access token on success.
    All login attempts (success and failure) are logged in the audit trail.
    """
    # Extract client info for audit logging
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    user = await auth_service.authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_user_token(user)
    
    return TokenResponse(
        access_token=access_token,
        user=UserRead.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the current logged-in user's profile",
)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently authenticated user.
    
    Requires a valid JWT Bearer token in the Authorization header.
    """
    return UserRead.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserRead,
    summary="Update the current user's profile",
)
async def update_me(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update the currently authenticated user's profile.
    
    Only `full_name` and `institution` can be updated by the user.
    Role changes require Super Admin approval.
    """
    if updates.full_name is not None:
        current_user.full_name = updates.full_name.strip()
    if updates.institution is not None:
        current_user.institution = updates.institution.strip()
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return UserRead.model_validate(current_user)


# ---------------------------------------------------------------------------
# Password Reset (Stub — ready for email integration)
# ---------------------------------------------------------------------------
@router.post(
    "/forgot-password",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Request a password reset link (Enterprise Hook)",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Password reset initiation hook.
    Returns HTTP 501 Not Implemented: SMTP mailer and OTP verification are enterprise architectural hooks.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password reset is not enabled in this deployment. SMTP email delivery, OTP/2FA, and Govt SSO (DigiLocker/Jan Parichay) are architectural integration hooks."
    )


@router.post(
    "/reset-password",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Reset password using a reset token (Enterprise Hook)",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Password reset completion hook.
    Returns HTTP 501 Not Implemented: Token verification and password updates require production SMTP/OTP service.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Password reset is not enabled in this deployment. SMTP email delivery, OTP/2FA, and Govt SSO (DigiLocker/Jan Parichay) are architectural integration hooks."
    )


# ---------------------------------------------------------------------------
# Future SSO Hook (Architecture placeholder as required by PDF)
# ---------------------------------------------------------------------------
# @router.post("/sso/digilocker")
# async def digilocker_sso_callback(...):
#     """
#     Placeholder for DigiLocker / NIC SSO integration.
#     PDF Requirement: "Placeholder/future hook for govt SSO
#     (DigiLocker / NIC SSO) — mention in architecture even if not built live"
#     """
#     pass

# @router.post("/verify-otp")
# async def verify_otp(...):
#     """OTP verification for email-based signup."""
#     pass

# @router.post("/enable-2fa")
# async def enable_2fa(...):
#     """Enable 2FA for official/admin roles."""
#     pass
