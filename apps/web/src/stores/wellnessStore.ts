import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WellnessAnswer {
  questionId: string;
  value: number;
}

interface WellnessState {
  answers: Record<string, number>;
  currentQuestionIndex: number;
  isCompleted: boolean;
  
  // Actions
  setAnswer: (questionId: string, value: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  getProgress: () => number;
}

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      answers: {},
      currentQuestionIndex: 0,
      isCompleted: false,

      setAnswer: (questionId: string, value: number) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
        }));
      },

      nextQuestion: () => {
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        }));
      },

      previousQuestion: () => {
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        }));
      },

      goToQuestion: (index: number) => {
        set({ currentQuestionIndex: index });
      },

      completeAssessment: () => {
        set({ isCompleted: true });
      },

      resetAssessment: () => {
        set({
          answers: {},
          currentQuestionIndex: 0,
          isCompleted: false,
        });
      },

      getProgress: () => {
        const state = get();
        const totalQuestions = 15; // Total number of wellness questions
        const answeredQuestions = Object.keys(state.answers).length;
        return Math.round((answeredQuestions / totalQuestions) * 100);
      },
    }),
    {
      name: 'wellness-assessment',
    }
  )
);
