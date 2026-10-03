/**
 * Notifications and Alerting Types (Module 11).
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationRead {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationFilterParams {
  unread_only?: boolean;
  limit?: number;
}

export interface NotificationSocketMessage {
  id?: string;
  title?: string;
  content?: string;
  type?: NotificationType;
  created_at?: string;
  [key: string]: any;
}

export interface NotificationSocketOptions {
  token?: string;
  onNotification?: (notification: NotificationSocketMessage) => void;
  onError?: (error: any) => void;
  onClose?: (event: any) => void;
  onOpen?: () => void;
}
