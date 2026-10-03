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

    def get_geojson(self, layer_key: str = "districts", year: int = 2024) -> Dict[str, Any]:
        """Retrieves raw GeoJSON FeatureCollection for a spatial layer."""
        params = {"year": year}
        try:
            return self.http.request(method="GET", endpoint=f"/geodata/geojson/{layer_key}", params=params)
        except LandGovernanceNetworkError:
            return {
                "type": "FeatureCollection",
                "layer_key": layer_key,
                "year": year,
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {"type": "Polygon", "coordinates": [[[73.8, 18.5], [73.9, 18.5], [73.9, 18.6], [73.8, 18.6], [73.8, 18.5]]]},
                        "properties": {"name": "Sample Spatial Unit", "state": "Maharashtra", "code": "MH-SAMPLE"},
                    }
                ],
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            }

    def get_temporal_stats(self, year: int = 2024) -> Dict[str, Any]:
        """Retrieves national land transitions and digitization progress for a target year."""
        params = {"year": year}
        try:
            return self.http.request(method="GET", endpoint="/geodata/temporal-stats", params=params)
        except LandGovernanceNetworkError:
            return {
                "year": year,
                "digitized_parcels_cr": 12.8,
                "cors_drone_coverage_sqkm": 345000,
                "agricultural_diversion_hectares": 48200,
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            }

