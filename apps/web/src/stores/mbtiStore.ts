/**
 * MBTI Assessment Store
 * Manages state for MBTI personality assessment
 */

import { create } from 'zustand';
import { startAssessment, saveResponse, submitAssessment } from '@/lib/api/assessments';

interface MBTIAnswer {
  questionId: string;
  preference: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

interface MBTIState {
  assessmentId: number | null;
  currentQuestionIndex: number;
  answers: MBTIAnswer[];
  isLoading: boolean;
  error: string | null;

  // Actions
  startMBTIAssessment: () => Promise<void>;
  answerQuestion: (
    questionId: string,
    preference: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
  ) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitMBTI: () => Promise<void>;
  reset: () => void;
}

export const useMBTIStore = create<MBTIState>((set, get) => ({
  assessmentId: null,
  currentQuestionIndex: 0,
  answers: [],
  isLoading: false,
  error: null,

  startMBTIAssessment: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await startAssessment('MBTI');
      set({
        assessmentId: response.assessment_id,
        currentQuestionIndex: 0,
        answers: [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start assessment',
        isLoading: false,
      });
      throw error;
    }
  },

  answerQuestion: async (
    questionId: string,
    preference: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
  ) => {
    const { assessmentId, answers } = get();

    if (!assessmentId) {
      throw new Error('No active assessment');
    }

    try {
      set({ isLoading: true, error: null });

      // Save answer to backend
      await saveResponse(assessmentId, {
        question_id: questionId,
        answer_value: preference,
      });

      // Update local state
      const existingAnswerIndex = answers.findIndex((a) => a.questionId === questionId);
      let newAnswers: MBTIAnswer[];

      if (existingAnswerIndex >= 0) {
        // Update existing answer
        newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = { questionId, preference };
      } else {
        // Add new answer
        newAnswers = [...answers, { questionId, preference }];
      }

      set({ answers: newAnswers, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save answer',
        isLoading: false,
      });
      throw error;
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex } = get();
    set({ currentQuestionIndex: currentQuestionIndex + 1 });
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  submitMBTI: async () => {
    const { assessmentId, answers } = get();

    if (!assessmentId) {
      throw new Error('No active assessment');
    }

    if (answers.length < 40) {
      throw new Error('Please answer all questions before submitting');
    }

    try {
      set({ isLoading: true, error: null });
      await submitAssessment(assessmentId);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit assessment',
        isLoading: false,
      });
      throw error;
    }
  },

  reset: () => {
    set({
      assessmentId: null,
      currentQuestionIndex: 0,
      answers: [],
      isLoading: false,
      error: null,
    });
  },
}));
