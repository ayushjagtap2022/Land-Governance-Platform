/**
 * Analytics and Decision-Support Dashboards Types (Module 6).
 */

export type DashboardCategory =
  | 'research_output'
  | 'policy_performance'
  | 'land_use_trends'
  | 'climate_resilience'
  | 'dispute_statistics'
  | 'project_outcomes'
  | 'geospatial_insights';

export interface StateComparisonRow {
  category: string;
  [stateName: string]: any;
}

export type StateComparisonResponse = StateComparisonRow[] | {
  state_a?: string;
  state_b?: string;
  metrics?: Record<string, {
    label: string;
    state_a_val: number | string;
    state_b_val: number | string;
    unit?: string;
    higher_is_better?: boolean;
    difference_pct?: number;
  }>;
  summary?: string;
  [key: string]: any;
};

export interface ClimateRadarPoint {
  axis?: string;
  subject?: string;
  A?: number;
  B?: number;
  state_a_score?: number;
  state_b_score?: number;
  fullMark?: number;
  full_mark?: number;
  [key: string]: any;
}

export type ClimateRadarResponse = ClimateRadarPoint[] | {
  state_a?: string;
  state_b?: string;
  radar?: ClimateRadarPoint[];
  climate_risk_tier_a?: string;
  climate_risk_tier_b?: string;
  [key: string]: any;
};

export type HistoricalTrendsResponse = Array<Record<string, any>> | {
  state?: string;
  years?: number[];
  series?: Array<{
    name: string;
    data: number[];
    unit?: string;
  }>;
  [key: string]: any;
};

export interface DashboardCategoryData {
  category: DashboardCategory;
  state?: string;
  kpis?: Array<{
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  charts?: any[];
  table_data?: any[];
  [key: string]: any;
}

export interface NlgiStateRanking {
  rank: number;
  state_name: string;
  composite_score: number;
  cadastral_score: number;
  dispute_resolution_score: number;
  tenancy_security_score: number;
  institutional_readiness_score: number;
  tier: 'Front Runner' | 'Performer' | 'Fast Mover' | 'Aspirant' | string;
  [key: string]: any;
}

export interface NlgiLeaderboardResponse {
  leaderboard: NlgiStateRanking[];
  national_average: number;
  top_performer: string;
  year: number;
  [key: string]: any;
}
