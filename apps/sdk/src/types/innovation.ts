/**
 * Innovation Portal Types (Module 8).
 */

export type ChallengeType =
  | 'hackathon'
  | 'grant'
  | 'research_call'
  | 'pilot_project';

export type ChallengeStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'completed';

export type ProposalStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'funded'
  | 'completed'
  | 'rejected';

export type FundingStatus =
  | 'not_applicable'
  | 'pending'
  | 'partially_disbursed'
  | 'disbursed';

export interface ChallengeCreate {
  title: string;
  description: string;
  challenge_type: ChallengeType;
  organization: string;
  eligibility?: string | null;
  prize_info?: string | null;
  start_date: string;
  deadline: string;
  tags?: string[] | null;
}

export interface ChallengeUpdate {
  title?: string;
  description?: string;
  status?: ChallengeStatus;
  eligibility?: string | null;
  prize_info?: string | null;
  deadline?: string;
  tags?: string[] | null;
}

export interface ChallengeRead {
  id: string;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  status: ChallengeStatus;
  created_by: string;
  organization: string;
  eligibility?: string | null;
  prize_info?: string | null;
  start_date: string;
  deadline: string;
  tags?: string[] | null;
  proposal_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeFilterParams {
  challenge_type?: ChallengeType | string;
  status?: ChallengeStatus | string;
  skip?: number;
  limit?: number;
}

export interface TeamMember {
  name: string;
  email?: string;
  role?: string;
  affiliation?: string;
  [key: string]: any;
}

export interface ProposalCreate {
  title: string;
  abstract: string;
  document_url?: string | null;
  requested_funding?: number | null;
  team_members?: TeamMember[] | null;
}

export interface ProposalStatusUpdate {
  status: ProposalStatus;
  admin_notes?: string | null;
  score?: number | null;
}

export interface ProposalFundingUpdate {
  funding_amount?: number | null;
  funding_status: FundingStatus;
}

export interface ProposalRead {
  id: string;
  challenge_id: string;
  submitted_by: string;
  title: string;
  abstract: string;
  document_url?: string | null;
  team_members?: TeamMember[] | null;
  status: ProposalStatus;
  score?: number | null;
  admin_notes?: string | null;
  funding_amount?: number | null;
  funding_status: FundingStatus;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface InnovationStats {
  total_challenges: number;
  open_challenges: number;
  total_proposals: number;
  funded_projects: number;
  total_votes: number;
  [key: string]: any;
}
