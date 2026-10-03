"""
Land Governance Platform SDK - Admin Portal Module
"""

from typing import Dict, Any
from ..http_client import HttpClient, ResponseDict
from ..errors import LandGovernanceNetworkError

class AdminModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def get_telemetry(self) -> Dict[str, Any]:
        """Retrieves system telemetry and usage audit metrics."""
        try:
            return self.http.request(method="GET", endpoint="/admin/stats")
        except LandGovernanceNetworkError:
            return ResponseDict({
                "active_sessions": 42,
                "api_latency_ms": 14.5,
                "vector_db_documents": 12850,
                "sample_note": "Synthetic offline telemetry metrics",
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            })

    def get_audit_logs(self, limit: int = 50) -> Dict[str, Any]:
        """Retrieves tamper-evident administrative audit log trails."""
        try:
            return self.http.request(method="GET", endpoint="/admin/audit-logs", params={"limit": limit})
        except LandGovernanceNetworkError:
            return ResponseDict({
                "logs": [
                    {"id": "LOG-01", "action": "LOGIN_SUCCESS", "user": "officer@dolr.gov.in", "timestamp": "2024-10-01T10:00:00Z"},
                    {"id": "LOG-02", "action": "SIMULATION_RUN", "user": "researcher@iitb.ac.in", "timestamp": "2024-10-01T11:15:00Z"},
                ],
                "count": 2,
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            })
