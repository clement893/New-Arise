/**
 * Wellness Assessment Store
 * Zustand store for managing wellness assessment state with API integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assessmentsApi, AssessmentResult, getAssessmentAnswers } from '@/lib/api/assessments';
import axios from 'axios';
import { formatError } from '@/lib/utils/formatError';

export type WellnessStep = 'intro' | 'questions' | 'congratulations';

interface WellnessState {
  // Assessment data
  assessmentId: number | null;
  currentStep: WellnessStep;
  currentQuestionIndex: number;
  answers: Record<string, number>;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Results
  results: AssessmentResult | null;

  // Actions
  startAssessment: () => Promise<void>;
  loadExistingAnswers: (assessmentId: number) => Promise<void>;
  setCurrentStep: (step: WellnessStep) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  setAnswer: (questionId: string, value: number) => Promise<void>;
  submitAssessment: () => Promise<void>;
  resetAssessment: () => void;

  // Computed
  getProgress: () => number;
  getTotalQuestions: () => number;
  isCompleted: boolean;
  completeAssessment: () => Promise<void>;
}

const TOTAL_QUESTIONS = 30;

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      // Initial state
      assessmentId: null,
      currentStep: 'intro',
      currentQuestionIndex: 0,
      answers: {},
      isLoading: false,
      error: null,
      results: null,
      isCompleted: false,

      // Start a new assessment
      startAssessment: async () => {
        set({ isLoading: true, error: null });
        try {
          const assessment = await assessmentsApi.start('WELLNESS');
          set({
            assessmentId: assessment.assessment_id,
            currentStep: 'questions',
            currentQuestionIndex: 0,
            answers: {},
            isLoading: false,
            isCompleted: false,
          });
        } catch (error: unknown) {
          // Convert error to string to prevent React error #130
          const errorMessage = formatError(error);
          console.error('[Wellness] Failed to start assessment:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Load existing answers and navigate to last unanswered question
      loadExistingAnswers: async (assessmentId: number) => {
        set({ isLoading: true, error: null });
        try {
          const { answers: existingLocalAnswers, currentQuestionIndex: currentIndex } = get();
          
          // Helper function to find first unanswered question index
          const findFirstUnansweredIndex = (answersToCheck: Record<string, number>): number => {
            const { wellnessQuestions } = require('@/data/wellnessQuestionsReal');
            for (let i = 0; i < wellnessQuestions.length; i++) {
              const question = wellnessQuestions[i];
              if (!question) continue;
              if (!answersToCheck[question.id]) {
                return i;
              }
            }
            // If all questions are answered, stay at the last question
            return wellnessQuestions.length - 1;
          };

          // If we have local answers, use them to find the first unanswered question
          // but also merge with backend answers to ensure consistency
          let answers: Record<string, number> = { ...existingLocalAnswers };
          
          try {
            // Always try to load from backend to merge with local answers
            const existingAnswers = await getAssessmentAnswers(assessmentId);
            
            // Convert answer values to numbers (wellness uses 1-5 scale)
            Object.entries(existingAnswers).forEach(([questionId, answerValue]) => {
              const numValue = parseInt(answerValue, 10);
              if (!isNaN(numValue)) {
                // Merge: backend answers take precedence (they're the source of truth)
                answers[questionId] = numValue;
              }
            });

            console.log(`[Wellness] Loaded ${Object.keys(existingAnswers).length} answers from backend for assessment ${assessmentId}`);
            console.log(`[Wellness] Total answers (local + backend): ${Object.keys(answers).length}`);
          } catch (error: unknown) {
            // If backend load fails but we have local answers, use them
            console.warn('[Wellness] Failed to load from backend, using local answers:', error);
            if (Object.keys(existingLocalAnswers).length === 0) {
              // No local answers either, re-throw the error
              throw error;
            }
          }

          // Find the first unanswered question based on merged answers
          const { wellnessQuestions } = await import('@/data/wellnessQuestionsReal');
          const firstUnansweredIndex = findFirstUnansweredIndex(answers);

          console.log(`[Wellness] First unanswered question index: ${firstUnansweredIndex} (out of ${wellnessQuestions.length} total)`);
          console.log(`[Wellness] Current question index before update: ${currentIndex}`);

          set({
            assessmentId,
            answers,
            currentQuestionIndex: firstUnansweredIndex,
            currentStep: 'questions',
            isLoading: false,
          });

          console.log(`[Wellness] Updated currentQuestionIndex to: ${firstUnansweredIndex}`);
        } catch (error: unknown) {
          // Convert error to string to prevent React error #130
          const errorMessage = formatError(error);
          console.error('[Wellness] Failed to load existing answers:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Set current step
      setCurrentStep: (step) => set({ currentStep: step }),

      // Navigate to next question
      nextQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      // Navigate to previous question
      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      // Go to specific question
      goToQuestion: (index: number) => {
        if (index >= 0 && index < TOTAL_QUESTIONS) {
          set({ currentQuestionIndex: index });
        }
      },

      // Save an answer
      setAnswer: async (questionId: string, value: number) => {
        const { assessmentId, answers } = get();

        // Update local state immediately for better UX
        set({ answers: { ...answers, [questionId]: value } });

        // Save to backend if assessment is started
        if (assessmentId) {
          try {
            // Save answer - backend expects answer_value as string
            await assessmentsApi.saveResponse(assessmentId, {
              question_id: questionId,
              answer_value: String(value),
            });
            // Log success in development
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Wellness] Answer saved successfully: ${questionId} = ${value}`);
            }
          } catch (error: unknown) {
            // Convert error to string to prevent React error #130
            const errorMessage = formatError(error);
            // ALWAYS log errors, even in production, for debugging
            // Use JSON.stringify to prevent React error #130 from console.error
            console.error('[Wellness] Failed to save answer:', JSON.stringify({
              questionId,
              value,
              assessmentId,
              error: errorMessage,
              axiosError: axios.isAxiosError(error) ? {
                status: error.response?.status,
                data: error.response?.data,
              } : null,
            }));
            set({
              error: errorMessage,
            });
            // Re-throw to allow caller to handle (but as a new Error with the formatted message)
            throw new Error(errorMessage);
          }
        } else {
          // Log warning if assessmentId is missing
          console.warn('[Wellness] Cannot save answer: assessmentId is null', {
            questionId,
            value,
          });
          set({
            error: 'Assessment not started. Please start the assessment first.',
          });
          throw new Error('Assessment not started');
        }
      },

      // Submit assessment for scoring
      submitAssessment: async () => {
        const { assessmentId, answers } = get();

        if (!assessmentId) {
          set({ error: 'No active assessment' });
          return;
        }

        // Validation: Check if we have any answers before submitting
        const answerCount = Object.keys(answers).length;
        if (answerCount === 0) {
          const error = 'Cannot submit assessment: No answers provided. Please complete at least one question before submitting.';
          console.error('[Wellness]', error);
          set({ 
            error, 
            isLoading: false,
            // Reset corrupted state
            isCompleted: false,
          });
          return;
        }

        console.log(`[Wellness] Submitting assessment ${assessmentId} with ${answerCount} answers`);
        set({ isLoading: true, error: null });

        try {
          // First, check if assessment is already completed
          const assessments = await assessmentsApi.getMyAssessments();
          const currentAssessment = assessments.find(a => a.id === assessmentId);
          
          if (currentAssessment?.status === 'COMPLETED') {
            // Assessment is already completed, get results and mark as completed
            try {
              const results = await assessmentsApi.getResults(assessmentId);
              set({
                results,
                currentStep: 'congratulations',
                isCompleted: true,
                isLoading: false,
              });
              return;
            } catch (err) {
              // If we can't get results, still mark as completed
              set({
                isCompleted: true,
                isLoading: false,
              });
              return;
            }
          }

          await assessmentsApi.submit(assessmentId);
          const results = await assessmentsApi.getResults(assessmentId);
          set({
            results,
            currentStep: 'congratulations',
            isCompleted: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          // If assessment is already completed (400 error), treat as success
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            const errorDetail = error.response?.data?.detail || '';
            if (errorDetail.includes('already been completed') || errorDetail.includes('already completed')) {
              // Assessment is already completed, get results
              try {
                const results = await assessmentsApi.getResults(assessmentId);
                set({
                  results,
                  currentStep: 'congratulations',
                  isCompleted: true,
                  isLoading: false,
                });
                return;
              } catch (err) {
                // If we can't get results, still mark as completed
                set({
                  isCompleted: true,
                  isLoading: false,
                });
                return;
              }
            }
            // Check if error is due to no answers - reset corrupted state
            if (errorDetail.includes('No answers provided') || errorDetail.includes('no answers')) {
              console.error('[Wellness] Assessment has no answers, resetting corrupted state');
              set({
                error: 'Assessment has no saved answers. Please start over.',
                isLoading: false,
                isCompleted: false,
                // Keep assessmentId to allow user to continue
              });
              return;
            }
          }
          
          // Convert error to string to prevent React error #130
          const errorMessage = formatError(error);
          console.error('[Wellness] Failed to submit assessment:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Complete assessment (for compatibility)
      completeAssessment: async () => {
        const { assessmentId, answers, submitAssessment } = get();
        
        if (!assessmentId) {
          set({ error: 'No active assessment' });
          return;
        }

        // Validation: Check if we have any answers before completing
        const answerCount = Object.keys(answers).length;
        if (answerCount === 0) {
          const error = 'Cannot complete assessment: No answers provided. Please complete at least one question before submitting.';
          console.error('[Wellness]', error);
          set({ 
            error, 
            isLoading: false,
            // Reset corrupted state
            isCompleted: false,
          });
          return;
        }

        // Check if assessment is already completed before submitting
        try {
          const assessments = await assessmentsApi.getMyAssessments();
          const currentAssessment = assessments.find(a => a.id === assessmentId);
          
          if (currentAssessment?.status === 'COMPLETED') {
            // Assessment is already completed, get results and mark as completed
            try {
              const results = await assessmentsApi.getResults(assessmentId);
              set({
                results,
                currentStep: 'congratulations',
                isCompleted: true,
                isLoading: false,
              });
              return;
            } catch (err) {
              // If we can't get results, still mark as completed
              set({
                isCompleted: true,
                isLoading: false,
              });
              return;
            }
          }
        } catch (err) {
          // If we can't check status, proceed with submission
          // Convert error to string to prevent React error #130
          const errMessage = formatError(err);
          console.warn('[Wellness] Failed to check assessment status:', errMessage);
        }

        // If not completed, proceed with submission
        await submitAssessment();
      },

      // Reset the store
      resetAssessment: () =>
        set({
          assessmentId: null,
          currentStep: 'intro',
          currentQuestionIndex: 0,
          answers: {},
          isLoading: false,
          error: null,
          results: null,
          isCompleted: false,
        }),

      // Get progress percentage
      getProgress: () => {
        const { answers } = get();
        return Math.round((Object.keys(answers).length / TOTAL_QUESTIONS) * 100);
      },

      // Get total number of questions
      getTotalQuestions: () => TOTAL_QUESTIONS,
    }),
    {
      name: 'wellness-assessment',
      partialize: (state) => ({
        assessmentId: state.assessmentId,
        currentStep: state.currentStep,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        isCompleted: state.isCompleted,
      }),
      // Ensure error is always a string when restoring from localStorage
      // This prevents React error #130 if corrupted data is restored
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure error is always a string, never an object
          if (state.error && typeof state.error !== 'string') {
            console.warn('[Wellness Store] Invalid error type restored from localStorage, converting to string:', state.error);
            state.error = formatError(state.error);
          }
          // Ensure results is null (don't persist complex objects)
          if (state.results !== null) {
            console.warn('[Wellness Store] Results object found in restored state, clearing it');
            state.results = null;
          }
          // Ensure answers values are numbers, not objects
          if (state.answers) {
            const cleanedAnswers: Record<string, number> = {};
            Object.entries(state.answers).forEach(([key, value]) => {
              if (typeof value === 'number') {
                cleanedAnswers[key] = value;
              } else if (typeof value === 'string') {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                  cleanedAnswers[key] = numValue;
                }
              } else {
                console.warn('[Wellness Store] Invalid answer value type:', { key, value, type: typeof value });
              }
            });
            state.answers = cleanedAnswers;
          }
        }
      },
    }
  )
);
