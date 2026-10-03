"""
Land Governance Platform SDK - Health Module
"""

from typing import Dict, Any
from ..http_client import HttpClient, ResponseDict
from ..errors import LandGovernanceNetworkError

class HealthModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def check(self) -> Dict[str, Any]:
        """Checks API server status and connectivity."""
        try:
            return self.http.request(method="GET", endpoint="/healthz")
        except LandGovernanceNetworkError:
            return ResponseDict({
                "status": "offline",
                "database": "disconnected",
                "mode": "offline",
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            })
