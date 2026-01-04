-- Script SQL pour corriger le statut de l'assessment 70
-- Ce script vérifie l'état actuel et corrige le statut si nécessaire

-- 1. Vérifier l'état actuel de l'assessment 70
SELECT 
    id,
    assessment_type,
    status,
    created_at,
    completed_at,
    (SELECT COUNT(*) FROM assessment_answers WHERE assessment_id = 70) as answer_count,
    (SELECT COUNT(*) FROM assessment_results WHERE assessment_id = 70) as results_count
FROM assessments
WHERE id = 70;

-- 2. Vérifier combien de réponses existent
SELECT COUNT(*) as total_answers
FROM assessment_answers
WHERE assessment_id = 70;

-- 3. Vérifier si les résultats existent
SELECT COUNT(*) as results_exist
FROM assessment_results
WHERE assessment_id = 70;

-- 4. Corriger le statut si nécessaire
-- Si l'assessment est "completed" mais qu'il n'y a pas de résultats, le remettre en "in_progress"
UPDATE assessments 
SET status = 'in_progress',
    completed_at = NULL
WHERE id = 70 
AND status = 'completed' 
AND NOT EXISTS (
    SELECT 1 FROM assessment_results WHERE assessment_id = 70
);

-- 5. Vérifier le résultat après correction
SELECT 
    id,
    assessment_type,
    status,
    created_at,
    completed_at
FROM assessments
WHERE id = 70;
