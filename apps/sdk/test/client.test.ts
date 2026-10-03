import { describe, it, expect, vi } from 'vitest';
import { LandGovernanceClient, createClient } from '../src/client';
import { LandGovernanceApiError } from '../src/errors';

describe('LandGovernanceClient', () => {
  it('initializes with default options and all modules', () => {
    const client = new LandGovernanceClient();
    expect(client.getBaseUrl()).toBe('http://127.0.0.1:8000/api/v1');
    expect(client.auth).toBeDefined();
    expect(client.repository).toBeDefined();
    expect(client.assistant).toBeDefined();
    expect(client.workspaces).toBeDefined();
    expect(client.geodata).toBeDefined();
    expect(client.analytics).toBeDefined();
    expect(client.simulate).toBeDefined();
    expect(client.ml).toBeDefined();
    expect(client.innovation).toBeDefined();
    expect(client.admin).toBeDefined();
    expect(client.notifications).toBeDefined();
    expect(client.health).toBeDefined();
  });

  it('initializes via factory function createClient', () => {
    const client = createClient({
      baseUrl: 'https://api.landgov.gov.in/api/v1',
      token: 'test-jwt-token',
    });
    expect(client.getBaseUrl()).toBe('https://api.landgov.gov.in/api/v1');
    expect(client.getToken()).toBe('test-jwt-token');
  });

  it('manages authentication tokens', () => {
    const client = new LandGovernanceClient();
    expect(client.getToken()).toBeUndefined();

    client.setToken('jwt-sample-token-123');
    expect(client.getToken()).toBe('jwt-sample-token-123');

    client.clearToken();
    expect(client.getToken()).toBeUndefined();
  });

  it('attaches authorization header to requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'ok', database: 'connected' }),
    });

    const client = new LandGovernanceClient({
      fetch: mockFetch as any,
      token: 'auth-bearer-token',
    });

    const res = await client.health.check();
    expect(res.status).toBe('ok');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe('http://127.0.0.1:8000/api/v1/healthz');
    expect(callArgs[1].headers['Authorization']).toBe('Bearer auth-bearer-token');
  });

  it('throws typed LandGovernanceApiError with helper flags on HTTP error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Invalid credentials or expired token.' }),
    });

    const client = new LandGovernanceClient({
      fetch: mockFetch as any,
    });

    try {
      await client.auth.getMe();
      expect.fail('Should have thrown an error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(LandGovernanceApiError);
      expect(err.status).toBe(401);
      expect(err.isUnauthorized).toBe(true);
      expect(err.isNotFound).toBe(false);
      expect(err.message).toBe('Invalid credentials or expired token.');
    }
  });

  it('correctly formats and passes query parameters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [],
    });

    const client = new LandGovernanceClient({
      fetch: mockFetch as any,
    });

    await client.repository.list({
      query: 'cadastral',
      state: 'Maharashtra',
      year_from: 2020,
      year_to: 2024,
      search_mode: 'semantic',
    });

    const callUrl = mockFetch.mock.calls[0][0];
    const url = new URL(callUrl);
    expect(url.searchParams.get('query')).toBe('cadastral');
    expect(url.searchParams.get('state')).toBe('Maharashtra');
    expect(url.searchParams.get('year_from')).toBe('2020');
    expect(url.searchParams.get('year_to')).toBe('2024');
    expect(url.searchParams.get('search_mode')).toBe('semantic');
  });

  it('provides intuitive memorable aliases for modules and methods', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'ok' }),
    });

    const client = new LandGovernanceClient({ fetch: mockFetch as any });

    // Verify module aliases
    expect(client.documents).toBe(client.repository);
    expect(client.ai).toBe(client.assistant);
    expect(client.simulation).toBe(client.simulate);
    expect(client.gis).toBe(client.geodata);

    // Verify quick search string query formatting
    await client.documents.search('drone survey');
    const searchCall = mockFetch.mock.calls[0][0];
    expect(searchCall).toContain('query=drone+survey');
    expect(searchCall).toContain('search_mode=semantic');
  });

  it('manages token-based authentication state and auto-attaches tokens after login', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        access_token: 'new-jwt-from-login',
        token_type: 'bearer',
        user: { id: 'u1', email: 'test@example.com', full_name: 'Test User', role: 'public', is_active: true, is_verified: true, created_at: '' },
      }),
    });

    const client = new LandGovernanceClient({ fetch: mockFetch as any });
    expect(client.isAuthenticated()).toBe(false);
    expect(client.auth.isAuthenticated()).toBe(false);

    // Perform login
    const res = await client.login({ email: 'test@example.com', password: 'secretpassword' });
    expect(res.access_token).toBe('new-jwt-from-login');

    // Token must be automatically configured on the client
    expect(client.isAuthenticated()).toBe(true);
    expect(client.getToken()).toBe('new-jwt-from-login');
    expect(client.auth.getToken()).toBe('new-jwt-from-login');

    // Logging out
    client.logout();
    expect(client.isAuthenticated()).toBe(false);
    expect(client.getToken()).toBeUndefined();
  });
});
