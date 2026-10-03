/**
 * GIS and Geospatial Visualization Types (Module 5).
 */

export interface GisLayerItem {
  label: string;
  description: string;
  type: 'raster' | 'vector' | 'heatmap' | string;
  visible: boolean;
  opacity: number;
  attribution?: string;
  wms_url?: string;
  color?: string;
  [key: string]: any;
}

export type GisLayersCatalog = Record<string, GisLayerItem>;


export interface DistrictSpatialItem {
  district: string;
  state: string;
  district_name?: string;
  state_name?: string;
  lat: number;
  lng: number;
  population?: number;
  area_sq_km?: number;
  modernization_pct?: number;
  modernization_index?: number;
  dispute_risk?: number;
  dispute_risk_score?: number;
  svamitva_cards_issued?: string | number;
  digitization_status?: string;
  economic_density_index?: number;
  forest_cover_pct?: number;
  net_sown_pct?: number;
  non_agri_land_pct?: number;
  risk_category?: string;
  vulnerability_index?: number;
  year?: number;
  [key: string]: any;
}

export interface TemporalStats {
  year: number;
  net_sown_area_pct?: number;
  forest_cover_pct?: number;
  non_agri_land_pct?: number;
  fallow_land_pct?: number;
  cadastral_digitization_pct?: number;
  svamitva_cards_issued?: number;
  [key: string]: any;
}

export interface GeoJsonObject {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: any;
    };
    properties: Record<string, any>;
  }>;
  [key: string]: any;
}
