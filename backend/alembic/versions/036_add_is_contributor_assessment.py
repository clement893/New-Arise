"""add is_contributor_assessment to assessments

Revision ID: 036
Revises: 035
Create Date: 2026-01-22 18:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '036'
down_revision = '035'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if assessments table exists
    tables = inspector.get_table_names()
    if 'assessments' not in tables:
        print("⚠️  assessments table does not exist, skipping")
        return
    
    # Check if is_contributor_assessment column already exists
    columns = [col['name'] for col in inspector.get_columns('assessments')]
    
    if 'is_contributor_assessment' not in columns:
        print("📝 Adding is_contributor_assessment column to assessments...")
        
        # Check if column exists in database directly
        check_result = conn.execute(sa.text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'assessments' 
            AND column_name = 'is_contributor_assessment'
        """))
        column_exists_in_db = check_result.fetchone() is not None
        
        if not column_exists_in_db:
            # Add the column as nullable with default False
            conn.execute(sa.text("""
                ALTER TABLE assessments 
                ADD COLUMN is_contributor_assessment BOOLEAN NOT NULL DEFAULT FALSE
            """))
            print("✅ Added is_contributor_assessment column with default FALSE")
            
            # Mark existing evaluator assessments as contributor assessments
            # These are assessments linked via evaluator_assessment_id in assessment_360_evaluators
            conn.execute(sa.text("""
                UPDATE assessments 
                SET is_contributor_assessment = TRUE
                WHERE id IN (
                    SELECT evaluator_assessment_id 
                    FROM assessment_360_evaluators 
                    WHERE evaluator_assessment_id IS NOT NULL
                )
            """))
            print("✅ Marked existing evaluator assessments as contributor assessments")
            
            # Verify column was added
            verify_result = conn.execute(sa.text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'assessments' 
                AND column_name = 'is_contributor_assessment'
            """))
            verify_row = verify_result.fetchone()
            if verify_row:
                print(f"✅ Verified is_contributor_assessment column exists: {verify_row}")
            else:
                print("❌ ERROR: is_contributor_assessment column was not added successfully!")
                raise Exception("Failed to add is_contributor_assessment column")
        else:
            print("✅ is_contributor_assessment column already exists in database")
    else:
        print("✅ is_contributor_assessment column already exists")


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if assessments table exists
    tables = inspector.get_table_names()
    if 'assessments' not in tables:
        return
    
    # Check if is_contributor_assessment column exists
    columns = [col['name'] for col in inspector.get_columns('assessments')]
    
    if 'is_contributor_assessment' in columns:
        print("📝 Dropping is_contributor_assessment column from assessments...")
        conn.execute(sa.text("ALTER TABLE assessments DROP COLUMN is_contributor_assessment"))
        print("✅ Dropped is_contributor_assessment column")
