/**
 * Analytics Module (Module 6: Analytics & Decision-Support Dashboards).
 */

import { HttpClient } from '../http';
import {
  ClimateRadarResponse,
  DashboardCategory,
  DashboardCategoryData,
  HistoricalTrendsResponse,
  NlgiLeaderboardResponse,
  StateComparisonResponse,
} from '../types/analytics';
import { RequestOptions } from '../types/common';

export class AnalyticsModule {
  constructor(private http: HttpClient) {}

  /**
   * Compare two Indian states on real empirical indicators (Census, Nightlights, Rainfall).
   */
  public async compareStates(
    stateA: string = 'Maharashtra',
    stateB: string = 'Madhya Pradesh',
    options?: RequestOptions
  ): Promise<StateComparisonResponse> {
    return this.http.get<StateComparisonResponse>(
      '/analytics/compare',
      { state_a: stateA, state_b: stateB },
      options
    );
  }

  /**
   * Fetch 5-axis climate resilience and agrarian distress radar comparison.
   */
  public async getClimateRadar(
    stateA: string = 'Maharashtra',
    stateB: string = 'Madhya Pradesh',
    options?: RequestOptions
  ): Promise<ClimateRadarResponse> {
    return this.http.get<ClimateRadarResponse>(
      '/analytics/radar',
      { state_a: stateA, state_b: stateB },
      options
    );
  }

  /**
   * Multi-year historical land governance trends (2000-2024 grounded in MoAFW records).
   */
  public async getTrends(
    state?: string,
    options?: RequestOptions
  ): Promise<HistoricalTrendsResponse> {
    return this.http.get<HistoricalTrendsResponse>(
      '/analytics/trends',
      state ? { state } : undefined,
      options
    );
  }

  /**
   * Fetch empirical data for any of the 7 specific SIH PS 26019 dashboards:
   * - research_output
   * - policy_performance
   * - land_use_trends
   * - climate_resilience
   * - dispute_statistics
   * - project_outcomes
   * - geospatial_insights
   */
  /**
   * Fetch empirical data for any of the 7 specific SIH PS 26019 dashboards:
   * - research_output
   * - policy_performance
   * - land_use_trends
   * - climate_resilience
   * - dispute_statistics
   * - project_outcomes
   * - geospatial_insights
   */
  public async getDashboardCategory(
    category: DashboardCategory,
    state: string = 'Maharashtra',
    options?: RequestOptions
  ): Promise<DashboardCategoryData> {
    return this.http.get<DashboardCategoryData>(
      `/analytics/dashboards/${encodeURIComponent(category)}`,
      { state },
      options
    );
  }

  /**
   * Memorable alias for getDashboardCategory().
   */
  public async getDashboard(
    category: DashboardCategory,
    state: string = 'Maharashtra',
    options?: RequestOptions
  ): Promise<DashboardCategoryData> {
    return this.getDashboardCategory(category, state, options);
  }

  /**
   * Get sorted list of all 35 Indian States and Union Territories with empirical data.
   */
  public async getAvailableStates(options?: RequestOptions): Promise<string[]> {
    return this.http.get<string[]>('/analytics/states', undefined, options);
  }

  /**
   * Memorable alias for getAvailableStates() — list all supported states.
   */
  public async getStates(options?: RequestOptions): Promise<string[]> {
    return this.getAvailableStates(options);
  }

  /**
   * Get composite National Land Governance Index (NLGI) scores and rankings for all states.
   */
  public async getNlgiLeaderboard(options?: RequestOptions): Promise<NlgiLeaderboardResponse> {
    return this.http.get<NlgiLeaderboardResponse>('/analytics/nlgi', undefined, options);
  }

  /**
   * Memorable alias for getNlgiLeaderboard() — returns national rankings.
   */
  public async getLeaderboard(options?: RequestOptions): Promise<NlgiLeaderboardResponse> {
    return this.getNlgiLeaderboard(options);
  }
}
