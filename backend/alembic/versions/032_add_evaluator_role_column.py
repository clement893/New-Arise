"""add evaluator_role column to assessment_360_evaluators

Revision ID: 032
Revises: 031
Create Date: 2026-01-01 23:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '032'
down_revision = '031_set_superadmin_user_type'
branch_labels = None
depends_on = None


def upgrade():
    """Add evaluator_role column to assessment_360_evaluators if it doesn't exist"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if table exists
    tables = inspector.get_table_names()
    if 'assessment_360_evaluators' not in tables:
        print("⚠️  assessment_360_evaluators table does not exist, skipping column addition")
        return
    
    # Check if column already exists
    columns = [col['name'] for col in inspector.get_columns('assessment_360_evaluators')]
    
    if 'evaluator_role' not in columns:
        print("📝 Adding evaluator_role column to assessment_360_evaluators table...")
        
        # First, create the enum type if it doesn't exist
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE evaluatorrole AS ENUM ('peer', 'manager', 'direct_report', 'stakeholder');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        
        # Add the column with a default value
        op.add_column(
            'assessment_360_evaluators',
            sa.Column('evaluator_role', sa.Enum('peer', 'manager', 'direct_report', 'stakeholder', name='evaluatorrole'), nullable=False, server_default='peer')
        )
        
        print("✅ Added evaluator_role column to assessment_360_evaluators table")
    else:
        print("✅ evaluator_role column already exists in assessment_360_evaluators table")


def downgrade():
    """Remove evaluator_role column from assessment_360_evaluators"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if table exists
    tables = inspector.get_table_names()
    if 'assessment_360_evaluators' not in tables:
        return
    
    # Check if column exists
    columns = [col['name'] for col in inspector.get_columns('assessment_360_evaluators')]
    
    if 'evaluator_role' in columns:
        op.drop_column('assessment_360_evaluators', 'evaluator_role')
        print("✅ Removed evaluator_role column from assessment_360_evaluators table")
