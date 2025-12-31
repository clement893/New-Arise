import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startAssessment, saveAnswer, submitAssessment } from '@/lib/api/assessments';
import axios from 'axios';

interface Feedback360Answer {
  questionId: string;
  value: number; // 1-5
}

interface Feedback360State {
  assessmentId: number | null;
  currentQuestion: number;
  answers: Record<string, number>;
  isLoading: boolean;
  error: string | null;

  // Actions
  startAssessment: () => Promise<void>;
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
        set({ isLoading: true, error: null });
        try {
          const response = await startAssessment('360_feedback');
          set({
            assessmentId: response.assessment_id,
            currentQuestion: 0,
            answers: {},
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error
            ? error.message
            : axios.isAxiosError(error) && error.response?.data?.detail
            ? error.response.data.detail
            : 'Failed to start assessment';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
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
          await saveAnswer(assessmentId, {
            question_id: questionId,
            answer_value: value.toString(),
          });
        } catch (error: unknown) {
          console.error('Failed to save answer:', error);
          // Don't throw - allow user to continue even if save fails
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
