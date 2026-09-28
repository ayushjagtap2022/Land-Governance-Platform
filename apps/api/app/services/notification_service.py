"""
Notification Service — Business Logic Layer (Module 11).
"""
import uuid
import json
from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.notification import Notification, NotificationType, NotificationRead
from app.core.websockets import broadcast


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
    channel_name = f"notifications_{user_id}"
    payload = {
        "type": "notification",
        "data": NotificationRead.model_validate(notification).model_dump(mode="json")
    }
    await broadcast.publish(channel=channel_name, message=json.dumps(payload))
    
    return notification


async def list_notifications(
    db: AsyncSession,
    user_id: uuid.UUID,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Notification]:
    """Fetch past notifications for a user."""
    statement = select(Notification).where(Notification.user_id == user_id)
    
    if unread_only:
        statement = statement.where(Notification.is_read == False)
        
    statement = statement.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(statement)
    return list(result.scalars().all())


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
