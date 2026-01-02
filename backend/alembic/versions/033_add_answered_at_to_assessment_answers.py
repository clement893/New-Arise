"""add answered_at to assessment_answers

Revision ID: 033
Revises: 032
Create Date: 2026-01-02 17:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '033'
down_revision = '032'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if assessment_answers table exists
    tables = inspector.get_table_names()
    if 'assessment_answers' not in tables:
        print("⚠️  assessment_answers table does not exist, skipping")
        return
    
    # Check if answered_at column already exists
    columns = [col['name'] for col in inspector.get_columns('assessment_answers')]
    
    if 'answered_at' not in columns:
        print("📝 Adding answered_at column to assessment_answers...")
        
        # Check if column exists in database directly
        check_result = conn.execute(sa.text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'assessment_answers' 
            AND column_name = 'answered_at'
        """))
        column_exists_in_db = check_result.fetchone() is not None
        
        if not column_exists_in_db:
            # Add the column as nullable first
            conn.execute(sa.text("""
                ALTER TABLE assessment_answers 
                ADD COLUMN answered_at TIMESTAMP WITH TIME ZONE NULL
            """))
            print("✅ Added answered_at column as nullable")
            
            # Update existing rows with current timestamp
            conn.execute(sa.text("""
                UPDATE assessment_answers 
                SET answered_at = COALESCE(created_at, NOW()) 
                WHERE answered_at IS NULL
            """))
            print("✅ Updated existing rows with default timestamp")
            
            # Make it NOT NULL with default
            conn.execute(sa.text("""
                ALTER TABLE assessment_answers 
                ALTER COLUMN answered_at SET NOT NULL,
                ALTER COLUMN answered_at SET DEFAULT NOW()
            """))
            print("✅ Set answered_at column to NOT NULL with default NOW()")
            
            # Verify column was added
            verify_result = conn.execute(sa.text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'assessment_answers' 
                AND column_name = 'answered_at'
            """))
            verify_row = verify_result.fetchone()
            if verify_row:
                print(f"✅ Verified answered_at column exists: {verify_row}")
            else:
                print("❌ ERROR: answered_at column was not added successfully!")
                raise Exception("Failed to add answered_at column")
        else:
            print("✅ answered_at column already exists in database")
    else:
        print("✅ answered_at column already exists")


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if assessment_answers table exists
    tables = inspector.get_table_names()
    if 'assessment_answers' not in tables:
        return
    
    # Check if answered_at column exists
    columns = [col['name'] for col in inspector.get_columns('assessment_answers')]
    
    if 'answered_at' in columns:
        print("📝 Dropping answered_at column from assessment_answers...")
        conn.execute(sa.text("ALTER TABLE assessment_answers DROP COLUMN answered_at"))
        print("✅ Dropped answered_at column")
