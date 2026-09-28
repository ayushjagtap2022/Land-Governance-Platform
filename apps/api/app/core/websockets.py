"""
WebSocket Connection Manager using Redis Pub/Sub.

This file manages the Broadcaster instance and provides helpers for
subscribing to channels and broadcasting messages.
"""
from broadcaster import Broadcast
from app.core.config import settings

# Initialize the broadcaster with the Redis URL from settings
broadcast = Broadcast(settings.REDIS_URL)

async def connect_broadcaster():
    """Connect to Redis when the app starts."""
    await broadcast.connect()

async def disconnect_broadcaster():
    """Disconnect from Redis when the app shuts down."""
    await broadcast.disconnect()
