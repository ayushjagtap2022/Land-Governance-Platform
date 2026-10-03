"""
Land Governance Platform SDK - Workspaces Module
"""

from typing import Dict, Any, List, Optional
from ..http_client import HttpClient
from ..errors import LandGovernanceNetworkError

class WorkspacesModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def list(self) -> List[Dict[str, Any]]:
        """Lists collaborative user workspaces."""
        try:
            return self.http.request(method="GET", endpoint="/workspaces/list")
        except LandGovernanceNetworkError:
            return [
                {
                    "id": "ws-01",
                    "name": "DoLR Spatial Intelligence Hub",
                    "role": "Super Admin",
                    "source": "offline",
                    "is_offline": True,
                }
            ]

    def create(self, name: str, description: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Creates a new collaborative research workspace (Disabled in offline mode)."""
        return self.http.request(
            method="POST",
            endpoint="/workspaces/create",
            json_data={"name": name, "description": description, **kwargs},
            is_write_op=True,
        )
