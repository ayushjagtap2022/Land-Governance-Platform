/**
 * Innovation Module (Module 8: Innovation Portal).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  ChallengeCreate,
  ChallengeFilterParams,
  ChallengeRead,
  ChallengeUpdate,
  InnovationStats,
  ProposalCreate,
  ProposalFundingUpdate,
  ProposalRead,
  ProposalStatusUpdate,
} from '../types/innovation';

export class InnovationModule {
  constructor(private http: HttpClient) {}

  /**
   * Create a new challenge (hackathon, grant, research call).
   * Restricted to Official and Super Admin roles.
   */
  public async createChallenge(
    payload: ChallengeCreate,
    options?: RequestOptions
  ): Promise<ChallengeRead> {
    return this.http.post<ChallengeRead>('/innovation/challenges', payload, options);
  }

  /**
   * List challenges with optional filtering by type and status.
   */
  public async listChallenges(
    params?: ChallengeFilterParams,
    options?: RequestOptions
  ): Promise<ChallengeRead[]> {
    return this.http.get<ChallengeRead[]>('/innovation/challenges', params, options);
  }

  /**
   * Get full details of a specific challenge.
   */
  public async getChallenge(
    challengeId: string,
    options?: RequestOptions
  ): Promise<ChallengeRead> {
    return this.http.get<ChallengeRead>(
      `/innovation/challenges/${encodeURIComponent(challengeId)}`,
      undefined,
      options
    );
  }

  /**
   * Update challenge details, deadlines, or status.
   */
  public async updateChallenge(
    challengeId: string,
    updates: ChallengeUpdate,
    options?: RequestOptions
  ): Promise<ChallengeRead> {
    return this.http.patch<ChallengeRead>(
      `/innovation/challenges/${encodeURIComponent(challengeId)}`,
      updates,
      options
    );
  }

  /**
   * Submit a proposal in response to an open challenge.
   */
  public async submitProposal(
    challengeId: string,
    payload: ProposalCreate,
    options?: RequestOptions
  ): Promise<ProposalRead> {
    return this.http.post<ProposalRead>(
      `/innovation/challenges/${encodeURIComponent(challengeId)}/proposals`,
      payload,
      options
    );
  }

  /**
   * Upload a PDF project proposal document to cloud storage and attach to proposal.
   */
  public async uploadProposalDocument(
    proposalId: string,
    file: Blob | File | any,
    filename: string = 'proposal.pdf',
    options?: RequestOptions
  ): Promise<ProposalRead> {
    const formData = new FormData();
    if (typeof file === 'object' && 'name' in file && file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, filename);
    }

    return this.http.postForm<ProposalRead>(
      `/innovation/proposals/${encodeURIComponent(proposalId)}/upload-document`,
      formData,
      options
    );
  }

  /**
   * List all proposals submitted for a challenge.
   */
  public async listProposals(
    challengeId: string,
    params?: { status?: string; skip?: number; limit?: number },
    options?: RequestOptions
  ): Promise<ProposalRead[]> {
    return this.http.get<ProposalRead[]>(
      `/innovation/challenges/${encodeURIComponent(challengeId)}/proposals`,
      params,
      options
    );
  }

  /**
   * Get full details of a specific proposal.
   */
  public async getProposal(
    proposalId: string,
    options?: RequestOptions
  ): Promise<ProposalRead> {
    return this.http.get<ProposalRead>(
      `/innovation/proposals/${encodeURIComponent(proposalId)}`,
      undefined,
      options
    );
  }

  /**
   * Update a proposal's status in the review pipeline
   * (submitted -> under_review -> shortlisted -> funded -> completed / rejected).
   */
  public async updateProposalStatus(
    proposalId: string,
    update: ProposalStatusUpdate,
    options?: RequestOptions
  ): Promise<ProposalRead> {
    return this.http.patch<ProposalRead>(
      `/innovation/proposals/${encodeURIComponent(proposalId)}/status`,
      update,
      options
    );
  }

  /**
   * Update grant/funding disbursement status (Admin action).
   */
  public async updateProposalFunding(
    proposalId: string,
    update: ProposalFundingUpdate,
    options?: RequestOptions
  ): Promise<ProposalRead> {
    return this.http.patch<ProposalRead>(
      `/innovation/proposals/${encodeURIComponent(proposalId)}/funding`,
      update,
      options
    );
  }

  /**
   * Cast a public vote for a proposal.
   */
  public async voteForProposal(
    proposalId: string,
    options?: RequestOptions
  ): Promise<{ message: string }> {
    return this.http.post<{ message: string }>(
      `/innovation/proposals/${encodeURIComponent(proposalId)}/vote`,
      undefined,
      options
    );
  }

  /**
   * Retract a previously cast vote.
   */
  public async removeVote(
    proposalId: string,
    options?: RequestOptions
  ): Promise<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `/innovation/proposals/${encodeURIComponent(proposalId)}/vote`,
      undefined,
      options
    );
  }

  /**
   * Get ranked leaderboard of proposals for a challenge.
   */
  public async getLeaderboard(
    challengeId: string,
    limit: number = 20,
    options?: RequestOptions
  ): Promise<ProposalRead[]> {
    return this.http.get<ProposalRead[]>(
      `/innovation/challenges/${encodeURIComponent(challengeId)}/leaderboard`,
      { limit },
      options
    );
  }

  /**
   * Get showcase of successfully funded and completed pilot projects.
   */
  public async getShowcase(
    params?: { skip?: number; limit?: number },
    options?: RequestOptions
  ): Promise<ProposalRead[]> {
    return this.http.get<ProposalRead[]>('/innovation/showcase', params, options);
  }

  /**
   * Get platform-wide innovation metrics.
   */
  public async getStats(options?: RequestOptions): Promise<InnovationStats> {
    return this.http.get<InnovationStats>('/innovation/stats', undefined, options);
  }
}
