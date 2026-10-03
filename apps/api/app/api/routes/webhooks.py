"""
Module 9: Platform API & Integration Layer — Webhooks & Developer Keys Engine
Provides webhook event subscription, HMAC-SHA256 test dispatch, and developer API key lifecycle.
"""

import time
import hmac
import hashlib
import uuid
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, Field

router = APIRouter()

# In-memory subscription store for demonstration
_SUBSCRIPTIONS: List[Dict[str, Any]] = [
    {
        "id": "sub_demo_01",
        "url": "https://nic.gov.in/webhooks/landgov-events",
        "events": ["simulation.completed", "document.approved", "challenge.awarded"],
        "secret": "whsec_test_secret_394829384",
        "status": "active",
        "created_at": "2024-10-01T08:00:00Z"
    }
]

_DISPATCHED_EVENTS: List[Dict[str, Any]] = []

class WebhookSubscriptionInput(BaseModel):
    url: str = Field(description="Target HTTPS callback URL")
    events: List[str] = Field(default=["simulation.completed", "document.approved"], description="Subscribed event types")
    secret: Optional[str] = Field(default=None, description="Secret token for HMAC-SHA256 payload signing")

class WebhookDispatchInput(BaseModel):
    event_type: str = Field(default="simulation.completed", description="Event name (e.g. simulation.completed, document.indexed)")
    payload: Dict[str, Any] = Field(
        default={
            "simulation_id": "sim_8392",
            "state": "Maharashtra",
            "dispute_reduction_pct": 10.4,
            "digitization_gain_pct": 15.2,
            "timestamp": "2024-10-04T03:00:00Z"
        },
        description="Event payload payload data"
    )

class ApiKeyGenerateInput(BaseModel):
    developer_name: str = Field(default="DoLR Research Fellow", description="Application or researcher name")
    organization: str = Field(default="Department of Land Resources", description="Department / Academic institution")
    role: str = Field(default="Researcher", description="Access role tier ('Researcher', 'Official', 'Admin')")

@router.post("/subscribe", summary="Register a Webhook Subscription")
async def subscribe_webhook(sub: WebhookSubscriptionInput) -> Dict[str, Any]:
    """Registers a new webhook endpoint for platform event notifications."""
    sub_id = f"sub_{uuid.uuid4().hex[:8]}"
    secret = sub.secret or f"whsec_{uuid.uuid4().hex[:16]}"
    record = {
        "id": sub_id,
        "url": sub.url,
        "events": sub.events,
        "secret": secret,
        "status": "active",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    _SUBSCRIPTIONS.append(record)
    return {"status": "subscribed", "subscription": record}

@router.get("/subscriptions", summary="List Active Webhook Subscriptions")
async def list_subscriptions() -> List[Dict[str, Any]]:
    """Returns registered webhook endpoints and their event subscriptions."""
    return _SUBSCRIPTIONS

@router.post("/test-dispatch", summary="Simulate Webhook Event Dispatch")
async def test_dispatch(data: WebhookDispatchInput) -> Dict[str, Any]:
    """
    Fires a simulated webhook event dispatch.
    Computes an HMAC-SHA256 signature for verification by receiver systems.
    """
    event_id = f"evt_{uuid.uuid4().hex[:10]}"
    secret = "whsec_test_secret_394829384"
    
    # Calculate HMAC signature over raw payload string
    payload_str = str(data.payload)
    signature = hmac.new(secret.encode("utf-8"), payload_str.encode("utf-8"), hashlib.sha256).hexdigest()
    
    dispatch_record = {
        "event_id": event_id,
        "event_type": data.event_type,
        "payload": data.payload,
        "headers": {
            "X-LandGov-Event": data.event_type,
            "X-LandGov-Delivery": event_id,
            "X-LandGov-Signature-256": f"sha256={signature}",
            "User-Agent": "LandGovernancePlatform-Webhook/1.2"
        },
        "delivered": True,
        "http_status": 200,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    _DISPATCHED_EVENTS.append(dispatch_record)
    return {
        "status": "dispatched",
        "delivery": dispatch_record,
        "verification_guide": "Verify with: hmac.new(secret.encode(), raw_payload.encode(), hashlib.sha256).hexdigest()"
    }

@router.get("/events", summary="Get Webhook Delivery Event Log")
async def get_events(limit: int = 20) -> List[Dict[str, Any]]:
    """Returns historical event delivery audit log."""
    return _DISPATCHED_EVENTS[-limit:]

@router.post("/api-keys/generate", summary="Generate Developer API Key")
async def generate_api_key(inp: ApiKeyGenerateInput) -> Dict[str, Any]:
    """Generates a developer API key for programmatic integration (Module 9)."""
    raw_key = f"gov_live_{uuid.uuid4().hex}"
    key_prefix = raw_key[:12] + "..."
    return {
        "api_key": raw_key,
        "key_prefix": key_prefix,
        "developer_name": inp.developer_name,
        "organization": inp.organization,
        "role": inp.role,
        "rate_limit": "120 requests/minute",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "header_usage": "Pass via header 'X-API-Key: gov_live_...'"
    }
