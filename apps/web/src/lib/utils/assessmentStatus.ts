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
 * @returns Status d'affichage: 'completed' | 'in-progress' | 'available'
 */
export function determineAssessmentStatus(
  apiAssessment: {
    status: string;
    answer_count?: number;
    total_questions?: number;
  } | undefined
): 'completed' | 'in-progress' | 'available' {
  if (!apiAssessment) {
    return 'available';
  }

  // Normalize status: backend returns "not_started", "in_progress", "completed"
  // Handle variations: uppercase, lowercase, with/without underscores, with/without hyphens
  const rawStatus = String(apiAssessment.status);
  const statusNormalized = rawStatus.toLowerCase().trim().replace(/[_-]/g, '');

  // PRIMARY CHECK: If all answers are provided, it's completed (regardless of status)
  // This handles cases where status might not be updated correctly
  const hasAllAnswers = 
    apiAssessment.answer_count !== undefined && 
    apiAssessment.total_questions !== undefined &&
    apiAssessment.total_questions > 0 &&
    apiAssessment.answer_count >= apiAssessment.total_questions;

  if (hasAllAnswers) {
    return 'completed';
  }

  // SECONDARY CHECK: Check normalized status
  if (statusNormalized === 'completed' || statusNormalized === 'complete') {
    return 'completed';
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
