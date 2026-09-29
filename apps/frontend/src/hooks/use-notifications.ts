/**
 * useNotifications — Global WebSocket hook for real-time push notifications.
 *
 * Connects to the FastAPI notification WebSocket endpoint.
 * Triggers sonner toasts whenever a notification arrives.
 * Call this once in the Shell component so it runs globally.
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1')
  .replace('http://', 'ws://')
  .replace('https://', 'wss://');

export function useNotifications() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/notifications/ws/notifications?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        toast(notification.title || 'New Notification', {
          description: notification.content || notification.message,
        });
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => ws.close();

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);
}
