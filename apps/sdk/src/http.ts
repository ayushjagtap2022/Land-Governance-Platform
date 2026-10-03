/**
 * HTTP Transport layer for the Land Governance Platform SDK.
 */

import { ClientConfig, DEFAULT_CONFIG } from './config';
import {
  LandGovernanceApiError,
  LandGovernanceError,
  LandGovernanceNetworkError,
  LandGovernanceTimeoutError,
} from './errors';
import { RequestOptions } from './types/common';

export class HttpClient {
  private config: ClientConfig;

  constructor(config: ClientConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...(config.headers || {}),
      },
    };
  }

  public setToken(token: string | undefined): void {
    this.config.token = token;
  }

  public getToken(): string | undefined {
    return this.config.token;
  }

  public setApiKey(apiKey: string | undefined): void {
    this.config.apiKey = apiKey;
  }

  public getBaseUrl(): string {
    return this.config.baseUrl || DEFAULT_CONFIG.baseUrl;
  }

  public getWsUrl(): string {
    if (this.config.wsUrl) {
      return this.config.wsUrl;
    }
    const httpUrl = this.getBaseUrl();
    if (httpUrl.startsWith('https://')) {
      return httpUrl.replace(/^https:\/\//, 'wss://');
    }
    return httpUrl.replace(/^http:\/\//, 'ws://');
  }

  public getFetch(): typeof fetch {
    if (this.config.fetch) {
      return this.config.fetch;
    }
    if (typeof fetch !== 'undefined') {
      return fetch;
    }
    throw new Error(
      'Global fetch is not available in this environment. Please provide a custom fetch implementation in ClientConfig.'
    );
  }

  public getWebSocketClass(): any {
    if (this.config.WebSocket) {
      return this.config.WebSocket;
    }
    if (typeof WebSocket !== 'undefined') {
      return WebSocket;
    }
    throw new Error(
      'Global WebSocket is not available in this environment. Please pass a custom WebSocket library (e.g. ws) in ClientConfig.WebSocket.'
    );
  }

  private buildUrl(path: string, queryParams?: Record<string, any>): string {
    const base = this.getBaseUrl().replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value === undefined || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            url.searchParams.append(key, String(item));
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  public async request<T = any>(
    method: string,
    path: string,
    options: {
      params?: Record<string, any>;
      body?: any;
      isFormData?: boolean;
    } & RequestOptions = {}
  ): Promise<T> {
    const fetchImpl = this.getFetch();
    const url = this.buildUrl(path, options.params);
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs ?? DEFAULT_CONFIG.timeoutMs;
    const maxRetries = this.config.retries ?? DEFAULT_CONFIG.retries;

    const headers: Record<string, string> = {
      ...this.config.headers,
      ...(options.headers || {}),
    };

    const token = options.token ?? this.config.token;
    if (token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (this.config.apiKey && !headers['X-API-Key'] && !headers['x-api-key']) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    let requestBody: any = options.body;
    if (options.body !== undefined && !options.isFormData) {
      if (typeof options.body === 'object' && !(options.body instanceof ArrayBuffer)) {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(options.body);
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      let timeoutId: any = null;

      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      }

      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      try {
        const response = await fetchImpl(url, {
          method,
          headers,
          body: requestBody,
          signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          let errorData: any = null;
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            try {
              errorData = await response.json();
            } catch {
              errorData = await response.text();
            }
          } else {
            errorData = await response.text();
          }

          if (response.status === 401 && this.config.onTokenExpired) {
            try {
              await this.config.onTokenExpired();
            } catch {
              // Ignore callback failure
            }
          }

          const apiError = new LandGovernanceApiError({
            status: response.status,
            statusText: response.statusText,
            url,
            method,
            data: errorData,
          });

          // Only retry on idempotent 5xx errors if retry count > 0
          if (response.status >= 500 && attempt < maxRetries && method === 'GET') {
            await new Promise((res) => setTimeout(res, 250 * Math.pow(2, attempt)));
            continue;
          }

          if (response.status >= 500 && this.config.fallbackToOffline && method === 'GET') {
            throw new LandGovernanceNetworkError(`Backend HTTP ${response.status} server error: ${JSON.stringify(errorData)}`);
          }

          throw apiError;
        }

        // Handle empty responses (204 No Content, etc.)
        if (response.status === 204) {
          return null as unknown as T;
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return (await response.json()) as T;
        }

        return (await response.text()) as unknown as T;
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);

        if (err instanceof LandGovernanceApiError) {
          throw err;
        }

        if (err.name === 'AbortError') {
          if (options.signal?.aborted) {
            throw new LandGovernanceError('Request was aborted by user.');
          }
          throw new LandGovernanceTimeoutError(timeoutMs, url);
        }

        lastError = new LandGovernanceNetworkError(
          `Network request to ${url} failed: ${err.message}`,
          err
        );

        if (attempt < maxRetries && (method === 'GET' || method === 'HEAD')) {
          await new Promise((res) => setTimeout(res, 250 * Math.pow(2, attempt)));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new LandGovernanceNetworkError(`Request to ${url} failed.`);
  }

  public get<T = any>(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('GET', path, { ...options, params });
  }

  public post<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions & { params?: Record<string, any> }
  ): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  public patch<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions & { params?: Record<string, any> }
  ): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  public put<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions & { params?: Record<string, any> }
  ): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  public delete<T = any>(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('DELETE', path, { ...options, params });
  }

  public postForm<T = any>(
    path: string,
    formData: any,
    options?: RequestOptions & { params?: Record<string, any> }
  ): Promise<T> {
    return this.request<T>('POST', path, {
      ...options,
      body: formData,
      isFormData: true,
    });
  }
}
