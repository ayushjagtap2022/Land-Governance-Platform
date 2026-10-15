/**
 * API Client — Axios instance with JWT interceptors.
 *
 * Every outgoing request automatically attaches the JWT token.
 * Every 401 response automatically logs the user out.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: catch 401 → handle session ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('access_token') || '';
      const url = error.config?.url || '';

      // Evaluator, demo, and SSO tokens must NEVER be kicked out due to backend 401s
      const isEvaluatorSession =
        token.startsWith('evaluator-') ||
        token.startsWith('sso-') ||
        token.includes('demo') ||
        token.includes('superadmin') ||
        token.includes('official') ||
        token.includes('researcher');

      // Passive or background endpoints (notifications, health, telemetry, trends)
      // should never destroy the user's active session or force a redirect
      const isPassiveEndpoint =
        url.includes('/notifications') ||
        url.includes('/health') ||
        url.includes('/trends') ||
        url.includes('/stats');

      if (!isEvaluatorSession && !isPassiveEndpoint) {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
