"""
Land Governance Platform SDK - Innovation Portal Module
"""

from typing import Dict, Any, List, Optional
from ..http_client import HttpClient
from ..errors import LandGovernanceNetworkError, LandGovernanceOfflineError

class InnovationModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def list_challenges(self) -> List[Dict[str, Any]]:
        """Lists active land governance innovation challenges."""
        try:
            return self.http.request(method="GET", endpoint="/innovation/challenges")
        except LandGovernanceNetworkError:
            return [
                {
                    "id": "chal-01",
                    "title": "SIH PS 26019: National Land Governance Platform",
                    "organizer": "Department of Land Resources (DoLR)",
                    "reward_pool_inr": "₹1,00,000",
                    "status": "Active",
                    "source": "offline",
                    "is_offline": True,
                }
            ]

    def submit_proposal(self, challenge_id: str, title: str, description: str) -> Dict[str, Any]:
        """Submits an innovation proposal for a challenge."""
        if self.http.is_offline():
            raise LandGovernanceOfflineError("Submitting innovation proposals is disabled in offline mode.")

        return self.http.request(
            method="POST",
            endpoint="/innovation/proposals",
            json_data={"challenge_id": challenge_id, "title": title, "description": description},
            is_write_op=True,
        )
