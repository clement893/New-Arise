/**
 * Assessments API Service
 * Frontend service for ARISE assessments
 */

import axios from 'axios';
import { apiClient } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type AssessmentType = 'WELLNESS' | 'TKI' | 'THREE_SIXTY_SELF' | 'MBTI';
// Backend returns lowercase with underscores: "completed", "in_progress", "not_started"
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Convert frontend AssessmentType to backend format (lowercase)
 * Backend expects: 'mbti', 'tki', 'wellness', '360_self', '360_evaluator'
 */
function convertAssessmentTypeForBackend(type: AssessmentType): string {
  const mapping: Record<AssessmentType, string> = {
    'MBTI': 'mbti',
    'TKI': 'tki',
    'WELLNESS': 'wellness',
    'THREE_SIXTY_SELF': '360_self',
  };
  return mapping[type] || type.toLowerCase();
}

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
    // MBTI-specific fields
    mbti_type?: string;
    dimension_preferences?: Record<string, any>;
    // Source field for tracking result origin (e.g., 'pdf_ocr')
    source?: string;
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
  // Convert to backend format (lowercase)
  const backendType = convertAssessmentTypeForBackend(assessmentType);
  
  // Always log conversion for debugging (even in production to help diagnose issues)
  console.log('[startAssessment] Converting assessment type:', {
    frontend: assessmentType,
    backend: backendType,
    payload: { assessment_type: backendType }
  });
  
  const response = await apiClient.post(
    `/v1/assessments/start`,
    { assessment_type: backendType }
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
  
  // CRITICAL: Ensure all numeric values in scores are actually numbers, not objects
  // This prevents React error #130 (objects not valid as React child)
  const data = response.data;
  if (data?.scores) {
    // Ensure percentage, total_score, max_score are numbers
    if (data.scores.percentage !== undefined && typeof data.scores.percentage !== 'number') {
      data.scores.percentage = typeof data.scores.percentage === 'string' 
        ? parseFloat(data.scores.percentage) 
        : (typeof data.scores.percentage === 'object' && data.scores.percentage !== null && 'value' in data.scores.percentage)
        ? (typeof data.scores.percentage.value === 'number' ? data.scores.percentage.value : 0)
        : 0;
    }
    if (data.scores.total_score !== undefined && typeof data.scores.total_score !== 'number') {
      data.scores.total_score = typeof data.scores.total_score === 'string'
        ? parseInt(data.scores.total_score, 10)
        : (typeof data.scores.total_score === 'object' && data.scores.total_score !== null && 'value' in data.scores.total_score)
        ? (typeof data.scores.total_score.value === 'number' ? data.scores.total_score.value : 0)
        : 0;
    }
    if (data.scores.max_score !== undefined && typeof data.scores.max_score !== 'number') {
      data.scores.max_score = typeof data.scores.max_score === 'string'
        ? parseInt(data.scores.max_score, 10)
        : (typeof data.scores.max_score === 'object' && data.scores.max_score !== null && 'value' in data.scores.max_score)
        ? (typeof data.scores.max_score.value === 'number' ? data.scores.max_score.value : 150)
        : 150;
    }
    
    // Ensure pillar_scores values are numbers or PillarScore objects, not other objects
    if (data.scores.pillar_scores && typeof data.scores.pillar_scores === 'object') {
      const cleanedPillarScores: Record<string, number | PillarScore> = {};
      Object.entries(data.scores.pillar_scores).forEach(([key, value]) => {
        if (typeof value === 'number') {
          cleanedPillarScores[key] = value;
        } else if (typeof value === 'object' && value !== null && 'score' in value) {
          // It's a PillarScore object, ensure score and percentage are numbers
          const pillarScore = value as PillarScore;
          if (typeof pillarScore.score !== 'number') {
            pillarScore.score = typeof pillarScore.score === 'string' ? parseFloat(pillarScore.score) : 0;
          }
          if (typeof pillarScore.percentage !== 'number') {
            pillarScore.percentage = typeof pillarScore.percentage === 'string' ? parseFloat(pillarScore.percentage) : 0;
          }
          cleanedPillarScores[key] = pillarScore;
        } else if (typeof value === 'string') {
          cleanedPillarScores[key] = parseFloat(value) || 0;
        } else {
          console.warn('[API] Invalid pillar_score value type:', { key, value, type: typeof value });
          cleanedPillarScores[key] = 0;
        }
      });
      data.scores.pillar_scores = cleanedPillarScores;
    }
  }
  
  return data;
};

/**
 * Convert backend assessment type (lowercase) to frontend AssessmentType (uppercase)
 */
function convertAssessmentTypeFromBackend(backendType: string): AssessmentType {
  const mapping: Record<string, AssessmentType> = {
    'mbti': 'MBTI',
    'tki': 'TKI',
    'wellness': 'WELLNESS',
    '360_self': 'THREE_SIXTY_SELF',
  };
  return mapping[backendType.toLowerCase()] || backendType.toUpperCase() as AssessmentType;
}

/**
 * Get all assessments for the current user
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 * Converts backend assessment_type (lowercase) to frontend format (uppercase)
 */
export const getMyAssessments = async (): Promise<Assessment[]> => {
  const response = await apiClient.get(
    `/v1/assessments/my-assessments`
  );
  
  // Convert assessment_type from backend format (lowercase) to frontend format (uppercase)
  const assessments = Array.isArray(response.data) ? response.data.map((assessment: any) => ({
    ...assessment,
    assessment_type: convertAssessmentTypeFromBackend(assessment.assessment_type)
  })) : response.data;
  
  return assessments;
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
 * Get all answers for a specific assessment
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getAssessmentAnswers = async (assessmentId: number): Promise<Record<string, string>> => {
  const response = await apiClient.get(
    `/v1/assessments/${assessmentId}/answers`
  );
  return response.data.answers || {};
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

/**
 * Remove an evaluator from a 360 assessment
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const remove360Evaluator = async (
  assessmentId: number,
  evaluatorId: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete(
    `/v1/assessments/${assessmentId}/evaluators/${evaluatorId}`
  );
  return response.data;
};

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
 * Get development goals count from all assessments
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getDevelopmentGoalsCount = async (): Promise<{ count: number; user_id: number }> => {
  const response = await apiClient.get(
    `/v1/assessments/stats/development-goals-count`
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
    { answers }
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

/**
 * Upload MBTI PDF and extract results using OCR
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const uploadMBTIPDF = async (file: File): Promise<{ assessment_id: number; mbti_type: string; scores: any; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    `/v1/assessments/mbti/upload-pdf`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120 seconds timeout for OCR processing (can take time)
    }
  );
  
  return response.data;
};

/**
 * Upload MBTI PDF from 16Personalities profile URL and extract results using OCR
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const uploadMBTIPDFFromURL = async (profileUrl: string): Promise<{ assessment_id: number; mbti_type: string; scores: any; message: string }> => {
  const formData = new FormData();
  formData.append('profile_url', profileUrl);

  const response = await apiClient.post(
    `/v1/assessments/mbti/upload-pdf`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 180 seconds timeout (URL download + OCR can take longer)
    }
  );
  
  return response.data;
};

/**
 * Delete all assessments for the current user (superadmin only)
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const deleteAllMyAssessments = async (): Promise<{ message: string; deleted_count: number }> => {
  const response = await apiClient.delete(
    `/v1/assessments/my-assessments/all`
  );
  return response.data;
};

/**
 * Assessment Question types
 */
export interface AssessmentQuestion {
  id: number;
  question_id: string;
  assessment_type: string;
  question?: string;
  pillar?: string;
  number?: number;
  option_a?: string;
  option_b?: string;
  mode_a?: string;
  mode_b?: string;
  capability?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestionCreate {
  question_id: string;
  assessment_type: string;
  question?: string;
  pillar?: string;
  number?: number;
  option_a?: string;
  option_b?: string;
  mode_a?: string;
  mode_b?: string;
  capability?: string;
  metadata?: Record<string, any>;
}

export interface AssessmentQuestionUpdate {
  question?: string;
  pillar?: string;
  number?: number;
  option_a?: string;
  option_b?: string;
  mode_a?: string;
  mode_b?: string;
  capability?: string;
  metadata?: Record<string, any>;
}

/**
 * Get questions for a specific assessment type
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getQuestions = async (assessmentType?: string): Promise<AssessmentQuestion[]> => {
  const params = assessmentType ? { assessment_type: assessmentType } : {};
  const response = await apiClient.get(
    `/v1/assessments/questions`,
    { params }
  );
  return response.data;
};

/**
 * Get a specific question by question_id
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 */
export const getQuestion = async (questionId: string): Promise<AssessmentQuestion> => {
  const response = await apiClient.get(
    `/v1/assessments/questions/${questionId}`
  );
  return response.data;
};

/**
 * Create a new question
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 * @param questionData - The question data to create
 * @returns The created question
 */
export const createQuestion = async (questionData: AssessmentQuestionCreate): Promise<AssessmentQuestion> => {
  const response = await apiClient.post(
    `/v1/assessments/questions`,
    questionData
  );
  return response.data;
};

/**
 * Update a question
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 * @param questionId - The ID of the question to update
 * @param questionData - The question data to update
 * @returns The updated question
 */
export const updateQuestion = async (
  questionId: string,
  questionData: AssessmentQuestionUpdate
): Promise<AssessmentQuestion> => {
  const response = await apiClient.put(
    `/v1/assessments/questions/${questionId}`,
    questionData
  );
  return response.data;
};

/**
 * Delete a question
 * Uses apiClient to benefit from automatic token refresh on 401 errors
 * @param questionId - The ID of the question to delete
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
  await apiClient.delete(
    `/v1/assessments/questions/${questionId}`
  );
};

export const assessmentsApi = {
  start: startAssessment,
  saveAnswer,
  saveResponse,
  submit: submitAssessment,
  getResults: getAssessmentResults,
  getMyAssessments,
  getAssessment,
  uploadMBTIPDF,
  uploadMBTIPDFFromURL,
};

export default assessmentsApi;
