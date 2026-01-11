"""add assessment_questions table

Revision ID: 035
Revises: 034
Create Date: 2025-01-XX 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '035'
down_revision = '034'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    # Create assessment_questions table (only if it doesn't exist)
    if 'assessment_questions' not in tables:
        print("📝 Creating assessment_questions table...")
        op.create_table(
            'assessment_questions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('question_id', sa.String(length=100), nullable=False),
            sa.Column('assessment_type', sa.String(length=50), nullable=False),
            
            # Main question field (for Wellness and 360°)
            sa.Column('question', sa.Text(), nullable=True),
            
            # Wellness-specific fields
            sa.Column('pillar', sa.String(length=200), nullable=True),
            
            # TKI-specific fields
            sa.Column('number', sa.Integer(), nullable=True),
            sa.Column('option_a', sa.String(length=500), nullable=True),
            sa.Column('option_b', sa.String(length=500), nullable=True),
            sa.Column('mode_a', sa.String(length=50), nullable=True),
            sa.Column('mode_b', sa.String(length=50), nullable=True),
            
            # 360°-specific fields
            sa.Column('capability', sa.String(length=100), nullable=True),
            
            # Additional metadata (JSON)
            sa.Column('question_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            
            # Timestamps
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('question_id', name='assessment_questions_question_id_unique')
        )
        
        # Create indexes for better performance
        op.create_index('idx_assessment_questions_question_id', 'assessment_questions', ['question_id'])
        op.create_index('idx_assessment_questions_assessment_type', 'assessment_questions', ['assessment_type'])
        op.create_index('idx_assessment_questions_pillar', 'assessment_questions', ['pillar'], postgresql_where=sa.text('pillar IS NOT NULL'))
        op.create_index('idx_assessment_questions_capability', 'assessment_questions', ['capability'], postgresql_where=sa.text('capability IS NOT NULL'))
        
        print("✅ Created assessment_questions table with indexes")
    else:
        print("⚠️  assessment_questions table already exists, skipping creation")


def downgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'assessment_questions' in tables:
        print("📝 Dropping assessment_questions table...")
        # Drop indexes first
        op.drop_index('idx_assessment_questions_capability', table_name='assessment_questions', if_exists=True)
        op.drop_index('idx_assessment_questions_pillar', table_name='assessment_questions', if_exists=True)
        op.drop_index('idx_assessment_questions_assessment_type', table_name='assessment_questions', if_exists=True)
        op.drop_index('idx_assessment_questions_question_id', table_name='assessment_questions', if_exists=True)
        
        # Drop table
        op.drop_table('assessment_questions')
        print("✅ Dropped assessment_questions table")
