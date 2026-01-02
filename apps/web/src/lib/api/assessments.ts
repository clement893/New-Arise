/**
 * Assessments API Service
 * Frontend service for ARISE assessments
 */

import axios from 'axios';
import { apiClient } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  answer_count?: number;
  total_questions?: number;
  score_summary?: Record<string, any>; // Summary of scores from processed_score
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
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const startAssessment = async (assessmentType: AssessmentType): Promise<StartAssessmentResponse> => {
  const response = await apiClient.post(
    `/v1/assessments/start`,
    { assessment_type: assessmentType }
  );
  return response.data as StartAssessmentResponse;
};

/**
 * Save an answer to an assessment question
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const saveAnswer = async (
  assessmentId: number,
  questionId: string,
  answerValue: string
): Promise<AssessmentAnswer> => {
  const response = await apiClient.post(
    `/v1/assessments/${assessmentId}/answer`,
    {
      question_id: questionId,
      answer_value: answerValue,
    }
  );
  return response.data;
};

/**
 * Save a response to an assessment question (flexible format)
 * Accepts either:
 * - (assessmentId, { question_id, answer_value })
 * - (assessmentId, questionId, answerValue)
 * - (assessmentId, questionId, { answer_value, ...extraData })
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const saveResponse = async (
  assessmentId: number,
  questionIdOrData: string | { question_id: string; answer_value: string },
  answerValueOrData?: string | Record<string, any>
): Promise<AssessmentAnswer> => {
  let requestBody: { question_id: string; answer_value: string };

  // Handle different call signatures
  if (typeof questionIdOrData === 'object') {
    // Format: saveResponse(assessmentId, { question_id, answer_value })
    requestBody = questionIdOrData;
  } else if (typeof answerValueOrData === 'string') {
    // Format: saveResponse(assessmentId, questionId, answerValue)
    requestBody = {
      question_id: questionIdOrData,
      answer_value: answerValueOrData,
    };
  } else if (answerValueOrData && typeof answerValueOrData === 'object') {
    // Format: saveResponse(assessmentId, questionId, { answer_value, ...extraData })
    // Extract answer_value from the object, ignore other fields
    const answerValue = answerValueOrData.answer_value || 
                       answerValueOrData.selected_mode || 
                       answerValueOrData.score || 
                       String(Object.values(answerValueOrData)[0] || '');
    requestBody = {
      question_id: questionIdOrData,
      answer_value: String(answerValue),
    };
  } else {
    throw new Error('Invalid arguments to saveResponse');
  }

  const response = await apiClient.post(
    `/v1/assessments/${assessmentId}/answer`,
    requestBody
  );
  return response.data;
};

/**
 * Submit an assessment for scoring
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const submitAssessment = async (assessmentId: number): Promise<Assessment> => {
  const response = await apiClient.post(
    `/v1/assessments/${assessmentId}/submit`,
    {}
  );
  return response.data;
};

/**
 * Get assessment results
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getAssessmentResults = async (assessmentId: number): Promise<AssessmentResult> => {
  const response = await apiClient.get(
    `/v1/assessments/${assessmentId}/results`
  );
  return response.data;
};

/**
 * Get all assessments for the current user
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getMyAssessments = async (): Promise<Assessment[]> => {
  const response = await apiClient.get(
    `/v1/assessments/my-assessments`
  );
  return response.data;
};

/**
 * Get a specific assessment by ID
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getAssessment = async (assessmentId: number): Promise<Assessment> => {
  const response = await apiClient.get(
    `/v1/assessments/${assessmentId}`
  );
  return response.data;
};

/**
 * 360° Feedback specific types and functions
 */
export interface Evaluator360Data {
  name: string;
  email: string;
  role: 'PEER' | 'MANAGER' | 'DIRECT_REPORT' | 'STAKEHOLDER';
}

export interface Start360FeedbackResponse {
  assessment_id: number;
  message: string;
  evaluators: Evaluator360Data[];
}

export interface EvaluatorStatus {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  invitation_token: string;
  invitation_sent_at: string | null;
  invitation_opened_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface EvaluatorsResponse {
  assessment_id: number;
  evaluators: EvaluatorStatus[];
}

export interface EvaluatorAssessmentInfo {
  evaluator_id: number;
  evaluator_name: string;
  evaluator_email: string;
  evaluator_role: string;
  status: string;
  assessment_id: number | null;
  user_being_evaluated: {
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Start a 360° feedback assessment with evaluators
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const start360Feedback = async (evaluators: Evaluator360Data[]): Promise<Start360FeedbackResponse> => {
  const response = await apiClient.post(
    `/v1/assessments/360/start`,
    { evaluators }
  );
  return response.data;
};

/**
 * Get evaluators status for a 360 assessment
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const get360Evaluators = async (assessmentId: number): Promise<EvaluatorsResponse> => {
  const response = await apiClient.get(
    `/v1/assessments/${assessmentId}/360/evaluators`
  );
  return response.data;
};

/**
 * Get evaluator assessment by token (public endpoint)
 */
export const getEvaluatorAssessment = async (token: string): Promise<EvaluatorAssessmentInfo> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/assessments/360-evaluator/${token}`
  );
  return response.data;
};

/**
 * Submit evaluator assessment (public endpoint - requires token in URL)
 */
export const submitEvaluatorAssessment = async (
  token: string,
  answers: Array<{ question_id: string; answer_value: string }>
): Promise<{ message: string; assessment_id: number; status: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/assessments/360-evaluator/${token}/submit`,
    answers
  );
  return response.data;
};

/**
 * Invite additional evaluators to an existing 360 assessment
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const invite360Evaluators = async (
  assessmentId: number,
  evaluators: Evaluator360Data[]
): Promise<{ message: string; evaluators: Evaluator360Data[] }> => {
  const response = await apiClient.post(
    `/v1/assessments/${assessmentId}/360/invite-evaluators`,
    { evaluators }
  );
  return response.data;
};

export const assessmentsApi = {
  start: startAssessment,
  saveAnswer,
  saveResponse,
  submit: submitAssessment,
  getResults: getAssessmentResults,
  getMyAssessments,
  getAssessment,
};

export default assessmentsApi;
