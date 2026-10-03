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

    def get_showcase(self, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieves featured successful pilot projects from the innovation showcase."""
        try:
            return self.http.request(method="GET", endpoint="/innovation/showcase", params={"skip": skip, "limit": limit})
        except LandGovernanceNetworkError:
            return [
                {
                    "id": "showcase-01",
                    "title": "AI Cadastral Boundary Reconciler",
                    "team": "IIT Bombay GeoAI Lab",
                    "impact": "40% reduction in revenue court boundary hearings in Satara",
                    "status": "Pilot Completed",
                    "source": "offline",
                    "is_offline": True,
                    "is_sample": True,
                }
            ]

    def get_stats(self) -> Dict[str, Any]:
        """Retrieves innovation ecosystem aggregate statistics."""
        try:
            return self.http.request(method="GET", endpoint="/innovation/stats")
        except LandGovernanceNetworkError:
            return {
                "active_challenges": 3,
                "submitted_proposals": 42,
                "funded_pilots": 8,
                "total_grants_awarded_lakhs": 45.0,
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            }

    def get_leaderboard(self, challenge_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieves ranked public leaderboard for an innovation challenge."""
        try:
            return self.http.request(
                method="GET",
                endpoint=f"/innovation/challenges/{challenge_id}/leaderboard",
                params={"limit": limit}
            )
        except LandGovernanceNetworkError:
            return [
                {
                    "rank": 1,
                    "proposal_id": "prop-01",
                    "title": "Sub-Centimeter Ortho-rectified Cadastral Matcher",
                    "jury_score": 94.5,
                    "votes": 128,
                    "source": "offline",
                    "is_offline": True,
                    "is_sample": True,
                }
            ]

