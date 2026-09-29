/**
 * useChat — WebSocket hook for real-time workspace chat.
 *
 * Connects to the FastAPI WebSocket endpoint backed by Upstash Redis Pub/Sub.
 * Includes automatic reconnection with exponential backoff.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

export type ChatMessage = {
  user_id: string;
  user_name: string;
  content: string;
  timestamp: string;
};

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1')
  .replace('http://', 'ws://')
  .replace('https://', 'wss://');

export function useChat(workspaceId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (!workspaceId) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/chat/${workspaceId}?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Exponential backoff reconnect
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
        retriesRef.current += 1;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [workspaceId]);

  useEffect(() => {
    connect();
    return () => {
      retriesRef.current = maxRetries; // Prevent reconnect on unmount
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    }
  }, []);

  return { messages, sendMessage, isConnected };
}
