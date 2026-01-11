-- Migration: Fix assessment 70 status
-- Created: 2026-01-04
-- Purpose: Fix assessment 70 status if it's marked as completed but has no results

-- This migration corrects assessments that are incorrectly marked as "completed"
-- but don't have corresponding results in the assessment_results table
-- This can happen if an assessment was marked as completed but never submitted

-- Fix assessment 70 specifically (if it exists and has the issue)
-- Cast enum to text for comparison with string values
UPDATE assessments 
SET status = 'in_progress'::assessmentstatus,
    completed_at = NULL,
    updated_at = NOW()
WHERE id = 70 
AND status::text = 'completed' 
AND NOT EXISTS (
    SELECT 1 FROM assessment_results WHERE assessment_id = 70
);

-- Also fix any other assessments with the same issue (preventive fix)
UPDATE assessments 
SET status = 'in_progress'::assessmentstatus,
    completed_at = NULL,
    updated_at = NOW()
WHERE status::text = 'completed' 
AND assessment_type IN ('360_self', 'tki', 'wellness')
AND NOT EXISTS (
    SELECT 1 FROM assessment_results WHERE assessment_id = assessments.id
);
