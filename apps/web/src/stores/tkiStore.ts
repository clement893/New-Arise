/**
 * TKI Assessment Store
 * Manages state for TKI Conflict Style questionnaire
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startAssessment, submitAssessment, saveResponse, getAssessmentAnswers } from '@/lib/api/assessments';
import axios from 'axios';
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
          const errorMessage = extractErrorMessage(error, 'Failed to start assessment');
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
          
          // Convert answer values to strings (TKI uses "A" or "B")
          const answers: Record<string, string> = {};
          Object.entries(existingAnswers).forEach(([questionId, answerValue]) => {
            answers[questionId] = String(answerValue);
          });

          // Find the first unanswered question
          const { tkiQuestions } = await import('@/data/tkiQuestions');
          let firstUnansweredIndex = 0;
          for (let i = 0; i < tkiQuestions.length; i++) {
            const question = tkiQuestions[i];
            if (!question) continue;
            if (!answers[question.id]) {
              firstUnansweredIndex = i;
              break;
            }
            // If all questions are answered, stay at the last question
            if (i === tkiQuestions.length - 1) {
              firstUnansweredIndex = i;
            }
          }

          set({
            assessmentId,
            answers,
            currentQuestion: firstUnansweredIndex,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = extractErrorMessage(error, 'Failed to load existing answers');
          set({
            error: errorMessage,
            isLoading: false,
          });
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
    }
  )
);
