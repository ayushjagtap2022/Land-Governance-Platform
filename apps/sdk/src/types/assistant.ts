/**
 * AI Assistant & Policy Synthesis Types (Module 3).
 */

export interface Citation {
  doc_id: string;
  title: string;
  department: string;
  page: number;
  excerpt: string;
}

export interface AssistantResponse {
  query: string;
  bullets: string[];
  source_ids: string[];
  citations: Citation[];
  grounded: boolean;
}

export interface SynthesisRequest {
  document_ids: string[];
}

export interface SynthesisResponse {
  document_ids: string[];
  document_titles: string[];
  core_objective: string;
  consensus_points: string[];
  conflicting_guidelines: string;
  recommendations_for_dolr: string[];
}

export interface TrendItem {
  keyword: string;
  change: string;
  direction: 'up' | 'down';
  search: string;
}

export interface SummarizeRequest {
  title: string;
  content?: string;
  department?: string;
}

export interface SummarizeResponse {
  title: string;
  executive_summary: string;
  key_takeaways: string[];
  statutory_implications: string;
}
