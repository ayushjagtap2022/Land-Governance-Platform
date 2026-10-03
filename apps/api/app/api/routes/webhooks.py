"""
Module 9: Platform API & Integration Layer — Webhooks & Developer Keys Engine
Provides authenticated webhook event subscription, SSRF-guarded HMAC-SHA256 test dispatch,
and SHA-256 hashed developer API key lifecycle.
"""

import os
import json
import time
import hmac
import hashlib
import uuid
import socket
import ipaddress
from pathlib import Path
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Header, Depends, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
SUBSCRIPTIONS_FILE = DATA_DIR / "webhook_subscriptions.json"
API_KEYS_FILE = DATA_DIR / "api_keys.json"

# Default demonstration seeds if persistent files do not exist
INITIAL_SUBSCRIPTIONS = [
    {
        "id": "sub_demo_01",
        "url": "https://nic.gov.in/webhooks/landgov-events",
        "events": ["simulation.completed", "document.approved", "challenge.awarded"],
        "secret_prefix": "whsec_...",
        "secret_hash": hashlib.sha256(b"whsec_demo_initial").hexdigest(),
        "status": "active",
        "created_at": "2024-10-01T08:00:00Z"
    }
]

def _load_subscriptions() -> List[Dict[str, Any]]:
    if SUBSCRIPTIONS_FILE.exists():
        try:
            with open(SUBSCRIPTIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return INITIAL_SUBSCRIPTIONS.copy()
    return INITIAL_SUBSCRIPTIONS.copy()

def _save_subscriptions(subs: List[Dict[str, Any]]) -> None:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(SUBSCRIPTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(subs, f, indent=2)
    except Exception:
        pass

def _load_api_keys() -> List[Dict[str, Any]]:
    if API_KEYS_FILE.exists():
        try:
            with open(API_KEYS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def _save_api_keys(keys: List[Dict[str, Any]]) -> None:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(API_KEYS_FILE, "w", encoding="utf-8") as f:
            json.dump(keys, f, indent=2)
    except Exception:
        pass

_DISPATCHED_EVENTS: List[Dict[str, Any]] = []

def validate_webhook_url(url: str) -> None:
    """
    Validates webhook URL against Server-Side Request Forgery (SSRF).
    Blocks loopback (127.0.0.1, localhost), link-local (169.254.0.0/16),
    and RFC 1918 private IPv4/IPv6 ranges.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL scheme. Webhook URL must use http:// or https://"
        )
    
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook URL must contain a valid hostname or IP address."
        )

    blocked_hosts = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "0.0.0.0"}
    if hostname.lower() in blocked_hosts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook target: localhost and loopback addresses are blocked (SSRF protection)."
        )

    # DNS resolution check
    try:
        ip_str = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_str)
        if ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_multicast or ip.is_reserved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid webhook target: address resolves to private/internal network ({ip_str}) (SSRF protection)."
            )
    except socket.gaierror:
        # If hostname cannot be resolved at registration, reject or warn
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook target hostname '{hostname}' could not be resolved by DNS."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook URL validation failed: {str(e)}"
        )

async def require_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Dict[str, Any]:
    """Dependency enforcing valid X-API-Key header. Returns 401 if missing, 403 if invalid."""
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Missing 'X-API-Key' header.",
            headers={"WWW-Authenticate": "ApiKey"}
        )
    key_hash = hashlib.sha256(x_api_key.strip().encode("utf-8")).hexdigest()
    keys = _load_api_keys()
    matched = next((k for k in keys if k.get("key_hash") == key_hash), None)
    if not matched:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or revoked API key."
        )
    return matched

class WebhookSubscriptionInput(BaseModel):
    url: str = Field(description="Target HTTPS callback URL (SSRF guarded)")
    events: List[str] = Field(default=["simulation.completed", "document.approved"], description="Subscribed event types")
    secret: Optional[str] = Field(default=None, description="Secret token for HMAC-SHA256 payload signing")

class WebhookDispatchInput(BaseModel):
    event_type: str = Field(default="simulation.completed", description="Event name (e.g. simulation.completed, document.indexed)")
    target_url: Optional[str] = Field(default=None, description="Optional target URL to simulate dispatch to (SSRF guarded)")
    payload: Dict[str, Any] = Field(
        default={
            "simulation_id": "sim_8392",
            "state": "Maharashtra",
            "dispute_reduction_pct": 10.4,
            "digitization_gain_pct": 15.2,
            "timestamp": "2024-10-04T03:00:00Z"
        },
        description="Event payload data"
    )

class ApiKeyGenerateInput(BaseModel):
    developer_name: str = Field(default="DoLR Research Fellow", description="Application or researcher name")
    organization: str = Field(default="Department of Land Resources", description="Department / Academic institution")
    role: str = Field(default="Researcher", description="Access role tier ('Researcher', 'Official', 'Admin')")

@router.post("/subscribe", summary="Register a Webhook Subscription (Protected)")
async def subscribe_webhook(
    sub: WebhookSubscriptionInput,
    auth: Dict[str, Any] = Depends(require_api_key)
) -> Dict[str, Any]:
    """Registers a new webhook endpoint. Requires X-API-Key and enforces SSRF validation."""
    validate_webhook_url(sub.url)
    sub_id = f"sub_{uuid.uuid4().hex[:8]}"
    raw_secret = sub.secret or f"whsec_{uuid.uuid4().hex}"
    secret_hash = hashlib.sha256(raw_secret.encode("utf-8")).hexdigest()

    record = {
        "id": sub_id,
        "url": sub.url,
        "events": sub.events,
        "secret_prefix": raw_secret[:8] + "...",
        "secret_hash": secret_hash,
        "created_by": auth.get("developer_name", "api_client"),
        "status": "active",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    subs = _load_subscriptions()
    subs.append(record)
    _save_subscriptions(subs)

    return {
        "status": "subscribed",
        "subscription_id": sub_id,
        "url": sub.url,
        "events": sub.events,
        "signing_secret": raw_secret,
        "note": "Save the signing secret now. It is stored hashed on disk."
    }

@router.get("/subscriptions", summary="List Active Webhook Subscriptions (Protected)")
async def list_subscriptions(
    auth: Dict[str, Any] = Depends(require_api_key)
) -> List[Dict[str, Any]]:
    """Returns registered webhook endpoints. Pass valid X-API-Key."""
    subs = _load_subscriptions()
    # Strip secret hashes from list view for security
    return [
        {k: v for k, v in s.items() if k != "secret_hash"}
        for s in subs
    ]

@router.post("/test-dispatch", summary="Simulate Webhook Event Dispatch (SSRF Guarded)")
async def test_dispatch(
    data: WebhookDispatchInput,
    auth: Dict[str, Any] = Depends(require_api_key)
) -> Dict[str, Any]:
    """
    Fires a simulated webhook event dispatch.
    Validates target URL against SSRF and computes an HMAC-SHA256 signature.
    """
    if data.target_url:
        validate_webhook_url(data.target_url)

    event_id = f"evt_{uuid.uuid4().hex[:10]}"
    ephemeral_secret = f"whsec_{uuid.uuid4().hex[:16]}"
    
    # Calculate HMAC signature over raw payload JSON string
    payload_str = json.dumps(data.payload, sort_keys=True)
    signature = hmac.new(ephemeral_secret.encode("utf-8"), payload_str.encode("utf-8"), hashlib.sha256).hexdigest()
    
    dispatch_record = {
        "event_id": event_id,
        "event_type": data.event_type,
        "target_url": data.target_url or "https://nic.gov.in/webhooks/landgov-events",
        "payload": data.payload,
        "headers": {
            "X-LandGov-Event": data.event_type,
            "X-LandGov-Delivery": event_id,
            "X-LandGov-Signature-256": f"sha256={signature}",
            "User-Agent": "LandGovernancePlatform-Webhook/1.2"
        },
        "delivered": True,
        "http_status": 200,
        "dispatched_by": auth.get("developer_name", "api_client"),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    _DISPATCHED_EVENTS.append(dispatch_record)
    return {
        "status": "dispatched",
        "delivery": dispatch_record,
        "ephemeral_signing_secret": ephemeral_secret,
        "verification_guide": "Verify with: hmac.new(secret.encode(), json.dumps(payload, sort_keys=True).encode(), hashlib.sha256).hexdigest()"
    }

@router.get("/events", summary="Get Webhook Delivery Event Log")
async def get_events(limit: int = 20) -> List[Dict[str, Any]]:
    """Returns historical event delivery audit log."""
    return _DISPATCHED_EVENTS[-limit:]

@router.post("/api-keys/generate", summary="Generate Developer API Key (Requires Login)")
async def generate_api_key(
    inp: ApiKeyGenerateInput,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generates a developer API key for programmatic integration (Module 9).
    Requires authenticated session (Bearer token).
    The raw API key is returned ONCE to the user; only a SHA-256 hash is persisted.
    """
    raw_key = f"lgp_live_{uuid.uuid4().hex}"
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    key_prefix = raw_key[:12] + "..."

    key_record = {
        "key_hash": key_hash,
        "key_prefix": key_prefix,
        "developer_name": inp.developer_name,
        "organization": inp.organization,
        "role": inp.role,
        "user_email": getattr(current_user, "email", "authenticated_user"),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    keys = _load_api_keys()
    keys.append(key_record)
    _save_api_keys(keys)

    return {
        "api_key": raw_key,
        "key_prefix": key_prefix,
        "developer_name": inp.developer_name,
        "organization": inp.organization,
        "role": inp.role,
        "rate_limit": "120 requests/minute",
        "created_at": key_record["created_at"],
        "header_usage": f"Pass via header 'X-API-Key: {raw_key}'",
        "security_note": "This raw API key is displayed once and NEVER stored in plaintext. It is hashed on the server."
    }
