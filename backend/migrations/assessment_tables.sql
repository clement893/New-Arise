-- Migration: Add assessment models
-- Created: 2025-12-31
-- Fixed: Use INTEGER for user_id to match users table

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create assessment_answers table
CREATE TABLE IF NOT EXISTS assessment_answers (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    answer_value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(assessment_id, question_id)
);

-- Create assessment_360_evaluators table
CREATE TABLE IF NOT EXISTS assessment_360_evaluators (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    evaluator_email VARCHAR(255) NOT NULL,
    evaluator_name VARCHAR(255),
    invitation_sent_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    result_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(assessment_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_360_evaluators_assessment_id ON assessment_360_evaluators(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);

-- Add comments for documentation
COMMENT ON TABLE assessments IS 'Stores user assessments (Wellness, TKI, 360 Feedback, MBTI)';
COMMENT ON TABLE assessment_answers IS 'Stores individual answers to assessment questions';
COMMENT ON TABLE assessment_360_evaluators IS 'Stores 360 feedback evaluators and their invitation status';
COMMENT ON TABLE assessment_results IS 'Stores calculated results for completed assessments';
