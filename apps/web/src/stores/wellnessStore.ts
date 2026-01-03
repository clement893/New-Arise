/**
 * Wellness Assessment Store
 * Zustand store for managing wellness assessment state with API integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assessmentsApi, AssessmentResult, getAssessmentAnswers } from '@/lib/api/assessments';
import axios from 'axios';

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
          const errorMessage =
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : 'Failed to start assessment';
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
          const existingAnswers = await getAssessmentAnswers(assessmentId);
          
          // Convert answer values to numbers (wellness uses 1-5 scale)
          const answers: Record<string, number> = {};
          Object.entries(existingAnswers).forEach(([questionId, answerValue]) => {
            const numValue = parseInt(answerValue, 10);
            if (!isNaN(numValue)) {
              answers[questionId] = numValue;
            }
          });

          // Find the first unanswered question
          // Import wellnessQuestions to check which questions exist
          const { wellnessQuestions } = await import('@/data/wellnessQuestionsReal');
          let firstUnansweredIndex = 0;
          for (let i = 0; i < wellnessQuestions.length; i++) {
            const question = wellnessQuestions[i];
            if (!question) continue;
            if (!answers[question.id]) {
              firstUnansweredIndex = i;
              break;
            }
            // If all questions are answered, stay at the last question
            if (i === wellnessQuestions.length - 1) {
              firstUnansweredIndex = i;
            }
          }

          set({
            assessmentId,
            answers,
            currentQuestionIndex: firstUnansweredIndex,
            currentStep: 'questions',
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage =
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : 'Failed to load existing answers';
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
          } catch (error: unknown) {
            // Error is handled and displayed to user via error state
            // Only log in development for debugging
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to save answer:', error);
            }
            const errorMessage =
              axios.isAxiosError(error) && error.response?.data?.message
                ? error.response.data.message
                : 'Failed to save answer';
            set({
              error: errorMessage,
            });
          }
        }
      },

      // Submit assessment for scoring
      submitAssessment: async () => {
        const { assessmentId } = get();

        if (!assessmentId) {
          set({ error: 'No active assessment' });
          return;
        }

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
          }
          
          const errorMessage =
            axios.isAxiosError(error) && error.response?.data?.detail
              ? error.response.data.detail
              : axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : 'Failed to submit assessment';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Complete assessment (for compatibility)
      completeAssessment: async () => {
        const { assessmentId, submitAssessment } = get();
        
        if (!assessmentId) {
          set({ error: 'No active assessment' });
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
          console.warn('Failed to check assessment status:', err);
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
    }
  )
);
