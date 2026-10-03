/**
 * Common types and pagination interfaces for the Land Governance Platform SDK.
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface RequestOptions {
  /**
   * Custom HTTP headers to include with the request.
   */
  headers?: Record<string, string>;
  /**
   * Override timeout in milliseconds for this specific request.
   */
  timeoutMs?: number;
  /**
   * Custom AbortSignal to cancel this request.
   */
  signal?: AbortSignal;
  /**
   * Override auth token for this request.
   */
  token?: string;
}
