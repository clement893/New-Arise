import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveAnswer, submitAssessment, getAssessmentAnswers } from '@/lib/api/assessments';
import axios from 'axios';

interface Feedback360State {
  assessmentId: number | null;
  currentQuestion: number;
  answers: Record<string, number>;
  isLoading: boolean;
  error: string | null;

  // Actions
  startAssessment: () => Promise<void>;
  loadExistingAnswers: (assessmentId: number) => Promise<void>;
  setAnswer: (questionId: string, value: number) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitAssessment: () => Promise<void>;
  reset: () => void;
  getProgress: () => number;
}

const initialState = {
  assessmentId: null,
  currentQuestion: 0,
  answers: {},
  isLoading: false,
  error: null,
};

export const useFeedback360Store = create<Feedback360State>()(
  persist(
    (set, get) => ({
      ...initialState,

      startAssessment: async () => {
        // 360° feedback assessments should be created via /360/start endpoint, not /start
        // This method should not be called directly - redirect to start page instead
        throw new Error(
          '360° feedback assessments must be started via /dashboard/assessments/360-feedback/start page. ' +
          'Please use the start page to invite evaluators first.'
        );
      },

      setAnswer: async (questionId: string, value: number) => {
        const { assessmentId, answers } = get();

        if (!assessmentId) {
          throw new Error('No active assessment');
        }

        // Update local state immediately
        set({
          answers: {
            ...answers,
            [questionId]: value,
          },
        });

        // Save to backend
        try {
          await saveAnswer(assessmentId, questionId, value.toString());
        } catch (error: unknown) {
          // Don't throw - allow user to continue even if save fails
          // Only log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to save answer:', error);
          }
        }
      },

      nextQuestion: () => {
        const { currentQuestion } = get();
        if (currentQuestion < 29) {
          set({ currentQuestion: currentQuestion + 1 });
        }
      },

      previousQuestion: () => {
        const { currentQuestion } = get();
        if (currentQuestion > 0) {
          set({ currentQuestion: currentQuestion - 1 });
        }
      },

      submitAssessment: async () => {
        const { assessmentId } = get();

        if (!assessmentId) {
          throw new Error('No active assessment');
        }

        set({ isLoading: true, error: null });

        try {
          await submitAssessment(assessmentId);
          set({ isLoading: false });
          // Don't reset - keep data for results page
        } catch (error: unknown) {
          const errorMessage = error instanceof Error
            ? error.message
            : axios.isAxiosError(error) && error.response?.data?.detail
            ? error.response.data.detail
            : 'Failed to submit assessment';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      reset: () => {
        set(initialState);
      },

      getProgress: () => {
        const { answers } = get();
        const answeredCount = Object.keys(answers).length;
        return Math.round((answeredCount / 30) * 100);
      },
    }),
    {
      name: 'feedback360-storage',
      partialize: (state) => ({
        assessmentId: state.assessmentId,
        currentQuestion: state.currentQuestion,
        answers: state.answers,
      }),
    }
  )
);
