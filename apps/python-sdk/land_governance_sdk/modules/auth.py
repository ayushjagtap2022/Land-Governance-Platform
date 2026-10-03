"""
Land Governance Platform SDK - Auth Module
"""

from typing import Dict, Any, Optional
from ..http_client import HttpClient
from ..errors import LandGovernanceOfflineError

class AuthModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticates user and attaches JWT token to the client session."""
        if self.http.is_offline():
            raise LandGovernanceOfflineError("Authentication login is disabled in offline mode.")

        data = self.http.request(
            method="POST",
            endpoint="/auth/login",
            json_data={"email": email, "password": password},
            is_write_op=True,
        )
        token = data.get("access_token")
        if token:
            self.http.set_token(token)
        return data

    def register(self, email: str, password: str, full_name: str, role: str = "public") -> Dict[str, Any]:
        """Registers new platform user."""
        if self.http.is_offline():
            raise LandGovernanceOfflineError("User registration is disabled in offline mode.")

        return self.http.request(
            method="POST",
            endpoint="/auth/register",
            json_data={"email": email, "password": password, "full_name": full_name, "role": role},
            is_write_op=True,
        )

    def get_me(self) -> Dict[str, Any]:
        """Retrieves active user profile."""
        return self.http.request(method="GET", endpoint="/auth/me")
