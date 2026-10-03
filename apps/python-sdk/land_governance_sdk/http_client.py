"""
Land Governance Platform SDK - HTTP Client Engine
Executes HTTP requests via httpx with token auth, error handling, single-warning deduplication, and strict offline fallback rules.
"""

import logging
import warnings
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import httpx

from .config import ClientConfig
from .errors import (
    LandGovernanceApiError,
    LandGovernanceNetworkError,
    LandGovernanceOfflineError,
    LandGovernanceTimeoutError,
)

logger = logging.getLogger("land_governance_sdk")

class ResponseDict(dict):
    """Dictionary response subclass supporting .source, .is_offline, and .is_sample attribute access."""
    def __getattr__(self, name: str) -> Any:
        if name in self:
            return self[name]
        raise AttributeError(f"'ResponseDict' object has no attribute '{name}'")

    @property
    def source(self) -> str:
        return self.get("source", "live")

    @property
    def is_offline(self) -> bool:
        return bool(self.get("is_offline", False))

    @property
    def is_sample(self) -> bool:
        return bool(self.get("is_sample", False))


class ResponseList(list):
    """List response subclass supporting .source, .is_offline, and .is_sample attribute access."""
    def __init__(
        self,
        iterable=None,
        source: str = "live",
        is_offline: bool = False,
        is_sample: bool = False,
    ):
        super().__init__(iterable or [])
        self.source = source
        self.is_offline = is_offline
        self.is_sample = is_sample


class HttpClient:
    def __init__(
        self,
        config: Optional[ClientConfig] = None,
        transport: Optional[httpx.BaseTransport] = None,
    ):
        self.config = config or ClientConfig()
        self._transport = transport
        self._token: Optional[str] = self.config.token
        self._api_key: Optional[str] = self.config.api_key
        self._has_warned_offline: bool = False


    def set_token(self, token: Optional[str]) -> None:
        self._token = token
        self.config.token = token

    def get_token(self) -> Optional[str]:
        return self._token

    def set_api_key(self, api_key: Optional[str]) -> None:
        self._api_key = api_key
        self.config.api_key = api_key

    def get_base_url(self) -> str:
        return self.config.base_url.rstrip("/")

    def is_offline(self) -> bool:
        return self.config.offline

    def _warn_offline_once(self, reason: str) -> None:
        if not self._has_warned_offline:
            msg = f"[Land Governance SDK] {reason}. Operating in OFFLINE mode (data_source='offline')."
            logger.warning(msg)
            warnings.warn(msg, UserWarning, stacklevel=3)
            self._has_warned_offline = True

    def request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
        is_write_op: bool = False,
    ) -> Any:
        """Executes HTTP request to backend server with strict offline fallback rules."""
        method_upper = method.upper()
        if is_write_op or method_upper in ("PUT", "PATCH", "DELETE"):
            is_write_op = True

        # Rule 3: Write operations fail in offline mode
        if self.config.offline:
            if is_write_op:
                raise LandGovernanceOfflineError(
                    f"Write operation '{method_upper} /{endpoint.lstrip('/')}' is disabled in offline mode."
                )
            self._warn_offline_once("SDK configured with offline=True")
            raise LandGovernanceNetworkError("SDK is forced into offline mode.")

        # Build URL & Headers
        clean_endpoint = endpoint.lstrip("/")
        base = self.get_base_url()
        url = f"{base}/{clean_endpoint}"

        if params:
            clean_params = {k: str(v) for k, v in params.items() if v is not None}
            if clean_params:
                url = f"{url}?{urlencode(clean_params)}"

        req_headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            **self.config.headers,
            **(headers or {})
        }

        if self._token:
            req_headers["Authorization"] = f"Bearer {self._token}"

        if self._api_key:
            req_headers["X-API-Key"] = self._api_key

        try:
            with httpx.Client(timeout=self.config.timeout, transport=self._transport) as client:
                resp = client.request(

                    method=method_upper,
                    url=url,
                    json=json_data,
                    headers=req_headers
                )
                status_code = resp.status_code

                try:
                    data = resp.json()
                except Exception:
                    data = resp.text

                # Handle HTTP Status Errors
                if status_code >= 400:
                    msg = data.get("detail", str(data)) if isinstance(data, dict) else str(data)

                    # Rule 1: 401, 403, 404, 429 MUST ALWAYS RAISE and NEVER fall back
                    if status_code in (401, 403, 404, 429) or status_code < 500:
                        raise LandGovernanceApiError(message=str(msg), status_code=status_code, payload=data)

                    # 5xx Server Error: Fallback ONLY if fallback_to_offline=True and read op
                    if self.config.fallback_to_offline and not is_write_op:
                        self._warn_offline_once(f"Backend HTTP {status_code} server error")
                        raise LandGovernanceNetworkError(f"Backend 5xx error: {msg}")

                    raise LandGovernanceApiError(message=str(msg), status_code=status_code, payload=data)

                # Attach source: "live" metadata if dictionary or list
                if isinstance(data, dict):
                    data["source"] = "live"
                    data["is_offline"] = False
                    return ResponseDict(data)
                elif isinstance(data, list):
                    return ResponseList(data, source="live", is_offline=False, is_sample=False)

                return data

        except LandGovernanceApiError:
            raise
        except (httpx.RequestError, httpx.TimeoutException) as e:
            if self.config.fallback_to_offline:
                if is_write_op:
                    raise LandGovernanceOfflineError(
                        f"Cannot execute write operation '{method_upper} /{clean_endpoint}' while backend is unreachable."
                    )
                self._warn_offline_once(f"Network connection failed ({type(e).__name__})")
                raise LandGovernanceNetworkError(f"Backend connection unreachable: {str(e)}")

            if isinstance(e, httpx.TimeoutException):
                raise LandGovernanceTimeoutError(f"HTTP request to {url} timed out after {self.config.timeout}s.")
            raise LandGovernanceNetworkError(f"Failed to connect to backend at {url}: {str(e)}")
