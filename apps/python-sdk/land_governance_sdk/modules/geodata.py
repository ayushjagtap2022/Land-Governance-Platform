"""
Land Governance Platform SDK - GIS Geodata Module
"""

from typing import Optional, List, Dict, Any
from ..http_client import HttpClient
from ..errors import LandGovernanceNetworkError
from ..models.geodata import DistrictItem, DistrictList, LayerCatalog
from ..offline.dataset import get_offline_districts

class GeodataModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def get_districts(
        self,
        state: Optional[str] = None,
        year: int = 2024,
        limit: int = 640,
    ) -> DistrictList:
        """Retrieves 640 Indian district spatial indicators & land metrics."""
        params = {"state": state, "year": year, "limit": limit}

        try:
            raw = self.http.request(method="GET", endpoint="/geodata/districts", params=params)
            items_data = raw if isinstance(raw, list) else raw.get("districts", [])
            items = [DistrictItem(**d) for d in items_data]
            return DistrictList(districts=items, count=len(items), source="live")
        except LandGovernanceNetworkError as err:
            if not (self.http.config.fallback_to_offline or self.http.is_offline()):
                raise err
            raw_data = get_offline_districts()
            if state:
                st_clean = state.strip().upper()
                raw_data = [d for d in raw_data if d["state"].upper() == st_clean]
            items = [DistrictItem(**d) for d in raw_data[:limit]]
            return DistrictList(districts=items, count=len(items), source="offline")

    def get_layers(self) -> LayerCatalog:
        """Retrieves toggleable GIS layer catalog and WMS configuration."""
        try:
            raw = self.http.request(method="GET", endpoint="/geodata/layers")
            return LayerCatalog(**raw)
        except LandGovernanceNetworkError:
            return LayerCatalog(
                satellite={"label": "ISRO Bhuvan High-Res Ortho-imagery", "type": "raster", "opacity": 0.85},
                cadastral={"label": "Cadastral Boundary Vector Plots", "type": "vector", "opacity": 0.82},
                lulc={"label": "Land Use / Land Cover (ISRO IndiaSat)", "type": "vector", "opacity": 0.70},
                dispute={"label": "Dispute Density Heatmap", "type": "heatmap", "opacity": 0.58},
                climate={"label": "Climate Risk & Inundation Zones", "type": "vector", "opacity": 0.50},
                source="offline",
            )

    def upload_geojson(
        self,
        layer_name: str,
        geojson_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """Uploads custom GeoJSON layer (Disabled in offline mode)."""
        return self.http.request(
            method="POST",
            endpoint="/geodata/upload-geojson",
            json_data={"layer_name": layer_name, "geojson": geojson_data, **kwargs},
            is_write_op=True,
        )
