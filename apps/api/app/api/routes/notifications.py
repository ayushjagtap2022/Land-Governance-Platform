"""
WebSockets and REST API Routes for Notifications (Module 11).
"""
import uuid
import asyncio
import random
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token
from app.services import auth_service, notification_service
from app.core.websockets import broadcast
from app.models.user import User
from app.models.notification import NotificationRead, NotificationType

router = APIRouter()


async def get_ws_user(token: str) -> User | None:
    """Authenticate a WebSocket connection via token parameter with a transient DB session."""
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        async with AsyncSessionLocal() as db:
            user = await auth_service.get_user_by_id(db, uuid.UUID(user_id_str))
            return user
    except Exception:
        return None


@router.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    Real-time push notifications endpoint.
    Users connect to this on the frontend to get instant alerts.
    """
    await websocket.accept()

    # Authenticate user without holding a persistent DB connection
    user = await get_ws_user(token)
    if not user:
        await websocket.send_json({"error": "Authentication failed"})
        await websocket.close()
        return

    # Each user gets their own private channel
    channel_name = f"notifications_{user.id}"

    # Start listening to Redis channel
    async with broadcast.subscribe(channel=channel_name) as subscriber:
        async def redis_listener():
            async for event in subscriber:
                try:
                    await websocket.send_text(event.message)
                except Exception:
                    break

        listener_task = asyncio.create_task(redis_listener())

        try:
            # We don't expect the user to send messages here, just listen
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            pass
        finally:
            listener_task.cancel()


@router.get("/", response_model=List[NotificationRead])
async def list_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch past notifications."""
    notifications = await notification_service.list_notifications(
        db, current_user.id, unread_only, limit
    )
    return [NotificationRead.model_validate(n) for n in notifications]


@router.post("/read-all")
@router.patch("/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications as read for current user."""
    count = await notification_service.mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read", "count": count}


@router.post("/test", response_model=NotificationRead)
async def create_test_notification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a test real-time notification to verify WebSocket push and UI alerting."""
    test_presets = [
        (
            "SVAMITVA Record Room Verified",
            "Cadastral survey parcel #MH-PUN-091 verified with sub-meter GNSS accuracy.",
            NotificationType.SUCCESS,
        ),
        (
            "Dispute Surge Advisory",
            "Elevated tenancy dispute risk flag detected in peri-urban cluster under review.",
            NotificationType.WARNING,
        ),
        (
            "Policy Simulation Completed",
            "National agricultural leasing reform baseline projection computed with 94.2% confidence.",
            NotificationType.INFO,
        ),
    ]
    title, content, ntype = random.choice(test_presets)
    notification = await notification_service.send_notification(
        db,
        user_id=current_user.id,
        title=title,
        content=content,
        type=ntype,
    )
    return NotificationRead.model_validate(notification)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a notification as read when the user clicks it."""
    notification = await notification_service.mark_as_read(
        db, notification_id, current_user.id
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationRead.model_validate(notification)

