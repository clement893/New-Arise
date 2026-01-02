"""add missing columns to assessment_360_evaluators

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
    """Add missing columns to assessment_360_evaluators if they don't exist"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if table exists
    tables = inspector.get_table_names()
    if 'assessment_360_evaluators' not in tables:
        print("⚠️  assessment_360_evaluators table does not exist, skipping column addition")
        return
    
    # Get existing columns
    columns = {col['name']: col for col in inspector.get_columns('assessment_360_evaluators')}
    print(f"📋 Existing columns in assessment_360_evaluators: {list(columns.keys())}")
    
    # Check and create enum type with correct values (uppercase to match Python model)
    # First check what enum values exist
    enum_result = conn.execute(sa.text("""
        SELECT t.typname, e.enumlabel 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'evaluatorrole'
        ORDER BY e.enumsortorder;
    """))
    existing_enum_values = [row[1] for row in enum_result.fetchall()]
    
    if existing_enum_values:
        print(f"📋 Existing evaluatorrole enum values: {existing_enum_values}")
        # Use existing enum if it exists
        enum_name = 'evaluatorrole'
    else:
        print("📝 Creating evaluatorrole enum type...")
        # Create enum with uppercase values to match Python model
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE evaluatorrole AS ENUM ('PEER', 'MANAGER', 'DIRECT_REPORT', 'STAKEHOLDER');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        enum_name = 'evaluatorrole'
        print("✅ Created evaluatorrole enum type")
    
    # Add evaluator_role column if missing
    if 'evaluator_role' not in columns:
        print("📝 Adding evaluator_role column...")
        # Use uppercase values to match Python model
        op.add_column(
            'assessment_360_evaluators',
            sa.Column('evaluator_role', sa.Enum('PEER', 'MANAGER', 'DIRECT_REPORT', 'STAKEHOLDER', name='evaluatorrole'), nullable=False, server_default='PEER')
        )
        print("✅ Added evaluator_role column")
    else:
        print("✅ evaluator_role column already exists")
    
    # Add invitation_token column if missing
    if 'invitation_token' not in columns:
        print("📝 Adding invitation_token column...")
        op.add_column(
            'assessment_360_evaluators',
            sa.Column('invitation_token', sa.String(length=100), nullable=False, server_default='')
        )
        # Add unique constraint
        op.create_unique_constraint('uq_assessment_360_evaluators_invitation_token', 'assessment_360_evaluators', ['invitation_token'])
        # Add index
        op.create_index('idx_360_evaluators_token', 'assessment_360_evaluators', ['invitation_token'])
        print("✅ Added invitation_token column with unique constraint and index")
    else:
        print("✅ invitation_token column already exists")
    
    # Add other missing columns that might be needed
    missing_columns = {
        'invitation_sent_at': sa.Column('invitation_sent_at', sa.DateTime(timezone=True), nullable=True),
        'invitation_opened_at': sa.Column('invitation_opened_at', sa.DateTime(timezone=True), nullable=True),
        'started_at': sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        'completed_at': sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        'evaluator_assessment_id': sa.Column('evaluator_assessment_id', sa.Integer(), nullable=True),
    }
    
    for col_name, col_def in missing_columns.items():
        if col_name not in columns:
            print(f"📝 Adding {col_name} column...")
            op.add_column('assessment_360_evaluators', col_def)
            print(f"✅ Added {col_name} column")
        else:
            print(f"✅ {col_name} column already exists")
    
    # Add foreign key for evaluator_assessment_id if column was just added
    if 'evaluator_assessment_id' not in columns:
        print("📝 Adding foreign key constraint for evaluator_assessment_id...")
        op.create_foreign_key(
            'fk_assessment_360_evaluators_evaluator_assessment_id',
            'assessment_360_evaluators',
            'assessments',
            ['evaluator_assessment_id'],
            ['id'],
            ondelete='SET NULL'
        )
        print("✅ Added foreign key constraint")


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
