"""add document_url

Revision ID: ebab9411a8c7
Revises: d5f7017c8e4a
Create Date: 2026-09-29 03:18:25.355288

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = 'ebab9411a8c7'
down_revision: Union[str, Sequence[str], None] = 'd5f7017c8e4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('proposals', sa.Column('document_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.drop_column('proposals', 'detailed_plan')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('proposals', sa.Column('detailed_plan', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('proposals', 'document_url')
