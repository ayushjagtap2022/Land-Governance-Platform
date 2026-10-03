/**
 * Client Configuration for Land Governance Platform SDK.
 */

export interface ClientConfig {
  /**
   * The base URL of the Land Governance API server.
   * Defaults to 'http://127.0.0.1:8000/api/v1'.
   */
  baseUrl?: string;

  /**
   * Base URL for WebSocket connections.
   * If omitted, it is automatically derived from `baseUrl` (http -> ws, https -> wss).
   */
  wsUrl?: string;

  /**
   * JWT Access token used for authenticated requests.
   */
  token?: string;

  /**
   * Optional API Key for server-to-server or high-privilege access.
   */
  apiKey?: string;

  /**
   * Default timeout in milliseconds for all HTTP requests.
   * Default: 30000 (30 seconds).
   */
  timeoutMs?: number;

  /**
   * Number of automatic retries on network failures or 5xx server errors.
   * Default: 1.
   */
  retries?: number;

  /**
   * Custom fetch function override (e.g., node-fetch, undici, or mocking in tests).
   */
  fetch?: typeof fetch;

  /**
   * Custom WebSocket implementation (required in Node.js versions lacking global WebSocket).
   */
  WebSocket?: any;

  /**
   * Additional custom headers sent with every request.
   */
  headers?: Record<string, string>;

  /**
   * Callback invoked when a 401 Unauthorized status is returned.
   */
  onTokenExpired?: () => void | Promise<void>;
}

export const DEFAULT_CONFIG: Required<Omit<ClientConfig, 'token' | 'apiKey' | 'wsUrl' | 'fetch' | 'WebSocket' | 'onTokenExpired'>> = {
  baseUrl: 'http://127.0.0.1:8000/api/v1',
  timeoutMs: 30000,
  retries: 1,
  headers: {},
};
