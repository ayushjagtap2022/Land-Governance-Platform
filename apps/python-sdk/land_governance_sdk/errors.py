"""
Land Governance Platform SDK - Custom Exception Classes
"""

from typing import Optional, Any

class LandGovernanceSDKError(Exception):
    """Base exception class for all SDK errors."""
    pass

class LandGovernanceApiError(LandGovernanceSDKError):
    """Exception raised when API server returns an HTTP error response (HTTP status >= 400)."""

    def __init__(self, message: str, status_code: int = 500, payload: Optional[Any] = None):
        super().__init__(f"[HTTP {status_code}] {message}")
        self.message = message
        self.status_code = status_code
        self.payload = payload

    @property
    def is_unauthorized(self) -> bool:
        return self.status_code == 401

    @property
    def is_forbidden(self) -> bool:
        return self.status_code == 403

    @property
    def is_not_found(self) -> bool:
        return self.status_code == 404

    @property
    def is_rate_limited(self) -> bool:
        return self.status_code == 429

    @property
    def is_server_error(self) -> bool:
        return self.status_code >= 500

class LandGovernanceNetworkError(LandGovernanceSDKError):
    """Exception raised when network connection fails and offline fallback is disabled."""
    pass

class LandGovernanceTimeoutError(LandGovernanceSDKError):
    """Exception raised when HTTP request times out."""
    pass

class LandGovernanceOfflineError(LandGovernanceSDKError):
    """Exception raised when write operations (create, update, delete) are attempted in offline mode."""
    pass
