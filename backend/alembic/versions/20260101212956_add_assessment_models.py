"""Add assessment models (TKI, Wellness, 360 Feedback)

Revision ID: $(date +%Y%m%d%H%M%S)
Revises: 
Create Date: 2026-01-01 21:30:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '$(date +%Y%m%d%H%M%S)'
down_revision = None  # Update this with the latest migration ID
branch_labels = None
depends_on = None


def upgrade():
    # Create assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_assessments_id', 'assessments', ['id'])
    op.create_index('ix_assessments_user_id', 'assessments', ['user_id'])
    op.create_index('ix_assessments_type', 'assessments', ['type'])
    
    # Create assessment_responses table
    op.create_table(
        'assessment_responses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.String(50), nullable=False),
        sa.Column('response_data', postgresql.JSONB(), nullable=False),
        sa.Column('answered_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_assessment_responses_id', 'assessment_responses', ['id'])
    op.create_index('ix_assessment_responses_assessment_id', 'assessment_responses', ['assessment_id'])
    
    # Create assessment_results table
    op.create_table(
        'assessment_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=False),
        sa.Column('scores', postgresql.JSONB(), nullable=False),
        sa.Column('insights', postgresql.JSONB(), nullable=True),
        sa.Column('recommendations', postgresql.JSONB(), nullable=True),
        sa.Column('comparison', postgresql.JSONB(), nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('assessment_id')
    )
    op.create_index('ix_assessment_results_id', 'assessment_results', ['id'])
    op.create_index('ix_assessment_results_assessment_id', 'assessment_results', ['assessment_id'])
    
    # Create evaluators table (for 360 Feedback)
    op.create_table(
        'evaluators',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('token', sa.String(255), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('invited_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('evaluator_assessment_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
        sa.ForeignKeyConstraint(['evaluator_assessment_id'], ['assessments.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    op.create_index('ix_evaluators_id', 'evaluators', ['id'])
    op.create_index('ix_evaluators_assessment_id', 'evaluators', ['assessment_id'])
    op.create_index('ix_evaluators_token', 'evaluators', ['token'])


def downgrade():
    op.drop_table('evaluators')
    op.drop_table('assessment_results')
    op.drop_table('assessment_responses')
    op.drop_table('assessments')
