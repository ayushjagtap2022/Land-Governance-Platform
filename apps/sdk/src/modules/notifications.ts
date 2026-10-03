/**
 * Notifications Module (Module 11: Real-Time Notifications).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  NotificationFilterParams,
  NotificationRead,
  NotificationSocketMessage,
  NotificationSocketOptions,
} from '../types/notifications';
import { createWebSocketConnection, WebSocketChannel } from '../websocket';

export class NotificationsModule {
  constructor(private http: HttpClient) {}

  /**
   * Fetch past notifications for the authenticated user.
   */
  public async list(
    params?: NotificationFilterParams,
    options?: RequestOptions
  ): Promise<NotificationRead[]> {
    return this.http.get<NotificationRead[]>('/notifications/', params, options);
  }

  /**
   * Mark a notification as read.
   */
  public async markAsRead(
    notificationId: string,
    options?: RequestOptions
  ): Promise<NotificationRead> {
    return this.http.patch<NotificationRead>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      undefined,
      options
    );
  }

  /**
   * Subscribe to real-time push notifications over WebSocket.
   *
   * @example
   * ```ts
   * const sub = client.notifications.subscribe({
   *   onNotification: (notif) => console.log('New alert:', notif.title),
   * });
   * // To disconnect later:
   * sub.close();
   * ```
   */
  public subscribe(
    options: NotificationSocketOptions = {}
  ): WebSocketChannel {
    return createWebSocketConnection<NotificationSocketMessage, any>(
      this.http,
      '/notifications/ws/notifications',
      {
        token: options.token,
        onMessage: options.onNotification,
        onError: options.onError,
        onClose: options.onClose,
        onOpen: options.onOpen,
        autoReconnect: true,
      }
    );
  }
}
