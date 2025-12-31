"""Add user_type column to users table

Revision ID: 030_add_user_type
Revises: 029
Create Date: 2025-01-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '030_add_user_type'
down_revision: Union[str, None] = '029'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add user_type enum and column to users table."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if users table exists
    tables = inspector.get_table_names()
    if 'users' not in tables:
        return  # Table doesn't exist, skip this migration
    
    # Check if enum types exist
    try:
        enum_names = [e['name'] for e in inspector.get_enums()]
    except Exception:
        enum_names = []
    
    # Create usertype enum if it doesn't exist
    if 'usertype' not in enum_names:
        op.execute("CREATE TYPE usertype AS ENUM ('INDIVIDUAL', 'COACH', 'BUSINESS', 'ADMIN')")
    
    # Check if user_type column already exists
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'user_type' not in columns:
        # Add user_type column with default value
        op.add_column(
            'users',
            sa.Column('user_type', sa.Enum('INDIVIDUAL', 'COACH', 'BUSINESS', 'ADMIN', name='usertype'), nullable=False, server_default='INDIVIDUAL')
        )
        # Create index for user_type
        op.create_index('idx_users_user_type', 'users', ['user_type'])
    else:
        print("⚠️  user_type column already exists, skipping creation")


def downgrade() -> None:
    """Remove user_type column and enum from users table."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if users table exists
    tables = inspector.get_table_names()
    if 'users' not in tables:
        return  # Table doesn't exist, skip
    
    # Check if user_type column exists before dropping
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'user_type' in columns:
        # Drop index first
        op.drop_index('idx_users_user_type', table_name='users')
        # Drop column
        op.drop_column('users', 'user_type')
    
    # Drop enum type (only if no other tables use it)
    # Note: In PostgreSQL, we can't easily check if enum is used elsewhere,
    # so we'll try to drop it and ignore errors if it fails
    try:
        op.execute("DROP TYPE usertype")
    except Exception:
        print("⚠️  Could not drop usertype enum (may be used by other tables)")
