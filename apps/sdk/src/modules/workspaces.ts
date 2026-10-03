/**
 * Workspaces Module (Module 4: Collaborative Workspaces & Chat).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  ChatSocketMessage,
  ChatSocketOptions,
  TaskCreate,
  TaskRead,
  TaskUpdate,
  WorkspaceCreate,
  WorkspaceMemberCreate,
  WorkspaceMemberRead,
  WorkspaceRead,
} from '../types/workspaces';
import { createWebSocketConnection, WebSocketChannel } from '../websocket';

export class WorkspacesModule {
  constructor(private http: HttpClient) {}

  /**
   * Create a new collaborative research workspace.
   */
  public async create(
    payload: WorkspaceCreate,
    options?: RequestOptions
  ): Promise<WorkspaceRead> {
    return this.http.post<WorkspaceRead>('/workspaces/', payload, options);
  }

  /**
   * List all workspaces the authenticated user belongs to.
   */
  public async list(options?: RequestOptions): Promise<WorkspaceRead[]> {
    return this.http.get<WorkspaceRead[]>('/workspaces/', undefined, options);
  }

  /**
   * Add a member to a workspace (Admin role required).
   */
  public async addMember(
    workspaceId: string,
    payload: WorkspaceMemberCreate,
    options?: RequestOptions
  ): Promise<WorkspaceMemberRead> {
    return this.http.post<WorkspaceMemberRead>(
      `/workspaces/${encodeURIComponent(workspaceId)}/members`,
      payload,
      options
    );
  }

  /**
   * Create a task inside a workspace.
   */
  public async createTask(
    workspaceId: string,
    payload: TaskCreate,
    options?: RequestOptions
  ): Promise<TaskRead> {
    return this.http.post<TaskRead>(
      `/workspaces/${encodeURIComponent(workspaceId)}/tasks`,
      payload,
      options
    );
  }

  /**
   * List all tasks in a workspace.
   */
  public async listTasks(
    workspaceId: string,
    options?: RequestOptions
  ): Promise<TaskRead[]> {
    return this.http.get<TaskRead[]>(
      `/workspaces/${encodeURIComponent(workspaceId)}/tasks`,
      undefined,
      options
    );
  }

  /**
   * Update task status, assignee, or deadline.
   */
  public async updateTask(
    taskId: string,
    updates: TaskUpdate,
    options?: RequestOptions
  ): Promise<TaskRead> {
    return this.http.patch<TaskRead>(
      `/workspaces/tasks/${encodeURIComponent(taskId)}`,
      updates,
      options
    );
  }

  /**
   * Connect to a real-time collaborative workspace chat channel via WebSocket.
   * Enables sending and receiving threaded messages live.
   *
   * @example
   * ```ts
   * const chat = client.workspaces.connectChat(workspaceId, {
   *   onMessage: (msg) => console.log('Chat message:', msg),
   *   onOpen: () => chat.send({ content: 'Hello team!' }),
   * });
   * ```
   */
  public connectChat(
    workspaceId: string,
    options: ChatSocketOptions = {}
  ): WebSocketChannel<{ content: string }> {
    return createWebSocketConnection<ChatSocketMessage, { content: string }>(
      this.http,
      `/ws/chat/${encodeURIComponent(workspaceId)}`,
      {
        token: options.token,
        onMessage: options.onMessage,
        onError: options.onError,
        onClose: options.onClose,
        onOpen: options.onOpen,
        autoReconnect: true,
      }
    );
  }
}
