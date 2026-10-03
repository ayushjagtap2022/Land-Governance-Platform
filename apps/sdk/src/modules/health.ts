/**
 * Health Check Module.
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';

export interface HealthCheckResponse {
  status: string;
  database: string;
}

export class HealthModule {
  constructor(private http: HttpClient) {}

  /**
   * Check if the API and Neon Database are operational.
   */
  public async check(options?: RequestOptions): Promise<HealthCheckResponse> {
    return this.http.get<HealthCheckResponse>('/healthz', undefined, options);
  }
}
