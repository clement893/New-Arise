-- Migration: Fix assessment_results table schema
-- Created: 2025-01-27
-- Purpose: Add missing columns to match AssessmentResult model

-- Add user_id column (required by model)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE assessment_results 
        ADD COLUMN user_id INTEGER;
        
        -- Populate user_id from assessments table for existing records
        UPDATE assessment_results ar
        SET user_id = a.user_id
        FROM assessments a
        WHERE ar.assessment_id = a.id;
        
        -- Make it NOT NULL after populating
        ALTER TABLE assessment_results 
        ALTER COLUMN user_id SET NOT NULL;
        
        -- Add foreign key constraint
        ALTER TABLE assessment_results 
        ADD CONSTRAINT fk_assessment_results_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        -- Add index
        CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id 
        ON assessment_results(user_id);
    END IF;
END $$;

-- Rename result_data to scores if it exists, or add scores column
DO $$ 
BEGIN
    -- Check if result_data column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'result_data'
    ) THEN
        -- Check if scores column doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessment_results' AND column_name = 'scores'
        ) THEN
            -- Rename result_data to scores
            ALTER TABLE assessment_results 
            RENAME COLUMN result_data TO scores;
        ELSE
            -- Both exist, migrate data from result_data to scores and drop result_data
            UPDATE assessment_results 
            SET scores = result_data 
            WHERE scores IS NULL OR scores = 'null'::jsonb;
            
            ALTER TABLE assessment_results 
            DROP COLUMN result_data;
        END IF;
    ELSE
        -- result_data doesn't exist, add scores if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessment_results' AND column_name = 'scores'
        ) THEN
            ALTER TABLE assessment_results 
            ADD COLUMN scores JSONB NOT NULL DEFAULT '{}'::jsonb;
        END IF;
    END IF;
END $$;

-- Add insights column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'insights'
    ) THEN
        ALTER TABLE assessment_results 
        ADD COLUMN insights JSONB;
    END IF;
END $$;

-- Add recommendations column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'recommendations'
    ) THEN
        ALTER TABLE assessment_results 
        ADD COLUMN recommendations JSONB;
    END IF;
END $$;

-- Add comparison_data column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'comparison_data'
    ) THEN
        ALTER TABLE assessment_results 
        ADD COLUMN comparison_data JSONB;
    END IF;
END $$;

-- Add report_generated column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'report_generated'
    ) THEN
        ALTER TABLE assessment_results 
        ADD COLUMN report_generated BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add report_url column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'report_url'
    ) THEN
        ALTER TABLE assessment_results 
        ADD COLUMN report_url VARCHAR(500);
    END IF;
END $$;

-- Rename created_at to generated_at if needed, or add generated_at
DO $$ 
BEGIN
    -- Check if generated_at exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'generated_at'
    ) THEN
        -- Check if created_at exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessment_results' AND column_name = 'created_at'
        ) THEN
            -- Rename created_at to generated_at
            ALTER TABLE assessment_results 
            RENAME COLUMN created_at TO generated_at;
        ELSE
            -- Neither exists, add generated_at
            ALTER TABLE assessment_results 
            ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Ensure updated_at exists with timezone
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'updated_at'
    ) THEN
        -- Check if it has timezone
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessment_results' 
            AND column_name = 'updated_at' 
            AND data_type = 'timestamp with time zone'
        ) THEN
            -- Convert to timestamp with time zone
            ALTER TABLE assessment_results 
            ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE 
            USING updated_at::timestamp with time zone;
        END IF;
    ELSE
        -- Add updated_at if missing
        ALTER TABLE assessment_results 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Ensure generated_at has timezone
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_results' AND column_name = 'generated_at'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessment_results' 
            AND column_name = 'generated_at' 
            AND data_type = 'timestamp with time zone'
        ) THEN
            ALTER TABLE assessment_results 
            ALTER COLUMN generated_at TYPE TIMESTAMP WITH TIME ZONE 
            USING generated_at::timestamp with time zone;
        END IF;
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN assessment_results.user_id IS 'User who owns this assessment result';
COMMENT ON COLUMN assessment_results.scores IS 'Calculated scores (JSON format)';
COMMENT ON COLUMN assessment_results.insights IS 'Detailed interpretations (JSON format)';
COMMENT ON COLUMN assessment_results.recommendations IS 'Personalized recommendations (JSON format)';
