"""add assessments tables

Revision ID: 029
Revises: 028
Create Date: 2025-12-31 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '029'
down_revision = '028'
branch_labels = None
depends_on = None


def upgrade():
    # Check if tables already exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    # Create enums if they don't exist
    try:
        enum_names = [e['name'] for e in inspector.get_enums()]
    except Exception:
        enum_names = []
    
    if 'assessmenttype' not in enum_names:
        op.execute("CREATE TYPE assessmenttype AS ENUM ('mbti', 'tki', 'wellness', '360_self', '360_evaluator')")
    
    if 'assessmentstatus' not in enum_names:
        op.execute("CREATE TYPE assessmentstatus AS ENUM ('not_started', 'in_progress', 'completed')")
    
    if 'evaluatorrole' not in enum_names:
        op.execute("CREATE TYPE evaluatorrole AS ENUM ('peer', 'manager', 'direct_report', 'stakeholder')")
    
    # Create assessments table (only if it doesn't exist)
    if 'assessments' not in tables:
        op.create_table(
            'assessments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('assessment_type', sa.Enum('mbti', 'tki', 'wellness', '360_self', '360_evaluator', name='assessmenttype'), nullable=False),
            sa.Column('status', sa.Enum('not_started', 'in_progress', 'completed', name='assessmentstatus'), nullable=False, server_default='not_started'),
            sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('raw_score', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('processed_score', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        
        # Create indexes for assessments
        op.create_index('idx_assessments_user_id', 'assessments', ['user_id'])
        op.create_index('idx_assessments_type', 'assessments', ['assessment_type'])
        op.create_index('idx_assessments_status', 'assessments', ['status'])
        op.create_index('idx_assessments_user_type', 'assessments', ['user_id', 'assessment_type'])
    else:
        # Table exists, check if columns exist and add them if missing
        columns = [col['name'] for col in inspector.get_columns('assessments')]
        
        if 'raw_score' not in columns:
            op.add_column('assessments', sa.Column('raw_score', postgresql.JSON(astext_type=sa.Text()), nullable=True))
        
        if 'processed_score' not in columns:
            op.add_column('assessments', sa.Column('processed_score', postgresql.JSON(astext_type=sa.Text()), nullable=True))
        
        print("⚠️  assessments table already exists, added missing columns if needed")
    
    # Create assessment_answers table (only if it doesn't exist)
    if 'assessment_answers' not in tables:
        op.create_table(
            'assessment_answers',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('assessment_id', sa.Integer(), nullable=False),
            sa.Column('question_id', sa.String(length=100), nullable=False),
            sa.Column('answer_value', sa.String(length=500), nullable=False),
            sa.Column('answered_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        
        # Create indexes for assessment_answers
        op.create_index('idx_assessment_answers_assessment_id', 'assessment_answers', ['assessment_id'])
        op.create_index('idx_assessment_answers_question_id', 'assessment_answers', ['question_id'])
    else:
        print("⚠️  assessment_answers table already exists, skipping creation")
    
    # Create assessment_360_evaluators table (only if it doesn't exist)
    if 'assessment_360_evaluators' not in tables:
        op.create_table(
            'assessment_360_evaluators',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('assessment_id', sa.Integer(), nullable=False),
            sa.Column('evaluator_name', sa.String(length=200), nullable=False),
            sa.Column('evaluator_email', sa.String(length=255), nullable=False),
            sa.Column('evaluator_role', sa.Enum('peer', 'manager', 'direct_report', 'stakeholder', name='evaluatorrole'), nullable=False),
            sa.Column('invitation_token', sa.String(length=100), nullable=False),
            sa.Column('invitation_sent_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('invitation_opened_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('status', sa.Enum('not_started', 'in_progress', 'completed', name='assessmentstatus'), nullable=False, server_default='not_started'),
            sa.Column('evaluator_assessment_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['evaluator_assessment_id'], ['assessments.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('invitation_token')
        )
        
        # Create indexes for assessment_360_evaluators
        op.create_index('idx_360_evaluators_assessment_id', 'assessment_360_evaluators', ['assessment_id'])
        op.create_index('idx_360_evaluators_email', 'assessment_360_evaluators', ['evaluator_email'])
        op.create_index('idx_360_evaluators_token', 'assessment_360_evaluators', ['invitation_token'])
    else:
        print("⚠️  assessment_360_evaluators table already exists, skipping creation")
    
    # Create assessment_results table (only if it doesn't exist)
    if 'assessment_results' not in tables:
        op.create_table(
            'assessment_results',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('assessment_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('scores', postgresql.JSON(astext_type=sa.Text()), nullable=False),
            sa.Column('insights', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('recommendations', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('comparison_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
            sa.Column('report_generated', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('report_url', sa.String(length=500), nullable=True),
            sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('assessment_id')
        )
        
        # Create indexes for assessment_results
        op.create_index('idx_assessment_results_assessment_id', 'assessment_results', ['assessment_id'])
        op.create_index('idx_assessment_results_user_id', 'assessment_results', ['user_id'])
    else:
        print("⚠️  assessment_results table already exists, skipping creation")


def downgrade():
    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_index('idx_assessment_results_user_id', table_name='assessment_results')
    op.drop_index('idx_assessment_results_assessment_id', table_name='assessment_results')
    op.drop_table('assessment_results')
    
    op.drop_index('idx_360_evaluators_token', table_name='assessment_360_evaluators')
    op.drop_index('idx_360_evaluators_email', table_name='assessment_360_evaluators')
    op.drop_index('idx_360_evaluators_assessment_id', table_name='assessment_360_evaluators')
    op.drop_table('assessment_360_evaluators')
    
    op.drop_index('idx_assessment_answers_question_id', table_name='assessment_answers')
    op.drop_index('idx_assessment_answers_assessment_id', table_name='assessment_answers')
    op.drop_table('assessment_answers')
    
    op.drop_index('idx_assessments_user_type', table_name='assessments')
    op.drop_index('idx_assessments_status', table_name='assessments')
    op.drop_index('idx_assessments_type', table_name='assessments')
    op.drop_index('idx_assessments_user_id', table_name='assessments')
    op.drop_table('assessments')
    
    # Drop enums (only if no other tables use them)
    op.execute("DROP TYPE IF EXISTS evaluatorrole")
    op.execute("DROP TYPE IF EXISTS assessmentstatus")
    op.execute("DROP TYPE IF EXISTS assessmenttype")
