import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveAnswer, submitAssessment, getAssessmentAnswers } from '@/lib/api/assessments';
import { formatError } from '@/lib/utils/formatError';

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

      // Load existing answers and navigate to last unanswered question
      loadExistingAnswers: async (assessmentId: number) => {
        set({ isLoading: true, error: null });
        try {
          const existingAnswers = await getAssessmentAnswers(assessmentId);
          
          // Convert answer values to numbers (360° uses 1-5 scale)
          const answers: Record<string, number> = {};
          Object.entries(existingAnswers).forEach(([questionId, answerValue]) => {
            const numValue = parseInt(answerValue, 10);
            if (!isNaN(numValue)) {
              answers[questionId] = numValue;
            }
          });

          // Find the first unanswered question
          const { feedback360Questions } = await import('@/data/feedback360Questions');
          let firstUnansweredIndex = 0;
          for (let i = 0; i < feedback360Questions.length; i++) {
            const question = feedback360Questions[i];
            if (!question) continue;
            if (!answers[question.id]) {
              firstUnansweredIndex = i;
              break;
            }
            // If all questions are answered, stay at the last question
            if (i === feedback360Questions.length - 1) {
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
          // Don't throw - allow user to continue even if load fails
          // Only log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            const errorMessage = formatError(error);
            console.error('Failed to load existing answers:', errorMessage);
          }
          set({
            isLoading: false,
          });
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
          await saveAnswer(assessmentId, questionId, value.toString());
        } catch (error: unknown) {
          // Don't throw - allow user to continue even if save fails
          // Only log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            const errorMessage = formatError(error);
            console.error('Failed to save answer:', errorMessage);
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
          // Convert error to string to prevent React error #130
          const errorMessage = formatError(error);
          console.error('[360-Feedback] Failed to submit assessment:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
          // Re-throw as a new Error with the formatted message
          throw new Error(errorMessage);
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
      // Ensure error is always a string when restoring from localStorage
      // This prevents React error #130 if corrupted data is restored
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure error is always a string, never an object
          if (state.error && typeof state.error !== 'string') {
            console.warn('[Feedback360 Store] Invalid error type restored from localStorage, converting to string:', state.error);
            state.error = formatError(state.error);
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
                console.warn('[Feedback360 Store] Invalid answer value type:', { key, value, type: typeof value });
              }
            });
            state.answers = cleanedAnswers;
          }
        }
      },
    }
  )
);
