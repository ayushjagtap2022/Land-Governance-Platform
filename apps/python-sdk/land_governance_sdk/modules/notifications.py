"""
Land Governance Platform SDK - Notifications Module
"""

from typing import Dict, Any, List
from ..http_client import HttpClient, ResponseList
from ..errors import LandGovernanceNetworkError

class NotificationsModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def list(self) -> List[Dict[str, Any]]:
        """Lists active platform alerts and notifications."""
        try:
            return self.http.request(method="GET", endpoint="/notifications/")
        except LandGovernanceNetworkError:
            return ResponseList(
                [
                    {
                        "id": "notif-01",
                        "title": "DILRMP Drone Survey Vectorization Complete",
                        "severity": "info",
                        "source": "offline",
                        "is_offline": True,
                        "is_sample": True,
                    }
                ],
                source="offline",
                is_offline=True,
                is_sample=True,
            )
