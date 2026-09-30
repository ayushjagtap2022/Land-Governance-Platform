"""
FastAPI Router for Geospatial & GIS Data (Module 5)
Endpoints:
  - GET /api/v1/geodata/layers: Catalog of toggleable GIS layers, WMS links, and style configurations
  - GET /api/v1/geodata/districts: All 640 Indian districts with coordinates, demographics, and ML dispute risk
  - GET /api/v1/geodata/geojson/{layer_key}: Real GeoJSON polygons with time-slider parameters
"""

from typing import List, Optional
from fastapi import APIRouter, Query

from app.services.geodata_service import geodata_service

router = APIRouter()

@router.get("/layers", summary="Get GIS Layer Catalog & WMS Settings")
def get_gis_layers():
    """Returns toggleable layers: Cadastral, LULC, Dispute Heatmap, Climate Risk, and Bhuvan ISRO imagery."""
    return geodata_service.get_layers_config()

@router.get("/districts", summary="List Districts with Spatial Coordinates & Demographics")
def list_spatial_districts(
    state: Optional[str] = Query(None, description="Optional state filter"),
    year: int = Query(2024, ge=1999, le=2025, description="Year for multi-temporal land governance indicators (1999-2025)"),
    limit: int = Query(640, ge=1, le=1000, description="District limit")
):
    """Returns real Indian districts with lat/lng, Census population, modernization %, and dispute risk."""
    return geodata_service.list_districts(state=state, year=year, limit=limit)

@router.get("/temporal-stats", summary="Get National Land Transitions & Digitization Progress for Year")
def get_temporal_statistics(
    year: int = Query(2024, ge=1999, le=2025, description="Year for multi-temporal land use progression (1999-2025)")
):
    """Returns MoAFW-derived land use percentages, cadastral digitization %, and SVAMITVA cards for the selected year."""
    return geodata_service.get_temporal_stats(year=year)

@router.get("/geojson/{layer_key}", summary="Get GeoJSON FeatureCollection for Layer")
def get_geojson_layer(
    layer_key: str,
    year: int = Query(2024, ge=1999, le=2025, description="Year for multi-temporal land use time-slider")
):
    """Returns GeoJSON FeatureCollection for cadastral survey plots, LULC zones, or climate risks."""
    return geodata_service.get_geojson_layer(layer_key=layer_key, year=year)


from fastapi import File, UploadFile, HTTPException

@router.post("/upload-geojson", summary="Upload Custom GeoJSON Layer for GIS Map")
async def upload_custom_geojson(
    layer_key: str = Query("cadastral", description="Layer to attach: cadastral, lulc, or climate"),
    file: UploadFile = File(...)
):
    """Uploads a custom GeoJSON file to be dynamically rendered on the GIS map."""
    if not (file.filename.endswith(".json") or file.filename.endswith(".geojson")):
        raise HTTPException(status_code=400, detail="Only .json or .geojson files are supported")
    
    content = await file.read()
    result = geodata_service.save_uploaded_geojson(layer_key=layer_key, filename=file.filename, content=content)
    return result


