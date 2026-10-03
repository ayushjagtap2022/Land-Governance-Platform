/**
 * Central Knowledge Repository Types (Module 2).
 */

export interface DocumentItem {
  id: string;
  ref_id: string;
  title: string;
  department: string;
  category: string;
  theme: string;
  state_region: string;
  administrative_level: string;
  document_type: string;
  record_type: string;
  year: number;
  published: string;
  updated: string;
  status: string;
  format: string;
  pages: number;
  version: string;
  visibility: string;
  summary: string;
  file_url?: string | null;
  similarity_score?: number;
}

export interface DocumentFilterParams {
  query?: string;
  state?: string;
  theme?: string;
  year_from?: number;
  year_to?: number;
  search_mode?: 'exact' | 'semantic';
}

export interface UploadResponse {
  success: boolean;
  filename: string;
  file_url: string;
  storage_type: string;
  metadata: Record<string, any>;
}

export interface CommitRecordRequest {
  title: string;
  authority: string;
  year: string;
  theme: string;
  administrative_level: string;
  file_name: string;
  file_url: string;
}

export interface CommitResponse {
  success: boolean;
  duplicate?: boolean;
  message: string;
  document: DocumentItem;
}

export interface DocumentIngestPayload {
  title: string;
  authority: string;
  source_url: string;
  source_license: string;
  category?: string;
  theme?: string;
  state_region?: string;
  administrative_level?: string;
  publication_year?: number;
}

export interface IngestResponse {
  success: boolean;
  document: DocumentItem;
  review_status: string;
  page_count: number;
  chunk_count: number;
  message: string;
}

export interface ReviewDocumentRequest {
  decision: 'approved' | 'rejected';
  review_note?: string;
}

export interface ReviewResponse {
  success: boolean;
  document: DocumentItem;
  review_status: string;
}
