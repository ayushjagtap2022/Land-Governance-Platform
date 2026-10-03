/**
 * Admin Module (Module 10: Admin Portal & System Telemetry).
 */

import { HttpClient } from '../http';
import {
  AdminStatsResponse,
  AuditLogRead,
  InfrastructureHealthMetrics,
} from '../types/admin';
import { UserRead, UserRole } from '../types/auth';
import { RequestOptions } from '../types/common';

export class AdminModule {
  constructor(private http: HttpClient) {}

  /**
   * Get real-time database counts for platform telemetry.
   */
  public async getStats(options?: RequestOptions): Promise<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>('/admin/stats', undefined, options);
  }

  /**
   * Measure live database latency, pgvector connectivity, and ML model runtime status.
   */
  public async getHealthMetrics(options?: RequestOptions): Promise<InfrastructureHealthMetrics> {
    return this.http.get<InfrastructureHealthMetrics>('/admin/health-metrics', undefined, options);
  }

  /**
   * List all registered users (Super Admin only).
   */
  public async listUsers(
    params?: {
      role?: UserRole;
      is_active?: boolean;
      skip?: number;
      limit?: number;
    },
    options?: RequestOptions
  ): Promise<UserRead[]> {
    return this.http.get<UserRead[]>('/admin/users', params, options);
  }

  /**
   * Suspend a user (is_active=false) or reactivate them (is_active=true).
   */
  public async updateUserStatus(
    userId: string,
    isActive: boolean,
    options?: RequestOptions
  ): Promise<UserRead> {
    return this.http.patch<UserRead>(
      `/admin/users/${encodeURIComponent(userId)}/status`,
      { is_active: isActive },
      options
    );
  }

  /**
   * Promote or demote a user's role (Super Admin only).
   */
  public async updateUserRole(
    userId: string,
    role: UserRole,
    options?: RequestOptions
  ): Promise<UserRead> {
    return this.http.patch<UserRead>(
      `/admin/users/${encodeURIComponent(userId)}/role`,
      { role },
      options
    );
  }

  /**
   * View chronological log of sensitive actions taken on the platform.
   */
  public async getAuditLogs(
    params?: { skip?: number; limit?: number },
    options?: RequestOptions
  ): Promise<AuditLogRead[]> {
    return this.http.get<AuditLogRead[]>('/admin/audit-logs', params, options);
  }
}
