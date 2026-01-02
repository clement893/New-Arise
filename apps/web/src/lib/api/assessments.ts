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

export type AssessmentType = 'wellness' | 'tki' | '360_self' | 'mbti';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed';

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
  answer_count?: number;
  total_questions?: number;
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
  assessment_type: string;
  scores: {
    total_score: number;
    max_score: number;
    percentage: number;
    pillar_scores?: Record<string, number | PillarScore>;
    mode_scores?: Record<string, number>;
    capability_scores?: Record<string, number | PillarScore>;
  };
  insights?: Record<string, any>;
  recommendations?: Record<string, any>;
  comparison_data?: Record<string, any>;
  generated_at: string;
}

/**
 * Start a new assessment
 */
export const startAssessment = async (
  assessmentType: AssessmentType
): Promise<StartAssessmentResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/assessments/start`,
    { assessment_type: assessmentType },
    { headers: getAuthHeaders() }
  );
  return response.data as StartAssessmentResponse;
};

/**
 * Save a response to an assessment question (NEW FORMAT)
 * @param assessmentId - ID of the assessment
 * @param questionId - ID of the question (e.g., "q1", "q2")
 * @param responseData - Response data object (format depends on assessment type)
 */
export const saveResponse = async (
  assessmentId: number,
  questionId: string,
  responseData: Record<string, any>
): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/api/v1/assessments/${assessmentId}/responses`,
    {
      question_id: questionId,
      response_data: responseData,
    },
    { headers: getAuthHeaders() }
  );
};

/**
 * Save an answer to an assessment question (LEGACY - kept for backward compatibility)
 * @deprecated Use saveResponse() instead
 */
export const saveAnswer = async (
  assessmentId: number,
  questionId: string,
  answerValue: string
): Promise<AssessmentAnswer> => {
  // Use new endpoint with legacy format
  await saveResponse(assessmentId, questionId, { value: answerValue });
  return {
    id: 0,
    assessment_id: assessmentId,
    question_id: questionId,
    answer_value: answerValue,
    created_at: new Date().toISOString(),
  };
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
  const response = await axios.get(`${API_BASE_URL}/api/v1/assessments/${assessmentId}/results`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get all assessments for the current user
 */
export const getMyAssessments = async (): Promise<Assessment[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/assessments/my-assessments`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get a specific assessment by ID
 */
export const getAssessment = async (assessmentId: number): Promise<Assessment> => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/assessments/${assessmentId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const assessmentsApi = {
  start: startAssessment,
  saveAnswer,
  saveResponse, // NEW
  submit: submitAssessment,
  getResults: getAssessmentResults,
  getMyAssessments,
  getAssessment,
};

export default assessmentsApi;
