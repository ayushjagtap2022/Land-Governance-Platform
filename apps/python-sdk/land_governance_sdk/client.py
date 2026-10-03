"""
LandGovernanceClient - Master Entry Point for the Python SDK
"""

from typing import Optional, Dict, Any
from .config import ClientConfig
from .http_client import HttpClient
from .modules.auth import AuthModule
from .modules.repository import RepositoryModule
from .modules.assistant import AssistantModule
from .modules.workspaces import WorkspacesModule
from .modules.geodata import GeodataModule
from .modules.analytics import AnalyticsModule
from .modules.simulate import SimulateModule
from .modules.ml import MlModule
from .modules.innovation import InnovationModule
from .modules.admin import AdminModule
from .modules.notifications import NotificationsModule
from .modules.health import HealthModule

class LandGovernanceClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        token: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        offline: bool = False,
        fallback_to_offline: bool = False,
        config: Optional[ClientConfig] = None,
    ):
        if config is None:
            config = ClientConfig(
                base_url=base_url or "http://127.0.0.1:8000/api/v1",
                token=token,
                api_key=api_key,
                timeout=timeout,
                offline=offline,
                fallback_to_offline=fallback_to_offline,
            )

        self.http = HttpClient(config)

        # 11 Service Modules
        self.auth = AuthModule(self.http)
        self.repository = RepositoryModule(self.http)
        self.documents = self.repository  # Memorable Alias

        self.assistant = AssistantModule(self.http)
        self.ai = self.assistant  # Memorable Alias

        self.workspaces = WorkspacesModule(self.http)

        self.geodata = GeodataModule(self.http)
        self.gis = self.geodata  # Memorable Alias

        self.analytics = AnalyticsModule(self.http)

        self.simulate = SimulateModule(self.http)
        self.simulation = self.simulate  # Memorable Alias

        self.ml = MlModule(self.http)
        self.innovation = InnovationModule(self.http)
        self.admin = AdminModule(self.http)
        self.notifications = NotificationsModule(self.http)
        self.health = HealthModule(self.http)

    def set_token(self, token: Optional[str]) -> None:
        """Sets or clears the active JWT Bearer authentication token."""
        self.http.set_token(token)

    def get_token(self) -> Optional[str]:
        """Retrieves active JWT Bearer token."""
        return self.http.get_token()

    def is_authenticated(self) -> bool:
        """Checks if client session has an active JWT token."""
        return bool(self.http.get_token())

    def logout(self) -> None:
        """Clears active session authentication token."""
        self.http.set_token(None)

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Shortcut for self.auth.login(). Automatically configures session token."""
        return self.auth.login(email=email, password=password)

    def get_base_url(self) -> str:
        """Returns configured base API URL."""
        return self.http.get_base_url()
