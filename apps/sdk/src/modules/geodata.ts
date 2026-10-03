/**
 * Geodata Module (Module 5: GIS & Geospatial Visualization Engine).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  DistrictSpatialItem,
  GeoJsonObject,
  GisLayersCatalog,
  TemporalStats,
} from '../types/geodata';

export class GeodataModule {
  constructor(private http: HttpClient) {}

  /**
   * Get the catalog of toggleable GIS layers, WMS endpoints, and style configurations.
   */
  public async getLayers(options?: RequestOptions): Promise<GisLayersCatalog> {
    return this.http.get<GisLayersCatalog>('/geodata/layers', undefined, options);
  }

  /**
   * List Indian districts with lat/lng coordinates, Census demographics,
   * cadastral modernization %, and dispute risk scores.
   */
  public async listDistricts(
    params?: {
      state?: string;
      year?: number;
      limit?: number;
    },
    options?: RequestOptions
  ): Promise<DistrictSpatialItem[]> {
    return this.http.get<DistrictSpatialItem[]>('/geodata/districts', params, options);
  }

  /**
   * Memorable alias for listDistricts() — returns spatial district data.
   */
  public async getDistricts(
    params?: {
      state?: string;
      year?: number;
      limit?: number;
    },
    options?: RequestOptions
  ): Promise<DistrictSpatialItem[]> {
    return this.listDistricts(params, options);
  }

  /**
   * Get national multi-temporal land use transitions and digitization statistics for a given year.
   */
  public async getTemporalStats(
    year: number = 2024,
    options?: RequestOptions
  ): Promise<TemporalStats> {
    return this.http.get<TemporalStats>('/geodata/temporal-stats', { year }, options);
  }

  /**
   * Fetch GeoJSON FeatureCollection for a specific layer key (cadastral, lulc, climate).
   */
  public async getGeoJson(
    layerKey: string,
    year: number = 2024,
    options?: RequestOptions
  ): Promise<GeoJsonObject> {
    return this.http.get<GeoJsonObject>(
      `/geodata/geojson/${encodeURIComponent(layerKey)}`,
      { year },
      options
    );
  }

  /**
   * Upload custom GeoJSON layer (.json or .geojson) to attach to the GIS visualization engine.
   */
  public async uploadGeoJson(
    file: Blob | File | any,
    layerKey: string = 'cadastral',
    filename: string = 'layer.geojson',
    options?: RequestOptions
  ): Promise<any> {
    const formData = new FormData();
    if (typeof file === 'object' && 'name' in file && file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, filename);
    }

    return this.http.postForm(
      '/geodata/upload-geojson',
      formData,
      {
        ...options,
        params: { layer_key: layerKey, ...(options?.headers ? {} : {}) },
      }
    );
  }
}
