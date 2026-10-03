/**
 * Repository Module (Module 2: Central Knowledge Repository).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  CommitRecordRequest,
  CommitResponse,
  DocumentFilterParams,
  DocumentIngestPayload,
  DocumentItem,
  IngestResponse,
  ReviewDocumentRequest,
  ReviewResponse,
  UploadResponse,
} from '../types/repository';

export class RepositoryModule {
  constructor(private http: HttpClient) {}

  /**
   * Search and list indexed government acts, circulars, and policies.
   * Supports filtering by keyword, state, theme, publication year bounds, and exact/semantic search.
   */
  public async list(
    params?: DocumentFilterParams,
    options?: RequestOptions
  ): Promise<DocumentItem[]> {
    return this.http.get<DocumentItem[]>('/repository/documents', params, options);
  }

  /**
   * Intuitive search method: accepts either a query string directly or a filter object.
   *
   * @example
   * ```ts
   * // Simple quick search
   * const docs = await client.documents.search('drone survey');
   *
   * // Advanced multi-parameter search
   * const docs = await client.documents.search({
   *   query: 'SVAMITVA',
   *   state: 'Maharashtra',
   *   search_mode: 'semantic'
   * });
   * ```
   */
  public async search(
    queryOrParams: string | DocumentFilterParams = {},
    options?: RequestOptions
  ): Promise<DocumentItem[]> {
    const params: DocumentFilterParams =
      typeof queryOrParams === 'string'
        ? { query: queryOrParams, search_mode: 'semantic' }
        : queryOrParams;
    return this.list(params, options);
  }

  /**
   * Get full metadata and summary for a single document by its UUID or Ref ID.
   */
  public async get(
    docId: string,
    options?: RequestOptions
  ): Promise<DocumentItem> {
    return this.http.get<DocumentItem>(`/repository/documents/${encodeURIComponent(docId)}`, undefined, options);
  }

  /**
   * Memorable alias for get() — retrieve a document by ID.
   */
  public async getById(
    docId: string,
    options?: RequestOptions
  ): Promise<DocumentItem> {
    return this.get(docId, options);
  }

  /**
   * Get documents related by pgvector cosine similarity.
   */
  public async getRelated(
    docId: string,
    limit: number = 3,
    options?: RequestOptions
  ): Promise<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(
      `/repository/documents/${encodeURIComponent(docId)}/related`,
      { limit },
      options
    );
  }

  /**
   * Get personalized document recommendations tailored for a specific user role.
   */
  public async getRecommendations(
    role: string = 'Researcher',
    limit: number = 4,
    options?: RequestOptions
  ): Promise<DocumentItem[]> {
    return this.http.get<DocumentItem[]>('/repository/recommendations', { role, limit }, options);
  }

  /**
   * Upload a raw document file (PDF, etc.) for OCR parsing and temporary storage.
   */
  public async upload(
    file: Blob | File | any,
    filename: string = 'document.pdf',
    options?: RequestOptions
  ): Promise<UploadResponse> {
    const formData = new FormData();
    if (typeof file === 'object' && 'name' in file && file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, filename);
    }
    return this.http.postForm<UploadResponse>('/repository/upload', formData, options);
  }

  /**
   * Permanently commit an uploaded record to the National Land Governance Registry.
   */
  public async commit(
    record: CommitRecordRequest,
    options?: RequestOptions
  ): Promise<CommitResponse> {
    return this.http.post<CommitResponse>('/repository/commit', record, options);
  }

  /**
   * Stage an evidence document with mandatory provenance (source URL & licence) for admin review.
   */
  public async ingest(
    file: Blob | File | any,
    payload: DocumentIngestPayload,
    filename: string = 'document.pdf',
    options?: RequestOptions
  ): Promise<IngestResponse> {
    const formData = new FormData();
    if (typeof file === 'object' && 'name' in file && file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, filename);
    }

    formData.append('title', payload.title);
    formData.append('authority', payload.authority);
    formData.append('source_url', payload.source_url);
    formData.append('source_license', payload.source_license);

    if (payload.category) formData.append('category', payload.category);
    if (payload.theme) formData.append('theme', payload.theme);
    if (payload.state_region) formData.append('state_region', payload.state_region);
    if (payload.administrative_level) formData.append('administrative_level', payload.administrative_level);
    if (payload.publication_year !== undefined) {
      formData.append('publication_year', String(payload.publication_year));
    }

    return this.http.postForm<IngestResponse>('/repository/ingest', formData, options);
  }

  /**
   * Approve or reject a staged document. Only approved documents are indexed for search.
   */
  public async review(
    docId: string,
    payload: ReviewDocumentRequest,
    options?: RequestOptions
  ): Promise<ReviewResponse> {
    return this.http.post<ReviewResponse>(
      `/repository/documents/${encodeURIComponent(docId)}/review`,
      payload,
      options
    );
  }
}
