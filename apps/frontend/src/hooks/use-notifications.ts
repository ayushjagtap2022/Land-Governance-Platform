/**
 * useNotifications — Global WebSocket hook for real-time push notifications.
 *
 * Connects to the FastAPI notification WebSocket endpoint.
 * Triggers sonner toasts whenever a notification arrives and invalidates React Query cache.
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

function getWebSocketUrl(token: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    const url = new URL(apiUrl);
    const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProto}//${url.host}${url.pathname.replace(/\/$/, '')}/notifications/ws/notifications?token=${encodeURIComponent(token)}`;
  }

  // Relative path (like /api/v1) -> connect through Vite proxy or current host
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const cleanPath = apiUrl.startsWith('/') ? apiUrl : `/${apiUrl}`;
  return `${proto}//${window.location.host}${cleanPath.replace(/\/$/, '')}/notifications/ws/notifications?token=${encodeURIComponent(token)}`;
}

export function useNotifications() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    let isMounted = true;

    function connect() {
      if (!isMounted || !token) return;

      try {
        const wsUrl = getWebSocketUrl(token);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          // Connection established
        };

        ws.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);

            // Ignore control frames, errors, or empty messages
            if (raw.error || raw.status === 'error' || raw.type === 'ping' || raw.type === 'pong' || raw.type === 'handshake') {
              return;
            }

            const notif = raw.data || raw;
            const title = notif.title || raw.title;
            const description = notif.content || notif.message || raw.content;

            // Only trigger a toast if this is an actual notification with title or description
            if (!title && !description) {
              return;
            }

            const type = (notif.type || 'info').toLowerCase();

            if (type === 'success') {
              toast.success(title || 'Notification', { description });
            } else if (type === 'warning') {
              toast.warning(title || 'Notification', { description });
            } else if (type === 'error') {
              toast.error(title || 'Notification', { description });
            } else {
              toast.info(title || 'Notification', { description });
            }

            // Immediately refresh notification count and list in Header
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          } catch {
            // Ignore malformed payloads
          }
        };

        ws.onclose = (event) => {
          // Normal closures, unmounts, or unauthorized closes shouldn't trigger auto-reconnect
          if (event.code === 1000 || event.code === 4001 || event.code === 4003) {
            return;
          }
          if (isMounted && isAuthenticated) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, 6000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        wsRef.current = ws;
      } catch {
        // Suppress websocket initialization errors in environments without active backend
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [token, isAuthenticated, queryClient]);
}

