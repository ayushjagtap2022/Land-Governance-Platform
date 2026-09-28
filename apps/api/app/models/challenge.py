"""
Challenge model for the Innovation Portal (Module 8).

PDF Requirement (Page 3):
  "Post open challenges, hackathons, and research grant calls"

A Challenge represents an open call posted by a Government Official
or Admin for researchers and the public to respond to.
"""
import uuid
from enum import Enum
from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class ChallengeType(str, Enum):
    """Types of challenges that can be posted on the Innovation Portal."""
    HACKATHON      = "hackathon"
    GRANT          = "grant"
    RESEARCH_CALL  = "research_call"
    PILOT_PROJECT  = "pilot_project"


class ChallengeStatus(str, Enum):
    """Lifecycle status of a challenge."""
    DRAFT     = "draft"       # Not yet published
    OPEN      = "open"        # Accepting proposals
    CLOSED    = "closed"      # Deadline passed, reviewing proposals
    COMPLETED = "completed"   # Winners announced / funded


# ---------------------------------------------------------------------------
# Request / Response Schemas
# ---------------------------------------------------------------------------
class ChallengeCreate(SQLModel):
    """Schema for POST /innovation/challenges."""
    title: str
    description: str
    challenge_type: ChallengeType
    organization: str
    eligibility: Optional[str] = None
    prize_info: Optional[str] = None
    start_date: datetime
    deadline: datetime
    tags: Optional[list[str]] = None


class ChallengeUpdate(SQLModel):
    """Schema for PATCH /innovation/challenges/{id}."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ChallengeStatus] = None
    eligibility: Optional[str] = None
    prize_info: Optional[str] = None
    deadline: Optional[datetime] = None
    tags: Optional[list[str]] = None


class ChallengeRead(SQLModel):
    """Schema for returning challenge data in API responses."""
    id: uuid.UUID
    title: str
    description: str
    challenge_type: ChallengeType
    status: ChallengeStatus
    created_by: uuid.UUID
    organization: str
    eligibility: Optional[str] = None
    prize_info: Optional[str] = None
    start_date: datetime
    deadline: datetime
    tags: Optional[list[str]] = None
    proposal_count: int = 0
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Database Table
# ---------------------------------------------------------------------------
class Challenge(SQLModel, table=True):
    """
    The Challenge table — represents a hackathon, grant call,
    research call, or pilot project posted on the Innovation Portal.
    """
    __tablename__ = "challenges"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    description: str
    challenge_type: ChallengeType = Field(index=True)
    status: ChallengeStatus = Field(default=ChallengeStatus.DRAFT, index=True)
    
    # Who posted it
    created_by: uuid.UUID = Field(index=True)  # FK to users.id
    organization: str = Field(index=True)      # e.g. "DoLR", "NITI Aayog"
    
    # Details
    eligibility: Optional[str] = None
    prize_info: Optional[str] = None           # e.g. "₹5,00,000 seed funding"
    start_date: datetime
    deadline: datetime
    tags: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Cached count for performance
    proposal_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
