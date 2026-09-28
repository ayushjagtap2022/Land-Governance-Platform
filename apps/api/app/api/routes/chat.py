"""
WebSockets Chat API Routes (Module 4).
"""
import uuid
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from app.api.dependencies import get_db
from app.core.security import decode_access_token
from app.services import workspace_service, auth_service
from app.core.websockets import broadcast
from app.models.message import MessageRead

router = APIRouter()


async def get_ws_user(token: str, db: AsyncSession):
    """Authenticate a WebSocket connection via token parameter."""
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        user = await auth_service.get_user_by_id(db, uuid.UUID(user_id_str))
        return user
    except Exception:
        return None


@router.websocket("/ws/chat/{workspace_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    workspace_id: uuid.UUID,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Real-time threaded chat endpoint using Redis Pub/Sub.
    """
    await websocket.accept()

    # Authenticate user
    user = await get_ws_user(token, db)
    if not user:
        await websocket.send_json({"error": "Authentication failed"})
        await websocket.close()
        return

    # Verify membership
    membership = await workspace_service.check_membership(db, workspace_id, user.id)
    if not membership:
        await websocket.send_json({"error": "Not a member of this workspace"})
        await websocket.close()
        return

    channel_name = f"workspace_{workspace_id}"
    
    # Send historical messages upon connection
    recent_messages = await workspace_service.get_recent_messages(db, workspace_id)
    for msg in recent_messages:
        await websocket.send_json({
            "type": "message",
            "data": MessageRead.model_validate(msg).model_dump(mode="json")
        })

    # Start listening to Redis channel
    async with broadcast.subscribe(channel=channel_name) as subscriber:
        
        async def redis_listener():
            """Listen for messages from Redis and send them to this WebSocket."""
            async for event in subscriber:
                try:
                    await websocket.send_text(event.message)
                except Exception:
                    break

        # Run listener in background task
        listener_task = asyncio.create_task(redis_listener())

        try:
            while True:
                # Receive message from WebSocket
                data = await websocket.receive_text()
                
                # We expect simple JSON like {"content": "Hello"}
                try:
                    msg_data = json.loads(data)
                    content = msg_data.get("content", "").strip()
                    if content:
                        # Save to DB
                        db_msg = await workspace_service.save_message(
                            db=db,
                            workspace_id=workspace_id,
                            sender_id=user.id,
                            content=content
                        )
                        
                        # Prepare payload
                        payload = {
                            "type": "message",
                            "data": MessageRead.model_validate(db_msg).model_dump(mode="json")
                        }
                        
                        # Publish to Redis
                        await broadcast.publish(channel=channel_name, message=json.dumps(payload))
                except json.JSONDecodeError:
                    pass
                    
        except WebSocketDisconnect:
            # Client disconnected
            pass
        finally:
            listener_task.cancel()
