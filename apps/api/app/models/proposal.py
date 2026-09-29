"""
Proposal and ProposalVote models for the Innovation Portal (Module 8).

PDF Requirements (Page 3):
  - "Submission portal for proposals and pilot projects"
  - "Public voting and/or expert panel scoring"
  - "Applicant-facing status tracker (under review → shortlisted → funded)"
  - "Admin-facing grant/funding disbursement tracker"
  - "Leaderboard and public showcase of funded/completed pilots"
"""
import uuid
from enum import Enum
from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column, UniqueConstraint
from sqlalchemy import JSON


class ProposalStatus(str, Enum):
    """
    Full lifecycle of a proposal.
    PDF: "under review → shortlisted → funded"
    """
    SUBMITTED    = "submitted"
    UNDER_REVIEW = "under_review"
    SHORTLISTED  = "shortlisted"
    FUNDED       = "funded"
    COMPLETED    = "completed"   # Pilot project successfully finished
    REJECTED     = "rejected"


class FundingStatus(str, Enum):
    """Tracks grant/funding disbursement for admin dashboard."""
    NOT_APPLICABLE     = "not_applicable"
    PENDING            = "pending"
    PARTIALLY_DISBURSED = "partially_disbursed"
    DISBURSED          = "disbursed"


# ---------------------------------------------------------------------------
# Request / Response Schemas
# ---------------------------------------------------------------------------
class ProposalCreate(SQLModel):
    """Schema for POST /innovation/challenges/{id}/proposals."""
    title: str
    abstract: str
    document_url: Optional[str] = None
    requested_funding: Optional[float] = None
    team_members: Optional[list[dict]] = None  # e.g. [{"name": "...", "email": "..."}]


class ProposalStatusUpdate(SQLModel):
    """Schema for PATCH /innovation/proposals/{id}/status."""
    status: ProposalStatus
    admin_notes: Optional[str] = None
    score: Optional[float] = None


class ProposalFundingUpdate(SQLModel):
    """Schema for PATCH /innovation/proposals/{id}/funding."""
    funding_amount: Optional[float] = None
    funding_status: FundingStatus


class ProposalRead(SQLModel):
    """Schema for returning proposal data in API responses."""
    id: uuid.UUID
    challenge_id: uuid.UUID
    submitted_by: uuid.UUID
    title: str
    abstract: str
    document_url: Optional[str] = None
    team_members: Optional[list[dict]] = None
    status: ProposalStatus
    score: Optional[float] = None
    admin_notes: Optional[str] = None
    funding_amount: Optional[float] = None
    funding_status: FundingStatus
    vote_count: int = 0
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Database Tables
# ---------------------------------------------------------------------------
class Proposal(SQLModel, table=True):
    """
    A proposal/submission made by a user in response to a Challenge.
    Tracks the full lifecycle from submission through review to funding.
    """
    __tablename__ = "proposals"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    challenge_id: uuid.UUID = Field(index=True)   # FK to challenges.id
    submitted_by: uuid.UUID = Field(index=True)    # FK to users.id
    
    # Proposal content
    title: str = Field(index=True)
    abstract: str
    document_url: Optional[str] = None
    team_members: Optional[list[dict]] = Field(default=None, sa_column=Column(JSON))
    
    # Status tracking (PDF: "under review → shortlisted → funded")
    status: ProposalStatus = Field(default=ProposalStatus.SUBMITTED, index=True)
    
    # Expert panel scoring
    score: Optional[float] = Field(default=None)
    admin_notes: Optional[str] = Field(default=None)
    
    # Funding disbursement tracking (PDF: "Admin-facing grant/funding disbursement tracker")
    funding_amount: Optional[float] = Field(default=None)
    funding_status: FundingStatus = Field(default=FundingStatus.NOT_APPLICABLE, index=True)
    
    # Public voting — cached count for leaderboard performance
    vote_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProposalVote(SQLModel, table=True):
    """
    Public voting on proposals.
    PDF: "Public voting and/or expert panel scoring"
    
    Each user can vote only once per proposal (enforced by unique constraint).
    """
    __tablename__ = "proposal_votes"
    __table_args__ = (
        UniqueConstraint("proposal_id", "user_id", name="uq_proposal_user_vote"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    proposal_id: uuid.UUID = Field(index=True)  # FK to proposals.id
    user_id: uuid.UUID = Field(index=True)       # FK to users.id
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
