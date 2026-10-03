/**
 * Admin Portal and Platform Telemetry Types (Module 10).
 */

export interface AdminStatsResponse {
  total_users: number;
  total_documents: number;
  total_workspaces: number;
  total_proposals: number;
  total_audit_logs: number;
  active_districts_monitored: number;
  active_ml_models: number;
}

export interface InfrastructureHealthMetrics {
  status: 'healthy' | 'degraded' | 'error' | string;
  database: {
    engine: string;
    extensions: string[];
    status: string;
    latency_ms: number;
    conn_pool: string;
    [key: string]: any;
  };
  vector_search: {
    engine: string;
    status: string;
    latency_p95_ms: string;
    index_state: string;
    [key: string]: any;
  };
  ml_inference_engine: {
    framework: string;
    status: string;
    active_models: number;
    latency_p95_ms: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AuditLogRead {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  detail?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}
