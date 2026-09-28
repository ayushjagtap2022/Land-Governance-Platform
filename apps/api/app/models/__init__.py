# Import only auth-related models for now.
# Document model requires pgvector + PostGIS extensions to be enabled on Neon DB.
# It will be migrated separately when Module 2 (Repository) is built.
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

# Uncomment when PostGIS and pgvector extensions are enabled on Neon DB:
# from app.models.document import Document

# Important: Import all your SQLModel table models here so that Alembic's env.py
# can discover them via `import app.models`
