"""
Land Governance Platform SDK - Configuration
"""

from typing import Optional, Dict
from pydantic import BaseModel, Field

DEFAULT_BASE_URL = "http://127.0.0.1:8000/api/v1"
DEFAULT_TIMEOUT = 30.0

class ClientConfig(BaseModel):
    base_url: str = Field(default=DEFAULT_BASE_URL, description="Base API endpoint URL")
    token: Optional[str] = Field(default=None, description="JWT Bearer Authentication Token")
    api_key: Optional[str] = Field(default=None, description="X-API-Key for developer access")
    timeout: float = Field(default=DEFAULT_TIMEOUT, description="HTTP request timeout in seconds")
    offline: bool = Field(
        default=False,
        description="Force SDK into offline mode, skipping all network requests intentionally"
    )
    fallback_to_offline: bool = Field(
        default=False,
        description="Explicitly opt-in to fall back to offline datasets ONLY on network errors or 5xx server crashes"
    )
    headers: Dict[str, str] = Field(default_factory=dict, description="Custom HTTP headers")
