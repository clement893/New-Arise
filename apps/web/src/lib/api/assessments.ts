/**
 * Assessments API Service
 * Frontend service for ARISE assessments
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios to include auth token
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
};

export type AssessmentType = 'WELLNESS' | 'TKI' | 'THREE_SIXTY_SELF' | 'MBTI';
export type AssessmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface StartAssessmentResponse {
  assessment_id: number;
  status: AssessmentStatus;
  message: string;
}

export interface Assessment {
  id: number;
  user_id: number;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  id: number;
  assessment_id: number;
  question_id: string;
  answer_value: string;
  created_at: string;
}

export interface PillarScore {
  score: number;
  max: number;
  percentage: number;
}

export interface AssessmentResult {
  id: number;
  assessment_id: number;
  result_data: {
    total_score: number;
    max_score: number;
    percentage: number;
    pillar_scores?: Record<string, number | PillarScore>;
    mode_scores?: Record<string, number>;
    capability_scores?: Record<string, number>;
  };
  created_at: string;
}

/**
 * Start a new assessment
 */
export const startAssessment = async (assessmentType: AssessmentType): Promise<StartAssessmentResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/assessments/start`,
    { assessment_type: assessmentType },
    { headers: getAuthHeaders() }
  );
  return response.data as StartAssessmentResponse;
};

/**
 * Save an answer to an assessment question
 */
export const saveAnswer = async (
  assessmentId: number,
  questionId: string,
  answerValue: string
): Promise<AssessmentAnswer> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/assessments/${assessmentId}/answer`,
    {
      question_id: questionId,
      answer_value: answerValue,
    },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Submit an assessment for scoring
 */
export const submitAssessment = async (assessmentId: number): Promise<Assessment> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/assessments/${assessmentId}/submit`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get assessment results
 */
export const getAssessmentResults = async (assessmentId: number): Promise<AssessmentResult> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/assessments/${assessmentId}/results`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all assessments for the current user
 */
export const getMyAssessments = async (): Promise<Assessment[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/assessments/my-assessments`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get a specific assessment by ID
 */
export const getAssessment = async (assessmentId: number): Promise<Assessment> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/assessments/${assessmentId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const assessmentsApi = {
  start: startAssessment,
  saveAnswer,
  submit: submitAssessment,
  getResults: getAssessmentResults,
  getMyAssessments,
  getAssessment,
};

export default assessmentsApi;
