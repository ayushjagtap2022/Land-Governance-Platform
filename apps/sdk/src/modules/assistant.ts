/**
 * Assistant Module (Module 3: Conversational RAG & Policy Synthesis).
 */

import { HttpClient } from '../http';
import {
  AssistantResponse,
  SummarizeRequest,
  SummarizeResponse,
  SynthesisResponse,
  TrendItem,
} from '../types/assistant';
import { RequestOptions } from '../types/common';

export class AssistantModule {
  constructor(private http: HttpClient) {}

  /**
   * RAG Assistant: Answers natural language policy research questions grounded
   * strictly in indexed government circulars and acts, citing exact source IDs and pages.
   */
  public async chat(
    query: string,
    options?: RequestOptions
  ): Promise<AssistantResponse> {
    return this.http.post<AssistantResponse>('/ai/assistant/chat', { query }, options);
  }

  /**
   * Memorable alias for chat() — ask the AI policy assistant a natural language question.
   *
   * @example
   * ```ts
   * const answer = await client.ai.ask('What is the mandatory accuracy for SVAMITVA surveys?');
   * ```
   */
  public async ask(
    query: string,
    options?: RequestOptions
  ): Promise<AssistantResponse> {
    return this.chat(query, options);
  }

  /**
   * Comparative Policy Synthesis Engine: Compares 2-3 selected documents and returns
   * core objective, consensus points, statutory conflicts, and DoLR recommendations.
   */
  public async synthesize(
    documentIds: string[],
    options?: RequestOptions
  ): Promise<SynthesisResponse> {
    return this.http.post<SynthesisResponse>(
      '/ai/synthesis/compare',
      { document_ids: documentIds },
      options
    );
  }

  /**
   * Memorable alias for synthesize() — compares selected policy documents.
   */
  public async compare(
    documentIds: string[],
    options?: RequestOptions
  ): Promise<SynthesisResponse> {
    return this.synthesize(documentIds, options);
  }

  /**
   * Emerging Topic Trend Detection: Returns surging research keywords and frequency shifts.
   */
  public async getTrends(options?: RequestOptions): Promise<TrendItem[]> {
    return this.http.get<TrendItem[]>('/ai/trends', undefined, options);
  }

  /**
   * Auto-Summarization: Generates a 1-click executive summary and key takeaways for a document.
   */
  public async summarize(
    payload: SummarizeRequest,
    options?: RequestOptions
  ): Promise<SummarizeResponse> {
    return this.http.post<SummarizeResponse>('/ai/summarize', payload, options);
  }
}
