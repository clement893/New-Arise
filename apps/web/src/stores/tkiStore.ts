/**
 * TKI Assessment Store
 * Manages state for TKI Conflict Style questionnaire
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startAssessment, saveAnswer, submitAssessment } from '@/lib/api/assessments';
import axios from 'axios';

interface TKIState {
  assessmentId: number | null;
  currentQuestion: number;
  answers: Record<string, string>; // question_id -> "A" or "B"
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  
  // Actions
  startAssessment: () => Promise<void>;
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
        set({ isLoading: true, error: null });
        try {
          const assessment = await startAssessment('TKI');
          set({ 
            assessmentId: assessment.assessment_id,
            isLoading: false,
            currentQuestion: 0,
            answers: {},
            isCompleted: false,
          });
        } catch (error: unknown) {
          const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
            ? error.response.data.detail
            : 'Failed to start assessment';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
        }
      },

      answerQuestion: async (questionId: string, answer: string) => {
        const { assessmentId } = get();
        if (!assessmentId) return;

        set({ isLoading: true, error: null });
        try {
          await saveAnswer(assessmentId, questionId, answer);
          set(state => ({
            answers: { ...state.answers, [questionId]: answer },
            isLoading: false,
          }));
        } catch (error: unknown) {
          const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
            ? error.response.data.detail
            : 'Failed to save answer';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
        }
      },

      nextQuestion: () => {
        set(state => ({
          currentQuestion: Math.min(state.currentQuestion + 1, 29), // 0-29 for 30 questions
        }));
      },

      previousQuestion: () => {
        set(state => ({
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
          const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
            ? error.response.data.detail
            : 'Failed to submit assessment';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'tki-assessment-storage',
    }
  )
);
