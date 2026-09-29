"""
Innovation Portal API Routes — Module 8.

All endpoints for the Innovation Portal:
  - Challenge management (create, list, get, update)
  - Proposal submission and review
  - Public voting
  - Leaderboard and showcase
  - Platform-wide stats
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_db, get_current_user, require_role
from app.models.user import User
from app.models.challenge import (
    Challenge, ChallengeCreate, ChallengeUpdate, ChallengeRead,
)
from app.models.proposal import (
    Proposal, ProposalCreate, ProposalRead,
    ProposalStatusUpdate, ProposalFundingUpdate,
)
from app.models.notification import NotificationType
from app.services import innovation_service, notification_service
from app.services.s3_service import upload_proposal_pdf

router = APIRouter()


# ===========================================================================
# CHALLENGE ENDPOINTS
# ===========================================================================

@router.post(
    "/challenges",
    response_model=ChallengeRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new challenge (hackathon, grant, research call)",
)
async def create_challenge(
    challenge_in: ChallengeCreate,
    current_user: User = Depends(require_role("official", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Post a new challenge on the Innovation Portal.
    
    Only Government Officials and Super Admins can create challenges.
    The challenge is immediately set to OPEN status.
    """
    challenge = await innovation_service.create_challenge(
        db=db,
        challenge_in=challenge_in,
        created_by=current_user.id,
    )
    return ChallengeRead.model_validate(challenge)


@router.get(
    "/challenges",
    response_model=list[ChallengeRead],
    summary="List all challenges",
)
async def list_challenges(
    challenge_type: Optional[str] = Query(None, description="Filter by type: hackathon, grant, research_call, pilot_project"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: draft, open, closed, completed"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    List all challenges on the Innovation Portal.
    
    Publicly accessible. Supports filtering by type and status,
    with pagination via skip/limit.
    """
    challenges = await innovation_service.list_challenges(
        db=db,
        challenge_type=challenge_type,
        status=status_filter,
        skip=skip,
        limit=limit,
    )
    return [ChallengeRead.model_validate(c) for c in challenges]


@router.get(
    "/challenges/{challenge_id}",
    response_model=ChallengeRead,
    summary="Get a challenge's full details",
)
async def get_challenge(
    challenge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get the full details of a specific challenge by its ID."""
    challenge = await innovation_service.get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    return ChallengeRead.model_validate(challenge)


@router.patch(
    "/challenges/{challenge_id}",
    response_model=ChallengeRead,
    summary="Update a challenge",
)
async def update_challenge(
    challenge_id: uuid.UUID,
    updates: ChallengeUpdate,
    current_user: User = Depends(require_role("official", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a challenge's details or status.
    
    Only the creator (Official) or a Super Admin can update a challenge.
    """
    challenge = await innovation_service.get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    
    updated = await innovation_service.update_challenge(db, challenge, updates)
    return ChallengeRead.model_validate(updated)


# ===========================================================================
# PROPOSAL ENDPOINTS
# ===========================================================================

@router.post(
    "/challenges/{challenge_id}/proposals",
    response_model=ProposalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a proposal for a challenge",
)
async def submit_proposal(
    challenge_id: uuid.UUID,
    proposal_in: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a proposal in response to an open challenge.
    
    Any authenticated user can submit a proposal.
    The challenge must be in OPEN status.
    """
    try:
        proposal = await innovation_service.submit_proposal(
            db=db,
            challenge_id=challenge_id,
            proposal_in=proposal_in,
            submitted_by=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return ProposalRead.model_validate(proposal)


@router.post(
    "/proposals/{proposal_id}/upload-document",
    response_model=ProposalRead,
    summary="Upload PDF document for a proposal",
)
async def upload_proposal_document(
    proposal_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload the PDF detailed plan to an S3-compatible bucket and attach to the proposal.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
        
    proposal = await innovation_service.get_proposal_by_id(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
        
    if proposal.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You can only upload documents to your own proposals.")
        
    try:
        # Upload to S3
        url = upload_proposal_pdf(file)
        # Update database
        proposal.document_url = url
        db.add(proposal)
        await db.commit()
        await db.refresh(proposal)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return ProposalRead.model_validate(proposal)


@router.get(
    "/challenges/{challenge_id}/proposals",
    response_model=list[ProposalRead],
    summary="List all proposals for a challenge",
)
async def list_proposals(
    challenge_id: uuid.UUID,
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all proposals submitted for a specific challenge."""
    proposals = await innovation_service.list_proposals_for_challenge(
        db=db,
        challenge_id=challenge_id,
        status=status_filter,
        skip=skip,
        limit=limit,
    )
    return [ProposalRead.model_validate(p) for p in proposals]


@router.get(
    "/proposals/{proposal_id}",
    response_model=ProposalRead,
    summary="Get a proposal's full details",
)
async def get_proposal(
    proposal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get the full details of a specific proposal, including vote count and status."""
    proposal = await innovation_service.get_proposal_by_id(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    return ProposalRead.model_validate(proposal)


@router.patch(
    "/proposals/{proposal_id}/status",
    response_model=ProposalRead,
    summary="Update a proposal's review status",
)
async def update_proposal_status(
    proposal_id: uuid.UUID,
    update: ProposalStatusUpdate,
    current_user: User = Depends(require_role("official", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Update the review status of a proposal.
    
    This powers the "Applicant-facing status tracker":
    submitted → under_review → shortlisted → funded → completed (or rejected)
    
    Only Officials and Super Admins can update proposal status.
    """
    proposal = await innovation_service.get_proposal_by_id(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    
    updated = await innovation_service.update_proposal_status(db, proposal, update)
    
    # Trigger a real-time notification to the submitter
    await notification_service.send_notification(
        db=db,
        user_id=updated.submitted_by,
        title="Proposal Status Updated",
        content=f"Your proposal '{updated.title}' is now {updated.status.value.upper()}.",
        type=NotificationType.INFO
    )
    
    return ProposalRead.model_validate(updated)


@router.patch(
    "/proposals/{proposal_id}/funding",
    response_model=ProposalRead,
    summary="Update a proposal's funding disbursement status",
)
async def update_proposal_funding(
    proposal_id: uuid.UUID,
    update: ProposalFundingUpdate,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    Update the funding/disbursement status of a proposal.
    
    PDF: "Admin-facing grant/funding disbursement tracker"
    
    Only Super Admins can update funding status.
    """
    proposal = await innovation_service.get_proposal_by_id(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    
    updated = await innovation_service.update_proposal_funding(db, proposal, update)
    return ProposalRead.model_validate(updated)


# ===========================================================================
# VOTING ENDPOINTS
# ===========================================================================

@router.post(
    "/proposals/{proposal_id}/vote",
    status_code=status.HTTP_201_CREATED,
    summary="Vote for a proposal",
)
async def vote_for_proposal(
    proposal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cast a vote for a proposal. Each user can vote only once per proposal.
    
    PDF: "Public voting and/or expert panel scoring"
    """
    # Verify proposal exists
    proposal = await innovation_service.get_proposal_by_id(db, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")
    
    voted = await innovation_service.vote_for_proposal(
        db=db,
        proposal_id=proposal_id,
        user_id=current_user.id,
    )
    
    if not voted:
        raise HTTPException(status_code=409, detail="You have already voted for this proposal.")
    
    return {"message": "Vote cast successfully."}


@router.delete(
    "/proposals/{proposal_id}/vote",
    summary="Remove your vote from a proposal",
)
async def remove_vote(
    proposal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove your vote from a proposal."""
    removed = await innovation_service.remove_vote(
        db=db,
        proposal_id=proposal_id,
        user_id=current_user.id,
    )
    
    if not removed:
        raise HTTPException(status_code=404, detail="You haven't voted for this proposal.")
    
    return {"message": "Vote removed successfully."}


# ===========================================================================
# LEADERBOARD & SHOWCASE
# ===========================================================================

@router.get(
    "/challenges/{challenge_id}/leaderboard",
    response_model=list[ProposalRead],
    summary="Get ranked proposals for a challenge",
)
async def get_leaderboard(
    challenge_id: uuid.UUID,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Get proposals for a challenge, ranked by expert score and public votes.
    
    PDF: "Leaderboard and public showcase of funded/completed pilots"
    """
    # Verify challenge exists
    challenge = await innovation_service.get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    
    proposals = await innovation_service.get_leaderboard(
        db=db,
        challenge_id=challenge_id,
        limit=limit,
    )
    return [ProposalRead.model_validate(p) for p in proposals]


@router.get(
    "/showcase",
    response_model=list[ProposalRead],
    summary="Success stories — funded and completed projects",
)
async def get_showcase(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all success stories — proposals that have been funded or completed.
    
    PDF: "Success-story case-study showcase"
    """
    proposals = await innovation_service.get_showcase(db, skip=skip, limit=limit)
    return [ProposalRead.model_validate(p) for p in proposals]


@router.get(
    "/stats",
    summary="Platform-wide innovation statistics",
)
async def get_stats(
    db: AsyncSession = Depends(get_db),
):
    """
    Get platform-wide innovation stats:
    total challenges, open challenges, total proposals, funded projects, total votes.
    """
    stats = await innovation_service.get_innovation_stats(db)
    return stats
