-- Migration: Fix assessments marked as completed but with 0 answers
-- Created: 2026-01-04
-- Purpose: Fix assessments that are incorrectly marked as "completed" but have no answers

-- This migration corrects assessments that are incorrectly marked as "completed"
-- but have answer_count = 0 (no answers in assessment_answers table)
-- This can happen due to data inconsistencies or bugs in the submission process

-- Fix all assessments marked as completed but with 0 answers
-- Cast enum to text for comparison with string values
UPDATE assessments 
SET status = 'in_progress'::assessmentstatus,
    completed_at = NULL,
    updated_at = NOW()
WHERE status::text = 'completed' 
AND assessment_type IN ('360_self', 'tki', 'wellness')
AND NOT EXISTS (
    SELECT 1 
    FROM assessment_answers 
    WHERE assessment_answers.assessment_id = assessments.id
);

-- Also set status to 'in_progress' if it's 'not_started' but has answers (data inconsistency)
UPDATE assessments 
SET status = 'in_progress'::assessmentstatus,
    started_at = COALESCE(started_at, NOW()),
    updated_at = NOW()
WHERE status::text = 'not_started' 
AND assessment_type IN ('360_self', 'tki', 'wellness')
AND EXISTS (
    SELECT 1 
    FROM assessment_answers 
    WHERE assessment_answers.assessment_id = assessments.id
);
