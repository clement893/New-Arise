/**
 * Assessment Status Utility
 * 
 * Provides consistent logic for determining assessment display status
 * based on backend status and answer counts.
 */

/**
 * Détermine le status d'affichage d'un assessment basé sur le status backend et les réponses
 * 
 * @param apiAssessment - Assessment depuis l'API (peut être undefined)
 * @param assessmentType - Type d'assessment (pour gérer les cas spéciaux comme MBTI)
 * @returns Status d'affichage: 'completed' | 'in-progress' | 'available'
 */
export function determineAssessmentStatus(
  apiAssessment: {
    status: string;
    answer_count?: number;
    total_questions?: number;
  } | undefined,
  assessmentType?: 'MBTI' | 'TKI' | 'WELLNESS' | 'THREE_SIXTY_SELF'
): 'completed' | 'in-progress' | 'available' {
  if (!apiAssessment) {
    return 'available';
  }

  // Normalize status: backend returns "not_started", "in_progress", "completed"
  // Handle variations: uppercase, lowercase, with/without underscores, with/without hyphens
  const rawStatus = String(apiAssessment.status);
  const statusNormalized = rawStatus.toLowerCase().trim().replace(/[_-]/g, '');

  // SPECIAL CASE: MBTI is external assessment (no internal questions)
  // Only check backend status, ignore answer_count
  if (assessmentType === 'MBTI') {
    if (statusNormalized === 'completed' || statusNormalized === 'complete') {
      return 'completed';
    }
    // For MBTI, if status is not completed, it's available (no "in-progress" state)
    return 'available';
  }

  // PRIMARY CHECK: If all answers are provided, it's completed (regardless of status)
  // This handles cases where status might not be updated correctly
  // Only check if total_questions > 0 (excludes MBTI and other external assessments)
  // CRITICAL: Use strict equality (===) instead of >= to ensure exact match
  // This prevents marking as completed if answer_count is greater than total_questions (data corruption)
  const hasAllAnswers = 
    apiAssessment.answer_count !== undefined && 
    apiAssessment.total_questions !== undefined &&
    apiAssessment.total_questions > 0 &&
    apiAssessment.answer_count === apiAssessment.total_questions;

  if (hasAllAnswers) {
    return 'completed';
  }

  // SECONDARY CHECK: Check normalized status
  // CRITICAL: Only trust "completed" status if ALL questions are answered (answer_count === total_questions)
  // This prevents false positives where status is "completed" but not all questions are answered
  if (statusNormalized === 'completed' || statusNormalized === 'complete') {
    // For assessments with questions, verify ALL questions are answered
    if (apiAssessment.total_questions !== undefined && apiAssessment.total_questions > 0) {
      // CRITICAL: Use strict equality (===) to ensure ALL questions are answered
      // If total_questions > 0, we need ALL answers to trust "completed" status
      // Also check that answer_count is not 0 or undefined (assessment not started)
      const answerCount = apiAssessment.answer_count ?? 0; // Default to 0 if undefined
      if (answerCount === apiAssessment.total_questions && answerCount > 0) {
        return 'completed';
      }
      // Status says completed but not all questions are answered OR answer_count is 0
      // This is a data inconsistency - treat as available if not started (answer_count === 0)
      // or in-progress if partially started (answer_count > 0)
      if (answerCount === 0) {
        // Assessment marked as completed but has 0 answers - treat as available (not started)
        return 'available';
      }
      // Status says completed but answer_count < total_questions - might be in-progress
      // Fall through to check other conditions
    } else {
      // For assessments without questions (like MBTI, already handled above)
      // Trust the status
      return 'completed';
    }
  }

  // Handle NOT_STARTED: if there are answers, it's actually in progress
  // This handles cases where assessment was started but status wasn't updated
  if (statusNormalized === 'notstarted' || statusNormalized === 'notstarted') {
    if (apiAssessment.answer_count !== undefined && apiAssessment.answer_count > 0) {
      return 'in-progress';
    }
    return 'available';
  }

  // Handle IN_PROGRESS
  if (statusNormalized === 'inprogress' || statusNormalized === 'inprogress') {
    return 'in-progress';
  }

  // FALLBACK: If there are some answers, it's in progress
  // This handles unknown status values but with existing answers
  if (apiAssessment.answer_count !== undefined && apiAssessment.answer_count > 0) {
    return 'in-progress';
  }

  // Default: no assessment or no answers
  return 'available';
}
