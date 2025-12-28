"""Merge migration heads

Revision ID: 023_merge_migration_heads
Revises: ('013_pages_forms_menus_tickets', '020_security_audit_logs')
Create Date: 2025-12-28 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '023_merge_migration_heads'
down_revision: Union[str, tuple] = ('013_pages_forms_menus_tickets', '020_security_audit_logs')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Merge migration heads - no schema changes needed."""
    # This is a merge migration, so no actual schema changes are needed
    # Both migrations have already been applied to their respective branches
    pass


def downgrade() -> None:
    """Downgrade merge migration."""
    # This is a merge migration, so no actual schema changes to revert
    pass
