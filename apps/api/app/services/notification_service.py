"""
Notification Service — Business Logic Layer (Module 11).
"""
import uuid
import json
import logging
from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.notification import Notification, NotificationType, NotificationRead
from app.core.websockets import broadcast

logger = logging.getLogger(__name__)


async def send_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    content: str,
    type: NotificationType = NotificationType.INFO,
) -> Notification:
    """
    Saves a notification to the database and instantly publishes it to Redis.
    """
    # 1. Save to DB for persistence
    notification = Notification(
        user_id=user_id,
        title=title,
        content=content,
        type=type,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    # 2. Publish to Redis channel (only for this specific user)
    try:
        channel_name = f"notifications_{user_id}"
        payload = {
            "type": "notification",
            "data": NotificationRead.model_validate(notification).model_dump(mode="json")
        }
        await broadcast.publish(channel=channel_name, message=json.dumps(payload))
    except Exception as e:
        logger.warning("Failed to publish real-time notification to Redis broadcaster: %s", e)
    
    return notification


async def list_notifications(
    db: AsyncSession,
    user_id: uuid.UUID,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Notification]:
    """Fetch past notifications for a user. Seeds standard advisory alerts if user has none."""
    statement = select(Notification).where(Notification.user_id == user_id)
    
    if unread_only:
        statement = statement.where(Notification.is_read == False)
        
    statement = statement.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(statement)
    notifications = list(result.scalars().all())

    # If user has zero notifications in DB, seed initial statutory alerts
    if not notifications and not unread_only:
        seed_items = [
            (
                "Welcome to National Land Governance Platform",
                "Your verified government / researcher credential is active. Explore ULPIN 14-digit Bhu-Aadhaar queries, spatial GIS layers, and policy simulation engines.",
                NotificationType.SUCCESS,
            ),
            (
                "SVAMITVA Drone Survey Cadastral Milestone",
                "Drone survey completed in 189,000+ villages across 28 States & UTs. Updated spatial parcel boundaries are indexed in the Spatial Data Infrastructure.",
                NotificationType.INFO,
            ),
            (
                "DILRMP Cadastral Maps Modernization Advisory",
                "89% of cadastral land records digitized. Check the State Analytics Hub for district-level RoR modernization telemetry.",
                NotificationType.INFO,
            ),
        ]
        for title, content, n_type in seed_items:
            n = Notification(
                user_id=user_id,
                title=title,
                content=content,
                type=n_type,
                is_read=False,
            )
            db.add(n)
        await db.commit()
        result = await db.execute(statement)
        notifications = list(result.scalars().all())

    return notifications


async def mark_as_read(
    db: AsyncSession,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Optional[Notification]:
    """Mark a specific notification as read."""
    statement = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id
    )
    result = await db.execute(statement)
    notification = result.scalar_one_or_none()
    
    if not notification:
        return None
        
    notification.is_read = True
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def mark_all_as_read(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> int:
    """Mark all unread notifications as read for a user."""
    statement = select(Notification).where(
        Notification.user_id == user_id,
        Notification.is_read == False
    )
    result = await db.execute(statement)
    unread_notifs = list(result.scalars().all())
    count = len(unread_notifs)
    for n in unread_notifs:
        n.is_read = True
        db.add(n)
    if count > 0:
        await db.commit()
    return count
