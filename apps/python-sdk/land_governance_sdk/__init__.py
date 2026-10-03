"""
Official Python SDK for the National Land Governance Platform (SIH PS 26019)
"""

from .client import LandGovernanceClient
from .config import ClientConfig
from .errors import (
    LandGovernanceSDKError,
    LandGovernanceApiError,
    LandGovernanceNetworkError,
    LandGovernanceTimeoutError,
    LandGovernanceOfflineError,
)

def create_client(
    base_url: str = "http://127.0.0.1:8000/api/v1",
    token: str = None,
    offline: bool = False,
    fallback_to_offline: bool = False,
) -> LandGovernanceClient:
    """Convenience factory function to create a LandGovernanceClient instance."""
    return LandGovernanceClient(
        base_url=base_url,
        token=token,
        offline=offline,
        fallback_to_offline=fallback_to_offline,
    )

__all__ = [
    "LandGovernanceClient",
    "ClientConfig",
    "LandGovernanceSDKError",
    "LandGovernanceApiError",
    "LandGovernanceNetworkError",
    "LandGovernanceTimeoutError",
    "LandGovernanceOfflineError",
    "create_client",
]
