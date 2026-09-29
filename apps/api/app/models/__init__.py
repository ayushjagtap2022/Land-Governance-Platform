# Import models for Alembic discovery
from app.models.user import User
from app.models.audit_log import AuditLog

# Module 8 (Innovation Portal)
from app.models.challenge import Challenge
from app.models.proposal import Proposal, ProposalVote

# Module 4 (Collaborative Workspaces)
from app.models.workspace import Workspace, WorkspaceMember, Task
from app.models.message import Message

# Module 11 (Notifications)
from app.models.notification import Notification

# Module 2 (Repository - pgvector & PostGIS)
from app.models.document import Document
