/**
 * TKI Assessment Store
 * Manages state for TKI Conflict Style questionnaire
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startAssessment, saveAnswer, submitAssessment, saveResponse } from '@/lib/api/assessments';
import axios from 'axios';

// Helper function to extract error message from various error formats
// Always returns a string to prevent React error #31 (objects as children)
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;

    // Handle string detail
    if (typeof data.detail === 'string') {
      return data.detail;
    }

    // Handle array of validation errors (FastAPI format: [{type, loc, msg, input, ctx}])
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((err: any) => {
          if (typeof err === 'string') return err;
          if (err && typeof err === 'object') {
            if (typeof err.msg === 'string') {
              // Format: "field.path: message" if loc exists, otherwise just message
              if (Array.isArray(err.loc) && err.loc.length > 0) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg;
            }
            // Fallback: stringify the error object
            return JSON.stringify(err);
          }
          return String(err);
        })
        .join(', ');
    }

    // Handle object detail (could be a single validation error object)
    if (data.detail && typeof data.detail === 'object' && !Array.isArray(data.detail)) {
      // FastAPI validation error object format: {type, loc, msg, input, ctx}
      if (typeof data.detail.msg === 'string') {
        if (Array.isArray(data.detail.loc) && data.detail.loc.length > 0) {
          return `${data.detail.loc.join('.')}: ${data.detail.msg}`;
        }
        return data.detail.msg;
      }
      if (typeof data.detail.message === 'string') {
        return data.detail.message;
      }
      // If it's an object but we can't extract a message, stringify it
      return JSON.stringify(data.detail);
    }

    // Handle message field at root level
    if (typeof data.message === 'string') {
      return data.message;
    }

    // Handle error field at root level
    if (data.error && typeof data.error === 'object') {
      if (typeof data.error.message === 'string') {
        return data.error.message;
      }
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Handle objects that might be validation errors
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.msg === 'string') {
      return errObj.msg;
    }
    if (typeof errObj.message === 'string') {
      return errObj.message;
    }
    // Last resort: stringify the object
    try {
      return JSON.stringify(error);
    } catch {
      return defaultMessage;
    }
  }

  // Ensure we always return a string
  return String(error || defaultMessage);
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
          const assessment = await startAssessment('tki');
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

      answerQuestion: async (questionId: string, answer: string) => {
        const { assessmentId } = get();
        if (!assessmentId) return;

        set({ isLoading: true, error: null });
        try {
          // Save with new format: selected_mode
          await saveResponse(assessmentId, questionId, { selected_mode: answer });
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
