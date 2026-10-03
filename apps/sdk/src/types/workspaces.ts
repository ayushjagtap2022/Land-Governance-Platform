/**
 * Collaborative Workspaces and Chat Types (Module 4).
 */

export type WorkspaceRole = 'admin' | 'member' | 'viewer';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface WorkspaceCreate {
  name: string;
  description: string;
}

export interface WorkspaceRead {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMemberCreate {
  user_id: string;
  role?: WorkspaceRole;
}

export interface WorkspaceMemberRead {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  assigned_to?: string | null;
  due_date?: string | null;
}

export interface TaskUpdate {
  status?: TaskStatus;
  assigned_to?: string | null;
  due_date?: string | null;
}

export interface TaskRead {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  assigned_to?: string | null;
  status: TaskStatus;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRead {
  id: string;
  workspace_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatSocketMessage {
  type: 'message' | 'error' | string;
  data?: MessageRead;
  error?: string;
}

export interface ChatSocketOptions {
  token?: string;
  onMessage?: (message: ChatSocketMessage) => void;
  onError?: (error: any) => void;
  onClose?: (event: any) => void;
  onOpen?: () => void;
}
