"""
Innovation Portal Service — Business Logic Layer (Module 8).

Handles:
  - Challenge CRUD (create, list, get, update)
  - Proposal submission, listing, status updates
  - Public voting with one-vote-per-user enforcement
  - Leaderboard ranking by score + votes
  - Showcase of funded/completed success stories
  - Platform-wide innovation stats
  - Funding disbursement tracking
"""
import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import select, func, col
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import and_

from app.models.challenge import Challenge, ChallengeStatus, ChallengeCreate, ChallengeUpdate
from app.models.proposal import (
    Proposal, ProposalCreate, ProposalStatus, ProposalStatusUpdate,
    ProposalFundingUpdate, ProposalVote, FundingStatus,
)


# ===========================================================================
# CHALLENGE OPERATIONS
# ===========================================================================

async def create_challenge(
    db: AsyncSession,
    challenge_in: ChallengeCreate,
    created_by: uuid.UUID,
) -> Challenge:
    """
    Create a new challenge (hackathon, grant, research call, or pilot project).
    Only Officials and Super Admins should call this (enforced at the route level).
    """
    challenge = Challenge(
        title=challenge_in.title.strip(),
        description=challenge_in.description.strip(),
        challenge_type=challenge_in.challenge_type,
        organization=challenge_in.organization.strip(),
        eligibility=challenge_in.eligibility,
        prize_info=challenge_in.prize_info,
        start_date=challenge_in.start_date,
        deadline=challenge_in.deadline,
        tags=challenge_in.tags,
        created_by=created_by,
        status=ChallengeStatus.OPEN,
    )
    
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)
    return challenge


async def list_challenges(
    db: AsyncSession,
    challenge_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Challenge]:
    """
    List challenges with optional filters for type and status.
    Supports pagination via skip/limit.
    """
    statement = select(Challenge)
    
    if challenge_type:
        statement = statement.where(Challenge.challenge_type == challenge_type)
    if status:
        statement = statement.where(Challenge.status == status)
    
    statement = statement.order_by(col(Challenge.created_at).desc())
    statement = statement.offset(skip).limit(limit)
    
    result = await db.execute(statement)
    return list(result.scalars().all())


async def get_challenge_by_id(
    db: AsyncSession,
    challenge_id: uuid.UUID,
) -> Optional[Challenge]:
    """Fetch a single challenge by its UUID."""
    statement = select(Challenge).where(Challenge.id == challenge_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def update_challenge(
    db: AsyncSession,
    challenge: Challenge,
    updates: ChallengeUpdate,
) -> Challenge:
    """Update a challenge's fields. Only non-None fields are applied."""
    if updates.title is not None:
        challenge.title = updates.title.strip()
    if updates.description is not None:
        challenge.description = updates.description.strip()
    if updates.status is not None:
        challenge.status = updates.status
    if updates.eligibility is not None:
        challenge.eligibility = updates.eligibility
    if updates.prize_info is not None:
        challenge.prize_info = updates.prize_info
    if updates.deadline is not None:
        challenge.deadline = updates.deadline
    if updates.tags is not None:
        challenge.tags = updates.tags
    
    challenge.updated_at = datetime.now(timezone.utc)
    db.add(challenge)
    await db.commit()
    await db.refresh(challenge)
    return challenge


# ===========================================================================
# PROPOSAL OPERATIONS
# ===========================================================================

async def submit_proposal(
    db: AsyncSession,
    challenge_id: uuid.UUID,
    proposal_in: ProposalCreate,
    submitted_by: uuid.UUID,
) -> Proposal:
    """
    Submit a proposal in response to a challenge.
    
    Validates that:
    1. The challenge exists
    2. The challenge is currently OPEN
    """
    # Verify the challenge exists and is open
    challenge = await get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise ValueError("Challenge not found.")
    if challenge.status != ChallengeStatus.OPEN:
        raise ValueError("This challenge is no longer accepting proposals.")
    
    proposal = Proposal(
        challenge_id=challenge_id,
        submitted_by=submitted_by,
        title=proposal_in.title.strip(),
        abstract=proposal_in.abstract.strip(),
        detailed_plan=proposal_in.detailed_plan,
        team_members=proposal_in.team_members,
    )
    
    db.add(proposal)
    
    # Increment the cached proposal count on the challenge
    challenge.proposal_count += 1
    challenge.updated_at = datetime.now(timezone.utc)
    db.add(challenge)
    
    await db.commit()
    await db.refresh(proposal)
    return proposal


async def list_proposals_for_challenge(
    db: AsyncSession,
    challenge_id: uuid.UUID,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> list[Proposal]:
    """List all proposals for a given challenge, with optional status filter."""
    statement = select(Proposal).where(Proposal.challenge_id == challenge_id)
    
    if status:
        statement = statement.where(Proposal.status == status)
    
    statement = statement.order_by(col(Proposal.created_at).desc())
    statement = statement.offset(skip).limit(limit)
    
    result = await db.execute(statement)
    return list(result.scalars().all())


async def get_proposal_by_id(
    db: AsyncSession,
    proposal_id: uuid.UUID,
) -> Optional[Proposal]:
    """Fetch a single proposal by its UUID."""
    statement = select(Proposal).where(Proposal.id == proposal_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def update_proposal_status(
    db: AsyncSession,
    proposal: Proposal,
    update: ProposalStatusUpdate,
) -> Proposal:
    """
    Update a proposal's review status, score, and/or admin notes.
    
    This is the core of the "Applicant-facing status tracker"
    requirement from the PDF.
    """
    proposal.status = update.status
    
    if update.admin_notes is not None:
        proposal.admin_notes = update.admin_notes
    if update.score is not None:
        proposal.score = update.score
    
    proposal.updated_at = datetime.now(timezone.utc)
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)
    return proposal


async def update_proposal_funding(
    db: AsyncSession,
    proposal: Proposal,
    update: ProposalFundingUpdate,
) -> Proposal:
    """
    Update a proposal's funding disbursement status.
    
    PDF: "Admin-facing grant/funding disbursement tracker"
    """
    if update.funding_amount is not None:
        proposal.funding_amount = update.funding_amount
    proposal.funding_status = update.funding_status
    
    proposal.updated_at = datetime.now(timezone.utc)
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)
    return proposal


# ===========================================================================
# VOTING OPERATIONS
# ===========================================================================

async def vote_for_proposal(
    db: AsyncSession,
    proposal_id: uuid.UUID,
    user_id: uuid.UUID,
) -> bool:
    """
    Cast a vote for a proposal.
    
    Returns True if the vote was cast, False if the user already voted.
    Enforces one-vote-per-user via the unique constraint.
    """
    # Check if user already voted
    statement = select(ProposalVote).where(
        and_(
            ProposalVote.proposal_id == proposal_id,
            ProposalVote.user_id == user_id,
        )
    )
    result = await db.execute(statement)
    existing_vote = result.scalar_one_or_none()
    
    if existing_vote:
        return False  # Already voted
    
    # Cast the vote
    vote = ProposalVote(
        proposal_id=proposal_id,
        user_id=user_id,
    )
    db.add(vote)
    
    # Increment cached vote count on the proposal
    proposal = await get_proposal_by_id(db, proposal_id)
    if proposal:
        proposal.vote_count += 1
        proposal.updated_at = datetime.now(timezone.utc)
        db.add(proposal)
    
    await db.commit()
    return True


async def remove_vote(
    db: AsyncSession,
    proposal_id: uuid.UUID,
    user_id: uuid.UUID,
) -> bool:
    """
    Remove a user's vote from a proposal.
    
    Returns True if the vote was removed, False if no vote existed.
    """
    statement = select(ProposalVote).where(
        and_(
            ProposalVote.proposal_id == proposal_id,
            ProposalVote.user_id == user_id,
        )
    )
    result = await db.execute(statement)
    existing_vote = result.scalar_one_or_none()
    
    if not existing_vote:
        return False
    
    await db.delete(existing_vote)
    
    # Decrement cached vote count
    proposal = await get_proposal_by_id(db, proposal_id)
    if proposal and proposal.vote_count > 0:
        proposal.vote_count -= 1
        proposal.updated_at = datetime.now(timezone.utc)
        db.add(proposal)
    
    await db.commit()
    return True


# ===========================================================================
# LEADERBOARD & SHOWCASE
# ===========================================================================

async def get_leaderboard(
    db: AsyncSession,
    challenge_id: uuid.UUID,
    limit: int = 20,
) -> list[Proposal]:
    """
    Get ranked proposals for a challenge.
    
    PDF: "Leaderboard and public showcase of funded/completed pilots"
    
    Ranking logic:
    - First by expert score (highest first, NULLs last)
    - Then by public vote count (highest first)
    """
    statement = (
        select(Proposal)
        .where(Proposal.challenge_id == challenge_id)
        .order_by(
            col(Proposal.score).desc().nulls_last(),
            col(Proposal.vote_count).desc(),
        )
        .limit(limit)
    )
    
    result = await db.execute(statement)
    return list(result.scalars().all())


async def get_showcase(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Proposal]:
    """
    Get success stories — funded and completed proposals.
    
    PDF: "Success-story case-study showcase"
    """
    statement = (
        select(Proposal)
        .where(
            Proposal.status.in_([ProposalStatus.FUNDED, ProposalStatus.COMPLETED])
        )
        .order_by(col(Proposal.updated_at).desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(statement)
    return list(result.scalars().all())


async def get_innovation_stats(db: AsyncSession) -> dict:
    """
    Platform-wide innovation stats for the dashboard.
    
    Returns total counts for challenges, proposals, funded projects, etc.
    """
    # Total challenges
    total_challenges_result = await db.execute(select(func.count(Challenge.id)))
    total_challenges = total_challenges_result.scalar_one()
    
    # Open challenges
    open_challenges_result = await db.execute(
        select(func.count(Challenge.id)).where(Challenge.status == ChallengeStatus.OPEN)
    )
    open_challenges = open_challenges_result.scalar_one()
    
    # Total proposals
    total_proposals_result = await db.execute(select(func.count(Proposal.id)))
    total_proposals = total_proposals_result.scalar_one()
    
    # Funded proposals
    funded_result = await db.execute(
        select(func.count(Proposal.id)).where(
            Proposal.status.in_([ProposalStatus.FUNDED, ProposalStatus.COMPLETED])
        )
    )
    funded_count = funded_result.scalar_one()
    
    # Total votes cast
    total_votes_result = await db.execute(select(func.count(ProposalVote.id)))
    total_votes = total_votes_result.scalar_one()
    
    return {
        "total_challenges": total_challenges,
        "open_challenges": open_challenges,
        "total_proposals": total_proposals,
        "funded_projects": funded_count,
        "total_votes_cast": total_votes,
    }
