"""Set user_type to ADMIN for all superadmin users

Revision ID: 031_set_superadmin_user_type
Revises: 030_add_user_type
Create Date: 2025-01-02 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '031_set_superadmin_user_type'
down_revision: Union[str, None] = '030_add_user_type'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Set user_type to ADMIN for all users with superadmin role."""
    conn = op.get_bind()
    
    # Check if users table exists
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'users' not in tables:
        return  # Table doesn't exist, skip this migration
    
    # Check if user_type column exists
    columns = [col['name'] for col in inspector.get_columns('users')]
    if 'user_type' not in columns:
        print("⚠️  user_type column does not exist, skipping superadmin update")
        return
    
    # Check if roles and user_roles tables exist
    if 'roles' not in tables or 'user_roles' not in tables:
        print("⚠️  roles or user_roles tables do not exist, skipping superadmin update")
        return
    
    # Update all users with superadmin role to have user_type = 'ADMIN'
    # This query finds all users who have the superadmin role and sets their user_type to ADMIN
    update_query = text("""
        UPDATE users
        SET user_type = 'ADMIN'
        WHERE id IN (
            SELECT DISTINCT ur.user_id
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE r.slug = 'superadmin' AND r.is_active = true
        )
        AND user_type != 'ADMIN'
    """)
    
    try:
        result = conn.execute(update_query)
        updated_count = result.rowcount
        conn.commit()
        print(f"✅ Updated {updated_count} superadmin user(s) to have user_type = 'ADMIN'")
    except Exception as e:
        conn.rollback()
        print(f"⚠️  Error updating superadmin users: {e}")
        # Don't fail the migration, just log the error
        pass


def downgrade() -> None:
    """This migration cannot be safely reversed."""
    # We don't know what the original user_type values were,
    # so we don't attempt to restore them
    print("⚠️  Cannot reverse superadmin user_type update - original values unknown")
    pass
