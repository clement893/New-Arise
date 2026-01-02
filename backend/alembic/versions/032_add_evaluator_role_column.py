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
    # Double-check by querying the database directly using conn.execute for SELECT queries
    check_result = conn.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'assessment_360_evaluators' 
        AND column_name = 'evaluator_role'
    """))
    column_exists_in_db = check_result.fetchone() is not None
    
    if 'evaluator_role' not in columns or not column_exists_in_db:
        print("📝 Adding evaluator_role column...")
        # ALWAYS drop and recreate to ensure clean state
        # This fixes issues where the column exists but asyncpg can't see it
        if column_exists_in_db:
            print("⚠️  Column exists in DB but may not be visible to asyncpg, dropping and recreating...")
            try:
                # Drop column using raw SQL to ensure it's removed
                conn.execute(sa.text("""
                    ALTER TABLE assessment_360_evaluators 
                    DROP COLUMN IF EXISTS evaluator_role CASCADE
                """))
                print("✅ Dropped existing evaluator_role column")
            except Exception as e:
                print(f"⚠️  Could not drop column (may not exist): {e}")
        
        # Use raw SQL to ensure the column is added correctly
        # This bypasses any potential SQLAlchemy schema cache issues
        # First add as nullable, then update existing rows, then make NOT NULL
        conn.execute(sa.text("""
            ALTER TABLE assessment_360_evaluators 
            ADD COLUMN evaluator_role evaluatorrole
        """))
        print("✅ Added evaluator_role column as nullable")
        
        # Update existing rows with default value
        conn.execute(sa.text("""
            UPDATE assessment_360_evaluators 
            SET evaluator_role = 'PEER'::evaluatorrole 
            WHERE evaluator_role IS NULL
        """))
        print("✅ Updated existing rows with default 'PEER' for evaluator_role")
        
        # Make it NOT NULL with default
        conn.execute(sa.text("""
            ALTER TABLE assessment_360_evaluators 
            ALTER COLUMN evaluator_role SET NOT NULL,
            ALTER COLUMN evaluator_role SET DEFAULT 'PEER'::evaluatorrole
        """))
        print("✅ Set evaluator_role column to NOT NULL with default 'PEER'")
        
        # Force commit to ensure the change is visible
        conn.commit()
        print("✅ Committed evaluator_role column addition")
        
        # Verify column was added by querying database directly
        verify_result = conn.execute(sa.text("""
            SELECT column_name, data_type, udt_name, is_nullable, column_default
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
        
        # Force PostgreSQL to notify all connections about schema change
        # This helps asyncpg reload its schema cache
        try:
            conn.execute(sa.text("NOTIFY schema_change, 'evaluator_role_added'"))
            print("✅ Sent NOTIFY to force schema cache reload")
        except Exception as e:
            print(f"⚠️  Could not send NOTIFY (non-critical): {e}")
    else:
        print("✅ evaluator_role column already exists")
    
    # Add invitation_token column - force check and recreate if needed
    check_token_result = conn.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'assessment_360_evaluators' 
        AND column_name = 'invitation_token'
    """))
    token_column_exists_in_db = check_token_result.fetchone() is not None
    
    if 'invitation_token' not in columns or not token_column_exists_in_db:
        print("📝 Adding invitation_token column...")
        # ALWAYS drop and recreate to ensure clean state
        if token_column_exists_in_db:
            print("⚠️  invitation_token column exists in DB but may not be visible to asyncpg, dropping and recreating...")
            try:
                # Drop constraints and index first
                conn.execute(sa.text("""
                    DROP INDEX IF EXISTS idx_360_evaluators_token;
                    ALTER TABLE assessment_360_evaluators 
                    DROP CONSTRAINT IF EXISTS uq_assessment_360_evaluators_invitation_token;
                    ALTER TABLE assessment_360_evaluators 
                    DROP COLUMN IF EXISTS invitation_token CASCADE;
                """))
                print("✅ Dropped existing invitation_token column and constraints")
            except Exception as e:
                print(f"⚠️  Could not drop column (may not exist): {e}")
        
        # Add column using raw SQL
        conn.execute(sa.text("""
            ALTER TABLE assessment_360_evaluators 
            ADD COLUMN invitation_token VARCHAR(100) NOT NULL DEFAULT ''
        """))
        print("✅ Added invitation_token column")
        
        # Add unique constraint
        conn.execute(sa.text("""
            ALTER TABLE assessment_360_evaluators 
            ADD CONSTRAINT uq_assessment_360_evaluators_invitation_token 
            UNIQUE (invitation_token)
        """))
        print("✅ Added unique constraint for invitation_token")
        
        # Add index
        conn.execute(sa.text("""
            CREATE INDEX idx_360_evaluators_token 
            ON assessment_360_evaluators (invitation_token)
        """))
        print("✅ Added index for invitation_token")
        
        # Force commit
        conn.commit()
        print("✅ Committed invitation_token column addition")
        
        # Verify column was added
        verify_token_result = conn.execute(sa.text("""
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'assessment_360_evaluators' 
            AND column_name = 'invitation_token'
        """))
        verify_token_row = verify_token_result.fetchone()
        if verify_token_row:
            print(f"✅ Verified invitation_token column exists: {verify_token_row}")
        else:
            print("❌ ERROR: invitation_token column was not added successfully!")
            raise Exception("Failed to add invitation_token column")
        
        # Force PostgreSQL to notify all connections about schema change
        try:
            conn.execute(sa.text("NOTIFY schema_change, 'invitation_token_added'"))
            print("✅ Sent NOTIFY to force schema cache reload for invitation_token")
        except Exception as e:
            print(f"⚠️  Could not send NOTIFY (non-critical): {e}")
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
    
    # Add status column separately with proper handling - use raw SQL
    check_status_result = conn.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'assessment_360_evaluators' 
        AND column_name = 'status'
    """))
    status_column_exists_in_db = check_status_result.fetchone() is not None
    
    if 'status' not in columns or not status_column_exists_in_db:
        print("📝 Adding status column...")
        # ALWAYS drop and recreate to ensure clean state
        if status_column_exists_in_db:
            print("⚠️  status column exists in DB but may not be visible to asyncpg, dropping and recreating...")
            try:
                conn.execute(sa.text("ALTER TABLE assessment_360_evaluators DROP COLUMN IF EXISTS status CASCADE"))
                print("✅ Dropped existing status column")
            except Exception as e:
                print(f"⚠️  Could not drop column (may not exist): {e}")
        
        # Use the first enum value as default (should match the actual enum values in DB)
        default_value = assessmentstatus_enum_values[0] if assessmentstatus_enum_values else 'NOT_STARTED'
        # Add column using raw SQL
        conn.execute(sa.text(f"""
            ALTER TABLE assessment_360_evaluators 
            ADD COLUMN status assessmentstatus
        """))
        print("✅ Added status column as nullable")
        
        # Update existing rows
        conn.execute(sa.text(f"UPDATE assessment_360_evaluators SET status = '{default_value}'::assessmentstatus WHERE status IS NULL"))
        print(f"✅ Updated existing rows with default '{default_value}' for status")
        
        # Make it NOT NULL with default
        conn.execute(sa.text(f"""
            ALTER TABLE assessment_360_evaluators 
            ALTER COLUMN status SET NOT NULL,
            ALTER COLUMN status SET DEFAULT '{default_value}'::assessmentstatus
        """))
        print(f"✅ Set status column to NOT NULL with default '{default_value}'")
        
        # Force commit
        conn.commit()
        print("✅ Committed status column addition")
        
        # Verify
        verify_status_result = conn.execute(sa.text("""
            SELECT column_name, data_type, udt_name, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'assessment_360_evaluators' 
            AND column_name = 'status'
        """))
        verify_status_row = verify_status_result.fetchone()
        if verify_status_row:
            print(f"✅ Verified status column exists: {verify_status_row}")
        else:
            print("❌ ERROR: status column was not added successfully!")
            raise Exception("Failed to add status column")
        
        # Force PostgreSQL to notify all connections about schema change
        try:
            conn.execute(sa.text("NOTIFY schema_change, 'status_added'"))
            print("✅ Sent NOTIFY to force schema cache reload for status")
        except Exception as e:
            print(f"⚠️  Could not send NOTIFY (non-critical): {e}")
    else:
        print("✅ status column already exists")
    
    # Add other missing columns using raw SQL with force drop/recreate
    columns_to_add = {
        'invitation_opened_at': ('TIMESTAMP WITH TIME ZONE', 'NULL'),
        'started_at': ('TIMESTAMP WITH TIME ZONE', 'NULL'),
        'evaluator_assessment_id': ('INTEGER', 'NULL'),
    }
    
    for col_name, (col_type, nullable) in columns_to_add.items():
        check_col_result = conn.execute(sa.text(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'assessment_360_evaluators' 
            AND column_name = '{col_name}'
        """))
        col_exists_in_db = check_col_result.fetchone() is not None
        
        if col_name not in columns or not col_exists_in_db:
            print(f"📝 Adding {col_name} column...")
            # ALWAYS drop and recreate to ensure clean state
            if col_exists_in_db:
                print(f"⚠️  {col_name} column exists in DB but may not be visible to asyncpg, dropping and recreating...")
                try:
                    conn.execute(sa.text(f"ALTER TABLE assessment_360_evaluators DROP COLUMN IF EXISTS {col_name} CASCADE"))
                    print(f"✅ Dropped existing {col_name} column")
                except Exception as e:
                    print(f"⚠️  Could not drop column (may not exist): {e}")
            
            # Add column using raw SQL
            conn.execute(sa.text(f"""
                ALTER TABLE assessment_360_evaluators 
                ADD COLUMN {col_name} {col_type}
            """))
            print(f"✅ Added {col_name} column")
            
            # Force commit
            conn.commit()
            print(f"✅ Committed {col_name} column addition")
            
            # Verify
            verify_col_result = conn.execute(sa.text(f"""
                SELECT column_name, data_type, udt_name, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'assessment_360_evaluators' 
                AND column_name = '{col_name}'
            """))
            verify_col_row = verify_col_result.fetchone()
            if verify_col_row:
                print(f"✅ Verified {col_name} column exists: {verify_col_row}")
            else:
                print(f"❌ ERROR: {col_name} column was not added successfully!")
                raise Exception(f"Failed to add {col_name} column")
            
            # Force PostgreSQL to notify all connections about schema change
            try:
                conn.execute(sa.text(f"NOTIFY schema_change, '{col_name}_added'"))
                print(f"✅ Sent NOTIFY to force schema cache reload for {col_name}")
            except Exception as e:
                print(f"⚠️  Could not send NOTIFY (non-critical): {e}")
        else:
            print(f"✅ {col_name} column already exists")
    
    # Add foreign key for evaluator_assessment_id if column was just added
    check_fk_result = conn.execute(sa.text("""
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'assessment_360_evaluators' 
        AND constraint_name = 'fk_assessment_360_evaluators_evaluator_assessment_id'
    """))
    fk_exists = check_fk_result.fetchone() is not None
    
    if 'evaluator_assessment_id' in columns or not fk_exists:
        print("📝 Adding foreign key constraint for evaluator_assessment_id...")
        try:
            # Drop existing FK if it exists
            conn.execute(sa.text("""
                ALTER TABLE assessment_360_evaluators 
                DROP CONSTRAINT IF EXISTS fk_assessment_360_evaluators_evaluator_assessment_id
            """))
            # Add FK using raw SQL
            conn.execute(sa.text("""
                ALTER TABLE assessment_360_evaluators 
                ADD CONSTRAINT fk_assessment_360_evaluators_evaluator_assessment_id
                FOREIGN KEY (evaluator_assessment_id) 
                REFERENCES assessments(id) 
                ON DELETE SET NULL
            """))
            conn.commit()
            print("✅ Added foreign key constraint")
        except Exception as e:
            print(f"⚠️  Could not add foreign key (may already exist): {e}")
    else:
        print("✅ Foreign key constraint already exists")


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
