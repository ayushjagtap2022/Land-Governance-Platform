"""
Land Governance Platform SDK - Webhooks & Developer API Key Module (Module 9)
Provides programmatic management of webhook event subscriptions, HMAC-SHA256 dispatches,
and API key provisioning for enterprise inter-departmental integration.
"""

from typing import Dict, Any, List, Optional
from ..http_client import HttpClient
from ..errors import LandGovernanceOfflineError, LandGovernanceNetworkError

class WebhooksModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def list_subscriptions(self) -> List[Dict[str, Any]]:
        """Retrieves active webhook notification endpoints."""
        try:
            return self.http.request(method="GET", endpoint="/webhooks/subscriptions")
        except LandGovernanceNetworkError:
            return [
                {
                    "id": "sub_offline_01",
                    "url": "https://nic.gov.in/webhooks/landgov-events",
                    "events": ["simulation.completed", "document.approved"],
                    "status": "active",
                    "source": "offline",
                    "is_offline": True,
                }
            ]

    def subscribe(
        self,
        url: str,
        events: Optional[List[str]] = None,
        secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """Registers a new webhook subscriber endpoint."""
        if self.http.is_offline():
            raise LandGovernanceOfflineError("Webhook registration is disabled in offline mode.")

        payload = {
            "url": url,
            "events": events or ["simulation.completed", "document.approved"],
        }
        if secret:
            payload["secret"] = secret

        return self.http.request(
            method="POST",
            endpoint="/webhooks/subscribe",
            json_data=payload,
            is_write_op=True
        )

    def test_dispatch(
        self,
        event_type: str = "simulation.completed",
        payload: Optional[Dict[str, Any]] = None,
        target_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Simulates a webhook event delivery with HMAC-SHA256 signature."""
        try:
            body = {
                "event_type": event_type,
                "payload": payload or {
                    "simulation_id": "sim_demo_01",
                    "state": "Maharashtra",
                    "dispute_reduction_pct": 3.5,
                }
            }
            if target_url:
                body["target_url"] = target_url

            return self.http.request(
                method="POST",
                endpoint="/webhooks/test-dispatch",
                json_data=body
            )
        except LandGovernanceNetworkError:
            return {
                "status": "dispatched",
                "delivery": {
                    "event_id": "evt_offline_mock",
                    "event_type": event_type,
                    "delivered": True,
                    "http_status": 200,
                    "source": "offline",
                },
                "source": "offline",
                "is_offline": True,
            }

    def get_events(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves audit trail of dispatched webhook events."""
        try:
            return self.http.request(method="GET", endpoint="/webhooks/events", params={"limit": limit})
        except LandGovernanceNetworkError:
            return [
                {
                    "event_id": "evt_hist_01",
                    "event_type": "simulation.completed",
                    "delivered": True,
                    "source": "offline",
                    "is_offline": True,
                }
            ]

    def generate_api_key(
        self,
        developer_name: str = "DoLR Research Fellow",
        organization: str = "Department of Land Resources",
        role: str = "Researcher"
    ) -> Dict[str, Any]:
        """Provisions a developer API key for programmatic access."""
        if self.http.is_offline():
            raise LandGovernanceOfflineError("API key generation is disabled in offline mode.")

        return self.http.request(
            method="POST",
            endpoint="/webhooks/api-keys/generate",
            json_data={
                "developer_name": developer_name,
                "organization": organization,
                "role": role,
            },
            is_write_op=True
        )
