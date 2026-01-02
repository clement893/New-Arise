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
    
    # Add evaluator_role column - force check and add if missing
    # Double-check by querying the database directly using op.execute for proper transaction handling
    check_result = op.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'assessment_360_evaluators' 
        AND column_name = 'evaluator_role'
    """))
    column_exists_in_db = check_result.fetchone() is not None
    
    if 'evaluator_role' not in columns or not column_exists_in_db:
        print("📝 Adding evaluator_role column...")
        # Drop column if it exists but is broken
        if column_exists_in_db:
            print("⚠️  Column exists in inspector but may be broken, attempting to drop and recreate...")
            try:
                op.drop_column('assessment_360_evaluators', 'evaluator_role')
                print("✅ Dropped existing broken column")
            except Exception as e:
                print(f"⚠️  Could not drop column (may not exist): {e}")
        
        # Use raw SQL to ensure the column is added correctly
        # This bypasses any potential SQLAlchemy schema cache issues
        op.execute(sa.text("""
            ALTER TABLE assessment_360_evaluators 
            ADD COLUMN IF NOT EXISTS evaluator_role evaluatorrole NOT NULL DEFAULT 'PEER'::evaluatorrole
        """))
        print("✅ Added evaluator_role column using raw SQL")
        
        # Verify column was added by querying database directly
        verify_result = op.execute(sa.text("""
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'assessment_360_evaluators' 
            AND column_name = 'evaluator_role'
        """))
        verify_row = verify_result.fetchone()
        if verify_row:
            print(f"✅ Verified evaluator_role column exists: {verify_row}")
        else:
            print("❌ ERROR: evaluator_role column was not added successfully!")
            raise Exception("Failed to add evaluator_role column")
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
    
    # Check assessmentstatus enum values
    assessmentstatus_enum_result = conn.execute(sa.text("""
        SELECT t.typname, e.enumlabel 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'assessmentstatus'
        ORDER BY e.enumsortorder;
    """))
    assessmentstatus_enum_values = [row[1] for row in assessmentstatus_enum_result.fetchall()]
    
    if assessmentstatus_enum_values:
        print(f"📋 Existing assessmentstatus enum values: {assessmentstatus_enum_values}")
    else:
        print("⚠️  assessmentstatus enum does not exist, creating it...")
        conn.execute(sa.text("""
            DO $$ BEGIN
                CREATE TYPE assessmentstatus AS ENUM ('not_started', 'in_progress', 'completed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        """))
        assessmentstatus_enum_values = ['not_started', 'in_progress', 'completed']
        print("✅ Created assessmentstatus enum type")
    
    # Add status column separately with proper handling
    if 'status' not in columns:
        print("📝 Adding status column...")
        # Use the first enum value as default (should match the actual enum values in DB)
        default_value = assessmentstatus_enum_values[0] if assessmentstatus_enum_values else 'NOT_STARTED'
        # First add the column as nullable
        # Use the actual enum values from the database
        enum_type = sa.Enum(*assessmentstatus_enum_values, name='assessmentstatus') if assessmentstatus_enum_values else sa.Enum('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', name='assessmentstatus')
        op.add_column('assessment_360_evaluators', sa.Column('status', enum_type, nullable=True))
        # Then set default value for existing rows using the actual enum value
        conn.execute(sa.text(f"UPDATE assessment_360_evaluators SET status = '{default_value}'::assessmentstatus WHERE status IS NULL"))
        # Finally make it NOT NULL with default - use sa.text() for proper SQL expression
        op.alter_column('assessment_360_evaluators', 'status', nullable=False, server_default=sa.text(f"'{default_value}'::assessmentstatus"))
        print(f"✅ Added status column with default '{default_value}'")
    else:
        print("✅ status column already exists")
    
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
