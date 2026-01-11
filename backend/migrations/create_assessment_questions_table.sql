-- Migration: Create assessment_questions table
-- Created: 2025-01-XX
-- Purpose: Store assessment questions in database for dynamic management

-- Create assessment_questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
    id SERIAL PRIMARY KEY,
    question_id VARCHAR(100) UNIQUE NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    
    -- Main question field (for Wellness and 360°)
    question TEXT,
    
    -- Wellness-specific fields
    pillar VARCHAR(200),
    
    -- TKI-specific fields
    number INTEGER,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    mode_a VARCHAR(50),
    mode_b VARCHAR(50),
    
    -- 360°-specific fields
    capability VARCHAR(100),
    
    -- Additional metadata (JSON)
    question_metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT assessment_questions_question_id_unique UNIQUE (question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_questions_question_id ON assessment_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_type ON assessment_questions(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_pillar ON assessment_questions(pillar) WHERE pillar IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assessment_questions_capability ON assessment_questions(capability) WHERE capability IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE assessment_questions IS 'Stores assessment questions for dynamic management via admin interface';
COMMENT ON COLUMN assessment_questions.question_id IS 'Unique identifier (e.g., wellness_q1, tki_1, 360_1)';
COMMENT ON COLUMN assessment_questions.assessment_type IS 'Type of assessment (wellness, tki, 360_self, 360_evaluator)';
COMMENT ON COLUMN assessment_questions.question IS 'Question text (for Wellness and 360°)';
COMMENT ON COLUMN assessment_questions.pillar IS 'Wellness pillar category';
COMMENT ON COLUMN assessment_questions.option_a IS 'TKI option A text';
COMMENT ON COLUMN assessment_questions.option_b IS 'TKI option B text';
COMMENT ON COLUMN assessment_questions.mode_a IS 'TKI mode A (competing, collaborating, etc.)';
COMMENT ON COLUMN assessment_questions.mode_b IS 'TKI mode B';
COMMENT ON COLUMN assessment_questions.capability IS '360° capability category';
COMMENT ON COLUMN assessment_questions.question_metadata IS 'Additional metadata in JSON format';
