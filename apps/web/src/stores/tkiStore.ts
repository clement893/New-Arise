/**
 * TKI Assessment Store
 * Manages state for TKI Conflict Style questionnaire
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startAssessment, submitAssessment, saveResponse, getAssessmentAnswers, getAssessment } from '@/lib/api/assessments';
import { formatError } from '@/lib/utils/formatError';

// Helper function to extract error message from various error formats
// Always returns a string to prevent React error #130 (objects as children)
// NOTE: This function now uses formatError() for consistent error handling
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  // Use formatError for consistent error handling
  const formatted = formatError(error);
  // If formatError returns the default "unexpected error" message, use the provided defaultMessage
  return formatted !== 'An unexpected error occurred.' ? formatted : defaultMessage;
}

interface TKIState {
  assessmentId: number | null;
  currentQuestion: number;
  answers: Record<string, string>; // question_id -> "A" or "B"
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;

  // Actions
  startAssessment: () => Promise<void>;
  loadExistingAnswers: (assessmentId: number) => Promise<void>;
  answerQuestion: (questionId: string, answer: string) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitAssessment: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  assessmentId: null,
  currentQuestion: 0,
  answers: {},
  isLoading: false,
  error: null,
  isCompleted: false,
};

export const useTKIStore = create<TKIState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startAssessment: async () => {
        set({ isLoading: true, error: null, isCompleted: false }); // Always reset isCompleted when starting
        try {
          const assessment = await startAssessment('TKI');
          set({
            assessmentId: assessment.assessment_id,
            isLoading: false,
            currentQuestion: 0,
            answers: {},
            isCompleted: false, // New assessment is never completed
          });
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, 'Failed to start assessment');
          set({
            error: errorMessage,
            isLoading: false,
            isCompleted: false, // Reset on error
          });
        }
      },

      // Load existing answers and navigate to last unanswered question
      loadExistingAnswers: async (assessmentId: number) => {
        set({ isLoading: true, error: null, isCompleted: false }); // Always reset isCompleted to false when loading
        try {
          // Get assessment status from API to check if it's actually completed
          let assessmentStatus: string | undefined;
          let isNotFound = false;
          try {
            const assessment = await getAssessment(assessmentId);
            assessmentStatus = assessment.status;
          } catch (err: unknown) {
            // Check if it's a 404 error (assessment not found)
            const error = err as { response?: { status?: number } };
            if (error?.response?.status === 404) {
              isNotFound = true;
              console.warn('[TKI Store] Assessment not found (404), resetting...', assessmentId);
            } else {
              // If we can't get assessment status for other reasons, continue with loading answers
              console.warn('[TKI Store] Could not fetch assessment status, continuing...', err);
            }
          }

          // If assessment doesn't exist, reset state and throw error to let page handle it
          if (isNotFound) {
            set({
              assessmentId: null,
              answers: {},
              currentQuestion: 0,
              isLoading: false,
              isCompleted: false,
              error: 'Assessment not found',
            });
            throw new Error('Assessment not found');
          }

          const existingAnswers = await getAssessmentAnswers(assessmentId);
          
          // Convert answer values to strings (TKI uses "A" or "B")
          const answers: Record<string, string> = {};
          Object.entries(existingAnswers).forEach(([questionId, answerValue]) => {
            answers[questionId] = String(answerValue);
          });

          // Find the first unanswered question
          const { tkiQuestions } = await import('@/data/tkiQuestions');
          let firstUnansweredIndex = 0;
          let allQuestionsAnswered = true;
          for (let i = 0; i < tkiQuestions.length; i++) {
            const question = tkiQuestions[i];
            if (!question) continue;
            if (!answers[question.id]) {
              firstUnansweredIndex = i;
              allQuestionsAnswered = false;
              break;
            }
            // If all questions are answered, stay at the last question
            if (i === tkiQuestions.length - 1) {
              firstUnansweredIndex = i;
            }
          }

          // Only mark as completed if:
          // 1. All questions are answered AND
          // 2. Assessment status is "completed" or "COMPLETED" in the API
          const isActuallyCompleted = allQuestionsAnswered && 
            (assessmentStatus === 'completed' || assessmentStatus === 'COMPLETED');

          set({
            assessmentId,
            answers,
            currentQuestion: firstUnansweredIndex,
            isLoading: false,
            isCompleted: isActuallyCompleted,
          });
        } catch (error: unknown) {
          // Check if it's a 404 error from getAssessmentAnswers
          const err = error as { response?: { status?: number }; message?: string };
          const isNotFound = err?.response?.status === 404 || err?.message === 'Assessment not found';
          
          if (isNotFound) {
            // Assessment doesn't exist, reset state
            set({
              assessmentId: null,
              answers: {},
              currentQuestion: 0,
              isLoading: false,
              isCompleted: false,
              error: null, // Don't show error, just reset
            });
          } else {
            const errorMessage = extractErrorMessage(error, 'Failed to load existing answers');
            set({
              error: errorMessage,
              isLoading: false,
              isCompleted: false, // Reset on error
            });
          }
        }
      },

      answerQuestion: async (questionId: string, answer: string) => {
        const { assessmentId } = get();
        if (!assessmentId) return;

        set({ isLoading: true, error: null });
        try {
          // Save answer - backend expects answer_value as string
          await saveResponse(assessmentId, {
            question_id: questionId,
            answer_value: answer,
          });
          set((state) => ({
            answers: { ...state.answers, [questionId]: answer },
            isLoading: false,
          }));
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, 'Failed to save answer');
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      nextQuestion: () => {
        set((state) => ({
          currentQuestion: Math.min(state.currentQuestion + 1, 29), // 0-29 for 30 questions
        }));
      },

      previousQuestion: () => {
        set((state) => ({
          currentQuestion: Math.max(state.currentQuestion - 1, 0),
        }));
      },

      submitAssessment: async () => {
        const { assessmentId } = get();
        if (!assessmentId) return;

        set({ isLoading: true, error: null });
        try {
          await submitAssessment(assessmentId);
          set({
            isCompleted: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, 'Failed to submit assessment');
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'tki-assessment-storage',
      // Ensure error is always a string when restoring from localStorage
      // This prevents React error #130 if corrupted data is restored
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure error is always a string, never an object
          if (state.error && typeof state.error !== 'string') {
            console.warn('[TKI Store] Invalid error type restored from localStorage, converting to string:', state.error);
            state.error = extractErrorMessage(state.error, 'An error occurred');
          }
          // Ensure answers values are strings ("A" or "B"), not objects
          if (state.answers) {
            const cleanedAnswers: Record<string, string> = {};
            Object.entries(state.answers).forEach(([key, value]) => {
              if (typeof value === 'string') {
                cleanedAnswers[key] = value;
              } else {
                const strValue = String(value);
                if (strValue === 'A' || strValue === 'B') {
                  cleanedAnswers[key] = strValue;
                } else {
                  console.warn('[TKI Store] Invalid answer value type:', { key, value, type: typeof value });
                }
              }
            });
            state.answers = cleanedAnswers;
          }
        }
      },
    }
  )
);
