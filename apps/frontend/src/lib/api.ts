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

// ── Response interceptor: catch 401 → force logout ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't force-logout for endpoints that may 401 due to a
      // trailing-slash redirect stripping the Authorization header.
      const url = error.config?.url || '';
      const isNotificationEndpoint = url.includes('/notifications');
      if (!isNotificationEndpoint) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
