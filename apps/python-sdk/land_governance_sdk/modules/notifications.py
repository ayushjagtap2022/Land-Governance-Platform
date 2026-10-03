"""
Land Governance Platform SDK - Notifications Module
"""

from typing import Dict, Any, List
from ..http_client import HttpClient
from ..errors import LandGovernanceNetworkError

class NotificationsModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def list(self) -> List[Dict[str, Any]]:
        """Lists active platform alerts and notifications."""
        try:
            return self.http.request(method="GET", endpoint="/notifications/list")
        except LandGovernanceNetworkError:
            return [
                {
                    "id": "notif-01",
                    "title": "DILRMP Drone Survey Vectorization Complete",
                    "severity": "info",
                    "source": "offline",
                    "is_offline": True,
                }
            ]
