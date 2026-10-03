/**
 * WebSocket helper for real-time channels (Chat and Notifications).
 */

import { HttpClient } from './http';

export interface WebSocketSubscriptionOptions<T = any> {
  token?: string;
  onMessage?: (data: T) => void;
  onError?: (error: any) => void;
  onClose?: (event: any) => void;
  onOpen?: () => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export interface WebSocketChannel<TSend = any> {
  send: (data: TSend) => void;
  close: () => void;
  isOpen: () => boolean;
  getRawSocket: () => any;
}

export function createWebSocketConnection<TReceive = any, TSend = any>(
  http: HttpClient,
  endpointPath: string,
  options: WebSocketSubscriptionOptions<TReceive> = {}
): WebSocketChannel<TSend> {
  const wsBase = http.getWsUrl().replace(/\/+$/, '');
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const token = options.token || http.getToken();

  let socketUrl = `${wsBase}${cleanPath}`;
  if (token) {
    const separator = socketUrl.includes('?') ? '&' : '?';
    socketUrl = `${socketUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  const WS = http.getWebSocketClass();
  let ws: any = null;
  let isClosedManually = false;
  let reconnectAttempts = 0;
  const maxAttempts = options.maxReconnectAttempts ?? 5;

  function connect() {
    try {
      ws = new WS(socketUrl);

      ws.onopen = () => {
        reconnectAttempts = 0;
        options.onOpen?.();
      };

      ws.onmessage = (event: any) => {
        try {
          const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          options.onMessage?.(parsed);
        } catch {
          options.onMessage?.(event.data);
        }
      };

      ws.onerror = (err: any) => {
        options.onError?.(err);
      };

      ws.onclose = (ev: any) => {
        options.onClose?.(ev);
        if (!isClosedManually && options.autoReconnect && reconnectAttempts < maxAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          setTimeout(connect, delay);
        }
      };
    } catch (err) {
      options.onError?.(err);
    }
  }

  connect();

  return {
    send: (data: TSend) => {
      if (ws && ws.readyState === 1) { // 1 = OPEN
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        ws.send(payload);
      } else {
        throw new Error('WebSocket is not currently in OPEN state.');
      }
    },
    close: () => {
      isClosedManually = true;
      if (ws) {
        ws.close();
      }
    },
    isOpen: () => ws?.readyState === 1,
    getRawSocket: () => ws,
  };
}
