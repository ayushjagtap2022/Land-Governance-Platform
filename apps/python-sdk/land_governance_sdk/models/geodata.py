"""
Land Governance Platform SDK - GIS Geodata Models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DistrictItem(BaseModel):
    district: str = Field(description="District name")
    state: str = Field(description="State / Union Territory name")
    lat: float = Field(description="Latitude coordinate")
    lng: float = Field(description="Longitude coordinate")
    population: int = Field(default=0, description="District population")
    dispute_risk: float = Field(default=0.0, description="ML litigation risk score (0-100)")
    modernization_index: int = Field(default=70, description="DILRMP digitization progress index (0-100)")
    svamitva_cards_issued: str = Field(default="0", description="Total SVAMITVA property cards issued")
    digitization_status: str = Field(default="In-Progress", description="Digitization tier")
    economic_density_index: float = Field(default=50.0, description="NITI Aayog economic density index")
    forest_cover_pct: float = Field(default=15.0, description="Forest canopy cover percentage")
    net_sown_pct: float = Field(default=50.0, description="Net sown agricultural area percentage")
    non_agri_land_pct: float = Field(default=15.0, description="Non-agricultural built-up expansion percentage")
    irrigation_coverage_pct: float = Field(default=40.0, description="Gross irrigated area percentage")
    canal_share_pct: float = Field(default=30.0, description="Canal irrigation share")
    well_share_pct: float = Field(default=60.0, description="Tubewell/Well irrigation share")
    risk_category: str = Field(default="Low", description="Risk tier ('Low', 'Moderate', 'High')")
    source: str = Field(default="live", description="Data origin ('live' or 'offline')")
    is_offline: bool = Field(default=False, description="True if retrieved from offline fallback cache")

class DistrictList(BaseModel):
    districts: List[DistrictItem]
    count: int
    source: str = "live"

    def to_dataframe(self) -> Any:
        """Converts district list into a Pandas DataFrame with source metadata."""
        try:
            import pandas as pd
            records = [d.model_dump() for d in self.districts]
            df = pd.DataFrame(records)
            df.attrs["source"] = self.source
            return df
        except ImportError:
            raise ImportError("Pandas is required for .to_dataframe(). Install via 'pip install land-governance-sdk[pandas]'")

class LayerCatalog(BaseModel):
    satellite: Dict[str, Any]
    cadastral: Dict[str, Any]
    lulc: Dict[str, Any]
    dispute: Dict[str, Any]
    climate: Dict[str, Any]
    source: str = "live"
