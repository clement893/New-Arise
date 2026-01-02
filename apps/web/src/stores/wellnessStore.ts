/**
 * Wellness Assessment Store
 * Zustand store for managing wellness assessment state with API integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assessmentsApi, AssessmentResult } from '@/lib/api/assessments';
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
  completeAssessment: () => void;
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
          const assessment = await assessmentsApi.start('wellness');
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
            console.error('Failed to save answer:', error);
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
          await assessmentsApi.submit(assessmentId);
          const results = await assessmentsApi.getResults(assessmentId);
          set({
            results,
            currentStep: 'congratulations',
            isCompleted: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage =
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : 'Failed to submit assessment';
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Complete assessment (for compatibility)
      completeAssessment: () => {
        const { submitAssessment } = get();
        submitAssessment();
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
