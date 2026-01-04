'use client';

export const dynamic = 'force-dynamic';

// CRITICAL: Global error handlers to catch React error #130 before it crashes
if (typeof window !== 'undefined') {
  // Override console.error to catch React errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.map(arg => String(arg)).join(' ');
    if (errorString.includes('130') || errorString.includes('Objects are not valid')) {
      console.error('[CRITICAL] ========== REACT ERROR #130 DETECTED ==========');
      console.error('[CRITICAL] Full error:', ...args);
      console.error('[CRITICAL] Stack trace:', new Error().stack);
      console.error('[CRITICAL] ===============================================');
    }
    originalConsoleError.apply(console, args);
  };
  
  window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('130') || event.message.includes('Objects are not valid'))) {
      console.error('[CRITICAL] ========== WINDOW ERROR EVENT ==========');
      console.error('[CRITICAL] React error #130 detected:', event.error);
      console.error('[CRITICAL] Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
      console.error('[CRITICAL] ===============================================');
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (String(event.reason).includes('130') || String(event.reason).includes('Objects are not valid'))) {
      console.error('[CRITICAL] ========== UNHANDLED REJECTION ==========');
      console.error('[CRITICAL] Unhandled promise rejection with React error #130:', event.reason);
      console.error('[CRITICAL] ===============================================');
    }
  });
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { Brain, Target, Users, Heart, Upload, CheckCircle, Lock, type LucideIcon, Loader2 } from 'lucide-react';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType, submitAssessment } from '@/lib/api/assessments';
import { startAssessment } from '@/lib/api/assessments';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';
import { determineAssessmentStatus } from '@/lib/utils/assessmentStatus';
import { formatError } from '@/lib/utils/formatError';

interface AssessmentDisplay {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  icon: LucideIcon;
  externalLink?: string;
  requiresEvaluators?: boolean;
  assessmentId?: number; // ID from database
  assessmentType: AssessmentType;
  answerCount?: number;
  totalQuestions?: number;
}

// Mapping of assessment types to display info (using lowercase keys for internal mapping)
const ASSESSMENT_CONFIG: Record<string, { title: string; description: string; icon: LucideIcon; externalLink?: string; requiresEvaluators?: boolean }> = {
  mbti: {
    title: 'MBTI Personality',
    description: 'Understanding your natural preferences',
    icon: Brain,
    externalLink: 'https://www.psychometrics.com/assessments/mbti/',
  },
  tki: {
    title: 'TKI Conflict Style',
    description: 'Explore your conflict management approach',
    icon: Target,
  },
  wellness: {
    title: 'Wellness',
    description: 'Your overall well-being',
    icon: Heart,
  },
  '360_self': {
    title: '360° Feedback',
    description: 'Multi-faceted leadership perspectives',
    icon: Users,
    requiresEvaluators: true,
  },
  '360_evaluator': {
    title: '360° Feedback (Evaluator)',
    description: 'Provide feedback for a colleague',
    icon: Users,
  },
};

function AssessmentsContent() {
  const router = useRouter();
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  // Try to load cached assessments from sessionStorage for instant display
  const getCachedAssessments = (): AssessmentDisplay[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = sessionStorage.getItem('assessments_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is recent (less than 5 minutes old)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          const cachedData = parsed.data || [];
          
          // CRITICAL: Validate and clean cached data to prevent React error #130
          // Ensure all primitive values are actually primitives, not objects
          const cleanedData: AssessmentDisplay[] = cachedData.map((assessment: any) => {
            // Ensure answerCount is a number or string, never an object
            let answerCount: number | undefined = undefined;
            if (assessment.answerCount !== undefined && assessment.answerCount !== null) {
              if (typeof assessment.answerCount === 'number') {
                answerCount = assessment.answerCount;
              } else if (typeof assessment.answerCount === 'string') {
                const parsed = parseInt(assessment.answerCount, 10);
                answerCount = !isNaN(parsed) ? parsed : undefined;
              } else {
                console.error('[DEBUG] ⚠️ answerCount IS AN OBJECT in cache!', assessment.answerCount);
                // Try to extract a number from the object
                if (typeof assessment.answerCount === 'object' && 'value' in assessment.answerCount) {
                  answerCount = typeof assessment.answerCount.value === 'number' ? assessment.answerCount.value : undefined;
                }
              }
            }
            
            // Ensure totalQuestions is a number or string, never an object
            let totalQuestions: number | undefined = undefined;
            if (assessment.totalQuestions !== undefined && assessment.totalQuestions !== null) {
              if (typeof assessment.totalQuestions === 'number') {
                totalQuestions = assessment.totalQuestions;
              } else if (typeof assessment.totalQuestions === 'string') {
                const parsed = parseInt(assessment.totalQuestions, 10);
                totalQuestions = !isNaN(parsed) ? parsed : undefined;
              } else {
                console.error('[DEBUG] ⚠️ totalQuestions IS AN OBJECT in cache!', assessment.totalQuestions);
                // Try to extract a number from the object
                if (typeof assessment.totalQuestions === 'object' && 'value' in assessment.totalQuestions) {
                  totalQuestions = typeof assessment.totalQuestions.value === 'number' ? assessment.totalQuestions.value : undefined;
                }
              }
            }
            
            // Ensure assessmentId is a number, never an object
            let assessmentId: number | undefined = undefined;
            if (assessment.assessmentId !== undefined && assessment.assessmentId !== null) {
              if (typeof assessment.assessmentId === 'number') {
                assessmentId = assessment.assessmentId;
              } else if (typeof assessment.assessmentId === 'string') {
                const parsed = parseInt(assessment.assessmentId, 10);
                assessmentId = !isNaN(parsed) ? parsed : undefined;
              } else {
                console.error('[DEBUG] ⚠️ assessmentId IS AN OBJECT in cache!', assessment.assessmentId);
                // Try to extract a number from the object
                if (typeof assessment.assessmentId === 'object' && 'id' in assessment.assessmentId) {
                  const idValue = (assessment.assessmentId as { id: unknown }).id;
                  if (typeof idValue === 'number') {
                    assessmentId = idValue;
                  } else if (typeof idValue === 'string') {
                    const parsed = parseInt(idValue, 10);
                    assessmentId = !isNaN(parsed) ? parsed : undefined;
                  }
                } else if (typeof assessment.assessmentId === 'object' && 'value' in assessment.assessmentId) {
                  const value = (assessment.assessmentId as { value: unknown }).value;
                  if (typeof value === 'number') {
                    assessmentId = value;
                  } else if (typeof value === 'string') {
                    const parsed = parseInt(value, 10);
                    assessmentId = !isNaN(parsed) ? parsed : undefined;
                  }
                }
              }
            }
            
            // Ensure status is a string, never an object
            let status: string = 'not-started';
            const rawStatus = assessment.status || 'not-started';
            if (typeof rawStatus === 'string') {
              status = rawStatus;
            } else {
              console.error('[DEBUG] ⚠️ status IS AN OBJECT in cache!', rawStatus);
              if (typeof rawStatus === 'object' && rawStatus !== null && 'value' in rawStatus) {
                status = String((rawStatus as { value: unknown }).value);
              }
            }
            
            // Return cleaned assessment
            return {
              ...assessment,
              answerCount,
              totalQuestions,
              assessmentId,
              status,
            };
          });
          
          // DEBUG: Log cleaned data
          console.log('[DEBUG] Loaded and cleaned cached assessments:', cleanedData.length, 'items');
          cleanedData.forEach((assessment: any, index: number) => {
            console.log(`[DEBUG] Cleaned assessment ${index}:`, {
              id: assessment.id,
              answerCount: assessment.answerCount,
              answerCountType: typeof assessment.answerCount,
              totalQuestions: assessment.totalQuestions,
              totalQuestionsType: typeof assessment.totalQuestions,
              assessmentId: assessment.assessmentId,
              assessmentIdType: typeof assessment.assessmentId,
              status: assessment.status,
              statusType: typeof assessment.status,
            });
          });
          
          return cleanedData;
        }
      }
    } catch (e) {
      console.error('[DEBUG] Error loading cache:', e);
      // Clear corrupted cache
      try {
        sessionStorage.removeItem('assessments_cache');
      } catch (clearError) {
        // Ignore clear errors
      }
    }
    return [];
  };

  // CRITICAL: Start with empty array to prevent rendering corrupted cached data
  // This prevents React error #130 from corrupted cache being rendered on first mount
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading state
  const [error, setError] = useState<string | null>(null);
  const [startingAssessment, setStartingAssessment] = useState<string | null>(null);

  useEffect(() => {
    // CRITICAL: Clear corrupted cache before loading to prevent React error #130
    // This ensures we always start fresh when the component mounts
    // This is especially important when returning from results page
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('assessments_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const cachedData = parsed.data || [];
          // Check if cache contains objects (corrupted data)
          const hasCorruptedData = cachedData.some((assessment: any) => 
            (typeof assessment.answerCount === 'object' && assessment.answerCount !== null) ||
            (typeof assessment.totalQuestions === 'object' && assessment.totalQuestions !== null) ||
            (typeof assessment.assessmentId === 'object' && assessment.assessmentId !== null) ||
            (typeof assessment.status === 'object' && assessment.status !== null)
          );
          
          if (hasCorruptedData) {
            console.warn('[Assessments] Corrupted cache detected, clearing it before reload');
            sessionStorage.removeItem('assessments_cache');
          } else {
            // Cache is clean, use it for instant display
            const cleanedCachedData = getCachedAssessments();
            if (cleanedCachedData.length > 0) {
              setAssessments(cleanedCachedData);
              setIsLoading(false);
            }
          }
        }
      } catch (e) {
        // If we can't parse the cache, clear it to be safe
        console.warn('[Assessments] Error checking cache, clearing it:', e);
        try {
          sessionStorage.removeItem('assessments_cache');
        } catch (clearError) {
          // Ignore clear errors
        }
      }
    }
    
    loadAssessments();
  }, []);

  // Refresh assessments when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAssessments();
      }
    };

    const handleFocus = () => {
      loadAssessments();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get assessments from API
      const apiAssessments: ApiAssessment[] = await getMyAssessments();
      
      // CRITICAL: Clean API data to ensure answer_count and total_questions are numbers, not objects
      // This prevents React error #130 when data is corrupted
      const cleanedApiAssessments = apiAssessments.map((assessment: any) => {
        const cleaned: ApiAssessment = { ...assessment };
        
        // Ensure answer_count is a number or undefined
        if (cleaned.answer_count !== undefined && cleaned.answer_count !== null) {
          const rawAnswerCount = cleaned.answer_count;
          if (typeof rawAnswerCount === 'object' && rawAnswerCount !== null) {
            console.error('[Assessments] ⚠️ answer_count IS AN OBJECT from API!', {
              assessmentId: cleaned.id,
              answer_count: rawAnswerCount,
              type: typeof rawAnswerCount
            });
            // Try to extract a number from the object
            if ('value' in rawAnswerCount && typeof (rawAnswerCount as { value: unknown }).value === 'number') {
              cleaned.answer_count = (rawAnswerCount as { value: number }).value;
            } else {
              cleaned.answer_count = undefined;
            }
          } else if (typeof rawAnswerCount !== 'number') {
            const parsed = parseInt(String(rawAnswerCount), 10);
            cleaned.answer_count = !isNaN(parsed) ? parsed : undefined;
          }
        }
        
        // Ensure total_questions is a number or undefined
        if (cleaned.total_questions !== undefined && cleaned.total_questions !== null) {
          const rawTotalQuestions = cleaned.total_questions;
          if (typeof rawTotalQuestions === 'object' && rawTotalQuestions !== null) {
            console.error('[Assessments] ⚠️ total_questions IS AN OBJECT from API!', {
              assessmentId: cleaned.id,
              total_questions: rawTotalQuestions,
              type: typeof rawTotalQuestions
            });
            // Try to extract a number from the object
            if ('value' in rawTotalQuestions && typeof (rawTotalQuestions as { value: unknown }).value === 'number') {
              cleaned.total_questions = (rawTotalQuestions as { value: number }).value;
            } else {
              cleaned.total_questions = undefined;
            }
          } else if (typeof rawTotalQuestions !== 'number') {
            const parsed = parseInt(String(rawTotalQuestions), 10);
            cleaned.total_questions = !isNaN(parsed) ? parsed : undefined;
          }
        }
        
        return cleaned;
      });
      
      // Always log assessment statuses for troubleshooting (even in production)
      // Convert to string to prevent React error #130 (objects not valid as React child)
      console.log('[Assessments] Loaded assessments from API:', JSON.stringify(cleanedApiAssessments.map(a => ({
        type: a.assessment_type,
        status: a.status,
        id: a.id,
        answer_count: a.answer_count,
        total_questions: a.total_questions,
        created_at: a.created_at
      }))));
      
      // Create a map of existing assessments by type
      const existingAssessmentsMap = new Map<AssessmentType, ApiAssessment>();
      cleanedApiAssessments.forEach(assessment => {
        const existing = existingAssessmentsMap.get(assessment.assessment_type);
        // Keep the most recent assessment of each type
        if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
          existingAssessmentsMap.set(assessment.assessment_type, assessment);
        }
      });
      
      // Debug: Log the map for Wellness
      // Convert to string to prevent React error #130
      const wellnessAssessment = existingAssessmentsMap.get('WELLNESS');
      console.log('[Assessments] Assessment map after processing:', JSON.stringify({
        wellnessAssessment: wellnessAssessment ? {
          id: wellnessAssessment.id,
          status: wellnessAssessment.status,
          answer_count: wellnessAssessment.answer_count,
          total_questions: wellnessAssessment.total_questions
        } : null,
        allTypes: Array.from(existingAssessmentsMap.keys())
      }));
      
      // Build display assessments list
      const displayAssessments: AssessmentDisplay[] = Object.entries(ASSESSMENT_CONFIG)
        .filter(([type]) => type !== '360_evaluator') // Skip 360_evaluator as it's not a valid AssessmentType
        .map(([type, config]) => {
        // Map lowercase type to uppercase for API
        // Special handling for 360_self -> THREE_SIXTY_SELF
        let apiType: AssessmentType;
        if (type === '360_self') {
          apiType = 'THREE_SIXTY_SELF';
        } else {
          apiType = type.toUpperCase() as AssessmentType;
        }
        const apiAssessment = existingAssessmentsMap.get(apiType);
        
        // Debug: Log if Wellness assessment is not found
        if (apiType === 'WELLNESS' && !apiAssessment) {
          // Convert to string to prevent React error #130
          console.warn('[Assessments] Wellness assessment not found in map!', JSON.stringify({
            apiType,
            mapKeys: Array.from(existingAssessmentsMap.keys()),
            allAssessments: cleanedApiAssessments.filter(a => a.assessment_type === 'WELLNESS').map(a => ({
              id: a.id,
              type: a.assessment_type,
              status: a.status
            }))
          }));
        }
        
        // Use utility function for consistent status determination
        let status: 'completed' | 'in-progress' | 'locked' | 'available' = 'available';
        if (apiAssessment) {
          // Always log for Wellness assessments (even in production) for troubleshooting
          if (apiType === 'WELLNESS') {
            // Convert to string to prevent React error #130
            console.log(`[Assessments] Wellness assessment status check:`, JSON.stringify({
              rawStatus: apiAssessment.status,
              assessmentId: apiAssessment.id,
              answerCount: apiAssessment.answer_count,
              totalQuestions: apiAssessment.total_questions,
              hasAllAnswers: apiAssessment.answer_count !== undefined && 
                            apiAssessment.total_questions !== undefined &&
                            apiAssessment.total_questions > 0 &&
                            apiAssessment.answer_count >= apiAssessment.total_questions
            }));
          }
          
          status = determineAssessmentStatus(apiAssessment, apiType);
          
          // Always log the determined status for Wellness
          if (apiType === 'WELLNESS') {
            // Convert to string to prevent React error #130
            console.log(`[Assessments] Wellness assessment determined status:`, JSON.stringify({
              assessmentId: apiAssessment.id,
              determinedStatus: status,
              rawStatus: apiAssessment.status,
              answerCount: apiAssessment.answer_count,
              totalQuestions: apiAssessment.total_questions
            }));
          }
          
          // Log if status was determined as completed but backend status wasn't
          if (status === 'completed' && 
              apiAssessment.status !== 'completed' && 
              apiAssessment.status !== 'COMPLETED') {
            console.log(`[Assessments] Assessment ${apiAssessment.id} (${apiType}) has all answers (${apiAssessment.answer_count}/${apiAssessment.total_questions}) but status is "${apiAssessment.status}", treating as completed`);
          }
        }
        
        return {
          id: type,
          title: config.title,
          description: config.description,
          status,
          icon: config.icon,
          externalLink: config.externalLink,
          requiresEvaluators: config.requiresEvaluators,
          assessmentId: apiAssessment?.id ? (typeof apiAssessment.id === 'number' ? apiAssessment.id : parseInt(String(apiAssessment.id), 10)) : undefined,
          assessmentType: apiType,
          // CRITICAL: Ensure answerCount and totalQuestions are numbers or undefined, never objects
          answerCount: apiAssessment?.answer_count !== undefined && apiAssessment?.answer_count !== null
            ? (typeof apiAssessment.answer_count === 'number' ? apiAssessment.answer_count : parseInt(String(apiAssessment.answer_count), 10))
            : undefined,
          totalQuestions: apiAssessment?.total_questions !== undefined && apiAssessment?.total_questions !== null
            ? (typeof apiAssessment.total_questions === 'number' ? apiAssessment.total_questions : parseInt(String(apiAssessment.total_questions), 10))
            : undefined,
        };
      });
      
      // DEBUG: Log each assessment object to check for nested objects
      displayAssessments.forEach((assessment, index) => {
        console.log(`[DEBUG] Assessment ${index} (${assessment.id}):`, {
          id: assessment.id,
          title: assessment.title,
          status: assessment.status,
          answerCount: assessment.answerCount,
          answerCountType: typeof assessment.answerCount,
          answerCountIsObject: typeof assessment.answerCount === 'object',
          totalQuestions: assessment.totalQuestions,
          totalQuestionsType: typeof assessment.totalQuestions,
          totalQuestionsIsObject: typeof assessment.totalQuestions === 'object',
          assessmentId: assessment.assessmentId,
          assessmentIdType: typeof assessment.assessmentId,
          assessmentIdIsObject: typeof assessment.assessmentId === 'object',
          assessmentType: assessment.assessmentType,
          fullObject: JSON.parse(JSON.stringify(assessment)) // Deep clone to see structure
        });
      });
      
      // CRITICAL: Final validation before setting state - ensure no objects are present
      // This is a last line of defense against React error #130
      const finalValidatedAssessments = displayAssessments.map(assessment => {
        // Double-check all values are primitives
        return {
          ...assessment,
          answerCount: typeof assessment.answerCount === 'number' ? assessment.answerCount : undefined,
          totalQuestions: typeof assessment.totalQuestions === 'number' ? assessment.totalQuestions : undefined,
          assessmentId: typeof assessment.assessmentId === 'number' ? assessment.assessmentId : undefined,
          status: typeof assessment.status === 'string' ? assessment.status : 'available',
        };
      });
      
      setAssessments(finalValidatedAssessments);
      
      // Cache assessments in sessionStorage for instant display on next visit
      // Only cache validated data to prevent corruption
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('assessments_cache', JSON.stringify({
            data: finalValidatedAssessments,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }
      }
    } catch (err) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('Failed to load assessments:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = async (assessmentType: AssessmentType, assessmentId?: number) => {
    try {
      setStartingAssessment(assessmentType);
      
      // Always redirect 360 feedback to start page - never use /start endpoint
      if (assessmentType === 'THREE_SIXTY_SELF') {
        if (assessmentId) {
          // Resume existing assessment with ID in URL
          router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessmentId}`);
        } else {
          // New assessment - redirect to start page to invite evaluators
          router.push('/dashboard/assessments/360-feedback/start');
        }
        return; // Early return to prevent calling startAssessment
      }
      
      // For other assessment types
      if (assessmentId) {
        // Resume existing assessment
        router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}`);
      } else {
        // Start new assessment for other types
        await startAssessment(assessmentType);
        router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}`);
      }
    } catch (err) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('Failed to start assessment:', errorMessage);
      setError(errorMessage);
    } finally {
      setStartingAssessment(null);
    }
  };

  const getAssessmentRoute = (type: AssessmentType): string => {
    switch (type) {
      case 'TKI':
        return 'tki';
      case 'WELLNESS':
        return 'wellness';
      case 'THREE_SIXTY_SELF':
        return '360-feedback';
      case 'MBTI':
        return 'mbti';
      default:
        // TypeScript exhaustiveness check - this should never happen
        return String(type).toLowerCase();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            Terminé
          </div>
        );
      case 'in-progress':
        return (
          <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            En cours
          </div>
        );
      case 'locked':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <Lock size={16} />
            Verrouillé
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
            Disponible
          </div>
        );
    }
  };

  const getActionButton = (assessment: AssessmentDisplay) => {
    // CRITICAL: Ensure assessmentId is always a number before using it
    const safeAssessmentId = typeof assessment.assessmentId === 'number' 
      ? assessment.assessmentId 
      : typeof assessment.assessmentId === 'string'
      ? parseInt(assessment.assessmentId, 10)
      : undefined;
    
    // If assessmentId is an object, log error and return null
    if (assessment.assessmentId !== undefined && assessment.assessmentId !== null && typeof assessment.assessmentId === 'object') {
      console.error('[Assessments] ⚠️ assessmentId IS AN OBJECT in getActionButton!', {
        assessmentId: assessment.assessmentId,
        assessmentType: assessment.assessmentType,
        status: assessment.status
      });
      return null;
    }
    
    const isStarting = startingAssessment === assessment.assessmentType;
    
    // Debug logging for Wellness button determination
    if (assessment.assessmentType === 'WELLNESS') {
      // Convert to string to prevent React error #130
      console.log(`[Assessments] Wellness button determination:`, JSON.stringify({
        status: assessment.status,
        answerCount: assessment.answerCount,
        totalQuestions: assessment.totalQuestions,
        assessmentId: safeAssessmentId,
        hasAllAnswers: assessment.answerCount !== undefined && 
                      assessment.totalQuestions !== undefined && 
                      assessment.answerCount >= assessment.totalQuestions
      }));
    }
    
    switch (assessment.status) {
      case 'completed':
        if (assessment.externalLink && assessment.assessmentType === 'MBTI') {
          return (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(assessment.externalLink, '_blank')}
            >
              <Upload size={16} />
              Télécharger mon score
            </Button>
          );
        }
        // For other assessments, show "Voir les résultats"
        // CRITICAL: Only navigate if we have a valid assessmentId
        if (!safeAssessmentId || isNaN(safeAssessmentId)) {
          console.error('[Assessments] Cannot navigate to results: invalid assessmentId', {
            assessmentId: assessment.assessmentId,
            safeAssessmentId,
            assessmentType: assessment.assessmentType
          });
          return null;
        }
        return (
          <Button 
            variant="outline" 
            onClick={() => {
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${safeAssessmentId}`);
              }
            }}
          >
            Voir les résultats
          </Button>
        );
      case 'in-progress':
        // CRITICAL: Only proceed if we have a valid assessmentId
        if (!safeAssessmentId || isNaN(safeAssessmentId)) {
          // If all questions are answered but no valid ID, show continue button
          if (assessment.answerCount !== undefined && 
              assessment.totalQuestions !== undefined && 
              assessment.answerCount >= assessment.totalQuestions) {
            return (
              <Button variant="outline" disabled>
                ID invalide
              </Button>
            );
          }
          // Otherwise show continue button
          return (
            <Button 
              variant="outline"
              disabled={isStarting}
              onClick={() => {
                if (assessment.assessmentType === 'WELLNESS') {
                  router.push('/dashboard/assessments/wellness');
                } else if (assessment.assessmentType === 'TKI') {
                  router.push('/dashboard/assessments/tki');
                } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                  router.push('/dashboard/assessments/360-feedback');
                }
              }}
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Continuer'
              )}
            </Button>
          );
        }
        
        // If all questions are answered, show "Voir les résultats" button
        if (assessment.answerCount !== undefined && 
            assessment.totalQuestions !== undefined && 
            assessment.answerCount >= assessment.totalQuestions) {
          return (
            <Button 
              variant="outline"
              disabled={isStarting}
              onClick={async () => {
                try {
                  setStartingAssessment(assessment.assessmentType);
                  // Submit the assessment first if not already submitted
                  await submitAssessment(safeAssessmentId);
                  // Then redirect to results
                  if (assessment.assessmentType === 'TKI') {
                    router.push(`/dashboard/assessments/tki/results?id=${safeAssessmentId}`);
                  } else if (assessment.assessmentType === 'WELLNESS') {
                    router.push(`/dashboard/assessments/results?id=${safeAssessmentId}`);
                  } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                    router.push(`/dashboard/assessments/360-feedback/results?id=${safeAssessmentId}`);
                  }
                } catch (err) {
                  console.error('Failed to submit assessment:', err);
                  // If submission fails, try to go to results anyway (might already be submitted)
                  if (assessment.assessmentType === 'TKI') {
                    router.push(`/dashboard/assessments/tki/results?id=${safeAssessmentId}`);
                  } else if (assessment.assessmentType === 'WELLNESS') {
                    router.push(`/dashboard/assessments/results?id=${safeAssessmentId}`);
                  } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                    router.push(`/dashboard/assessments/360-feedback/results?id=${safeAssessmentId}`);
                  }
                } finally {
                  setStartingAssessment(null);
                }
              }}
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Voir les résultats'
              )}
            </Button>
          );
        }
        // Otherwise, show "Continuer" button
        return (
          <Button 
            variant="outline"
            className="border-arise-button-primary text-white hover:bg-arise-button-primary hover:text-white"
            disabled={isStarting}
            onClick={() => {
              if (assessment.requiresEvaluators) {
                setShowEvaluatorModal(true);
              } else {
                // For 360 feedback, include assessmentId in URL (only if valid)
                if (assessment.assessmentType === 'THREE_SIXTY_SELF' && safeAssessmentId && !isNaN(safeAssessmentId)) {
                  router.push(`/dashboard/assessments/360-feedback?assessmentId=${safeAssessmentId}`);
                } else {
                  router.push(`/dashboard/assessments/${getAssessmentRoute(assessment.assessmentType)}`);
                }
              }
            }}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Continuer'
            )}
          </Button>
        );
      case 'available':
        return (
          <Button 
            variant="arise-primary"
            disabled={isStarting}
            onClick={() => handleStartAssessment(assessment.assessmentType, safeAssessmentId && !isNaN(safeAssessmentId) ? safeAssessmentId : undefined)}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Commencer'
            )}
          </Button>
        );
      default:
        return (
          <Button variant="secondary" disabled>
            Verrouillé
          </Button>
        );
    }
  };

  // CRITICAL: Ensure assessments is always an array before using it
  // This prevents React error #130 if assessments is somehow corrupted
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  
  // Show loading indicator only if we have no cached data
  if (isLoading && safeAssessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-arise-deep-teal" />
          <p className="text-gray-600">Chargement des assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Ensure error is always a string before rendering
    const errorString = typeof error === 'string' ? error : formatError(error || 'Failed to load assessments');
    const isUnauthorized = errorString.includes('401') || errorString.includes('expired') || errorString.includes('Unauthorized');
    
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{errorString}</p>
            {isUnauthorized ? (
              <Button variant="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            ) : (
              <Button variant="primary" onClick={loadAssessments}>
                Réessayer
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8 pb-6">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Vos </span>
            <span style={{ color: '#D5B667' }}>assessments</span>
          </h1>
          <p className="text-white">
            Suivez et gérez vos assessments de leadership
          </p>
        </div>
      </MotionDiv>

      {/* Wrapper for assessments with background color block */}
      <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
        {/* Background color block behind all assessments */}
        <div 
          className="absolute"
          style={{ 
            backgroundColor: '#D5DEE0',
            top: '-20px',
            bottom: 0,
            left: '-15%',
            right: '-15%',
            width: 'calc(100% + 30%)',
            zIndex: 0,
            borderRadius: '16px',
          }}
        />
        
        {/* Content sections with relative positioning */}
        <div className="relative z-10">
          {/* Show subtle loading indicator if refreshing in background */}
          {isLoading && safeAssessments.length > 0 && (
            <div className="mb-4 flex items-center justify-end">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Actualisation...</span>
              </div>
            </div>
          )}
          <MotionDiv variant="slideUp" delay={100}>
            <Stack gap="normal">
              {safeAssessments.map((assessment, index) => {
                // CRITICAL: Wrap entire card rendering in try-catch to prevent React error #130
                // This is the last line of defense - if ANY object gets rendered, catch it here
                try {
                  // DEBUG: Log each assessment before rendering to catch objects
                  console.log(`[DEBUG] ========== RENDERING ASSESSMENT ${index} ==========`);
                  console.log('[DEBUG] Assessment object:', assessment);
                  console.log('[DEBUG] Assessment keys:', Object.keys(assessment));
                  
                  // CRITICAL: Check EVERY property for objects (except icon which is a React component)
                  Object.keys(assessment).forEach(key => {
                    // Skip icon - it's a React component and SHOULD be an object/function
                    if (key === 'icon') return;
                    
                    const value = (assessment as any)[key];
                    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                      console.error(`[CRITICAL] ⚠️⚠️⚠️ PROPERTY "${key}" IS AN OBJECT!`, value);
                    }
                  });
                  
                  console.log('[DEBUG] Assessment details:', {
                    id: assessment.id,
                    idType: typeof assessment.id,
                    title: assessment.title,
                    titleType: typeof assessment.title,
                    status: assessment.status,
                    statusType: typeof assessment.status,
                    answerCount: assessment.answerCount,
                    answerCountType: typeof assessment.answerCount,
                    answerCountValue: assessment.answerCount,
                    totalQuestions: assessment.totalQuestions,
                    totalQuestionsType: typeof assessment.totalQuestions,
                    totalQuestionsValue: assessment.totalQuestions,
                    assessmentId: assessment.assessmentId,
                    assessmentIdType: typeof assessment.assessmentId,
                    assessmentIdValue: assessment.assessmentId,
                    description: assessment.description,
                    descriptionType: typeof assessment.description,
                  });
                  
                  // DEBUG: Check if any value is an object that might be rendered (except icon which is a React component)
                  if (typeof assessment.answerCount === 'object' && assessment.answerCount !== null) {
                    console.error('[DEBUG] ⚠️ answerCount IS AN OBJECT!', assessment.answerCount);
                  }
                  if (typeof assessment.totalQuestions === 'object' && assessment.totalQuestions !== null) {
                    console.error('[DEBUG] ⚠️ totalQuestions IS AN OBJECT!', assessment.totalQuestions);
                  }
                  if (typeof assessment.assessmentId === 'object' && assessment.assessmentId !== null) {
                    console.error('[DEBUG] ⚠️ assessmentId IS AN OBJECT!', assessment.assessmentId);
                  }
                  if (typeof assessment.status === 'object' && assessment.status !== null) {
                    console.error('[DEBUG] ⚠️ status IS AN OBJECT!', assessment.status);
                  }
                  // Note: icon is a React component, so it's normal for it to be an object/function
                  
                  // CRITICAL: Force all values to be primitives before rendering
                  // Convert EVERY property to ensure no objects slip through
                  const safeAssessment: AssessmentDisplay = {
                    id: typeof assessment.id === 'string' ? assessment.id : String(assessment.id || ''),
                    title: typeof assessment.title === 'string' ? assessment.title : String(assessment.title || ''),
                    description: typeof assessment.description === 'string' ? assessment.description : String(assessment.description || ''),
                    status: typeof assessment.status === 'string' ? assessment.status : 'available',
                    icon: assessment.icon,
                    assessmentType: assessment.assessmentType,
                    answerCount: typeof assessment.answerCount === 'number' ? assessment.answerCount : (typeof assessment.answerCount === 'string' ? parseInt(assessment.answerCount, 10) : undefined),
                    totalQuestions: typeof assessment.totalQuestions === 'number' ? assessment.totalQuestions : (typeof assessment.totalQuestions === 'string' ? parseInt(assessment.totalQuestions, 10) : undefined),
                    assessmentId: typeof assessment.assessmentId === 'number' ? assessment.assessmentId : (typeof assessment.assessmentId === 'string' ? parseInt(assessment.assessmentId, 10) : undefined),
                    externalLink: typeof assessment.externalLink === 'string' ? assessment.externalLink : undefined,
                    requiresEvaluators: typeof assessment.requiresEvaluators === 'boolean' ? assessment.requiresEvaluators : undefined,
                  };
                  
                  // CRITICAL: Final validation - ensure NO objects in safeAssessment (except icon which is a React component)
                  Object.keys(safeAssessment).forEach(key => {
                    // Skip icon - it's a React component and SHOULD be an object/function
                    if (key === 'icon') return;
                    
                    const value = (safeAssessment as any)[key];
                    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                      console.error(`[CRITICAL] ⚠️⚠️⚠️ safeAssessment.${key} IS STILL AN OBJECT AFTER CLEANING!`, value);
                      throw new Error(`safeAssessment.${key} is an object: ${JSON.stringify(value)}`);
                    }
                  });
                  
                  console.log(`[DEBUG] Safe assessment ${index} created:`, safeAssessment);
                  
                  const Icon = safeAssessment.icon;
                  const is360Feedback = safeAssessment.assessmentType === 'THREE_SIXTY_SELF';
                  // CRITICAL: Ensure key is a string, not an object
                  const cardKey = typeof assessment.id === 'string' ? assessment.id : String(assessment.id || `assessment-${index}`);
                  
                  console.log(`[DEBUG] Rendering Card for assessment ${index} with key:`, cardKey);
                  
                  return (
                  <Card 
                    key={cardKey} 
                    className="hover:shadow-lg transition-shadow"
                    style={is360Feedback ? { backgroundColor: 'rgb(255, 255, 255)' } : undefined}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#e7eeef' }}
                        >
                          <Icon className="text-arise-deep-teal" size={32} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {safeAssessment.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {safeAssessment.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {(() => {
                          // CRITICAL: Wrap status badge in try-catch to prevent React error #130
                          try {
                            return getStatusBadge(safeAssessment.status);
                          } catch (err) {
                            console.error('[Assessments] Error rendering status badge:', err);
                            return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">-</span>;
                          }
                        })()}
                        {(() => {
                          // CRITICAL: Wrap progress display in try-catch to prevent React error #130
                          try {
                            if (safeAssessment.status !== 'in-progress') return null;
                            
                            // Use safe values
                            const answerCount = safeAssessment.answerCount;
                            const totalQuestions = safeAssessment.totalQuestions;
                            
                            if (answerCount !== undefined && totalQuestions !== undefined && !isNaN(answerCount) && !isNaN(totalQuestions)) {
                              const safeAnswerCount = typeof answerCount === 'number' ? answerCount : (typeof answerCount === 'string' ? parseInt(answerCount, 10) : 0);
                              const safeTotalQuestions = typeof totalQuestions === 'number' ? totalQuestions : (typeof totalQuestions === 'string' ? parseInt(totalQuestions, 10) : 0);
                              return (
                                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                  {safeAnswerCount}/{safeTotalQuestions}
                                </span>
                              );
                            } else if (answerCount !== undefined && !isNaN(answerCount)) {
                              const safeAnswerCount = typeof answerCount === 'number' ? answerCount : (typeof answerCount === 'string' ? parseInt(answerCount, 10) : 0);
                              return (
                                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                  {safeAnswerCount} réponses
                                </span>
                              );
                            } else {
                              return (
                                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                  En cours
                                </span>
                              );
                            }
                          } catch (err) {
                            console.error('[Assessments] Error rendering progress:', err);
                            return null;
                          }
                        })()}
                        {safeAssessment.externalLink && safeAssessment.status !== 'completed' && (
                          <span className="px-3 py-1 border border-arise-deep-teal text-arise-deep-teal rounded-full text-xs font-medium">
                            Lien externe
                          </span>
                        )}
                        {getActionButton(safeAssessment)}
                      </div>
                    </div>
                    {/* Progress bar - always visible */}
                    <div className="mt-4">
                      {(() => {
                        // CRITICAL: Use safeAssessment values to prevent React error #130
                        try {
                          // Calculate progress percentage
                          let progressValue = 0;
                          let progressMax = 100;
                          let progressLabel = 'Progression';
                          let progressPercentage = 0;
                          
                          if (safeAssessment.status === 'completed') {
                            progressValue = 100;
                            progressMax = 100;
                            progressPercentage = 100;
                            progressLabel = 'Terminé';
                          } else if (safeAssessment.status === 'in-progress') {
                            // Use safe values (already validated as numbers or undefined)
                            const answerCount = safeAssessment.answerCount;
                            const totalQuestions = safeAssessment.totalQuestions;
                            
                            if (answerCount !== undefined && 
                                totalQuestions !== undefined && 
                                !isNaN(answerCount) &&
                                !isNaN(totalQuestions) &&
                                totalQuestions > 0) {
                              progressValue = answerCount;
                              progressMax = totalQuestions;
                              const safeAnswerCount = typeof answerCount === 'number' ? answerCount : (typeof answerCount === 'string' ? parseInt(answerCount, 10) : 0);
                              const safeTotalQuestions = typeof totalQuestions === 'number' ? totalQuestions : (typeof totalQuestions === 'string' ? parseInt(totalQuestions, 10) : 0);
                              progressPercentage = Math.round((safeAnswerCount / safeTotalQuestions) * 100);
                              progressLabel = `Progression: ${safeAnswerCount}/${safeTotalQuestions} questions`;
                            } else if (answerCount !== undefined && !isNaN(answerCount) && answerCount > 0) {
                              // Fallback: show answer count even if total_questions is missing
                              const safeAnswerCount = typeof answerCount === 'number' ? answerCount : (typeof answerCount === 'string' ? parseInt(answerCount, 10) : 0);
                              progressValue = safeAnswerCount;
                              progressMax = 100; // Unknown total, use 100 as max
                              progressPercentage = Math.min(safeAnswerCount * 10, 99); // Estimate: assume ~10 questions per answer
                              progressLabel = `Progression: ${safeAnswerCount} réponses`;
                            } else {
                              progressValue = 0;
                              progressMax = 100;
                              progressPercentage = 0;
                              progressLabel = 'En cours';
                            }
                          } else if (safeAssessment.status === 'available') {
                            progressValue = 0;
                            progressMax = 100;
                            progressPercentage = 0;
                            progressLabel = 'Non commencé';
                          } else if (safeAssessment.status === 'locked') {
                            progressValue = 0;
                            progressMax = 100;
                            progressPercentage = 0;
                            progressLabel = 'Verrouillé';
                          }
                        
                        // Determine bar color: #d8b868 when there's progress, gray when 0
                        const barColor = progressPercentage > 0 ? '#d8b868' : '#9ca3af';
                        
                        return (
                          <div className="w-full">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {typeof progressLabel === 'string' ? progressLabel : String(progressLabel || 'Progression')}
                              </span>
                              <span className="text-sm text-gray-600">
                                {typeof progressPercentage === 'number' ? `${progressPercentage}%` : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${progressPercentage}%`,
                                  backgroundColor: barColor
                                }}
                                role="progressbar"
                                aria-valuenow={progressValue}
                                aria-valuemin={0}
                                aria-valuemax={progressMax}
                              />
                            </div>
                          </div>
                        );
                      } catch (progressError: any) {
                        console.error('[Assessments] Error rendering progress bar:', progressError);
                        return (
                          <div className="w-full">
                            <p className="text-sm text-gray-500">Progression non disponible</p>
                          </div>
                        );
                      }
                      })()}
                    </div>
                    
                    {/* 360 Feedback Evaluators Section - integrated in the same Card */}
                    {safeAssessment.assessmentType === 'THREE_SIXTY_SELF' && (
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#e7eeef' }}
                            >
                              <Users className="text-arise-gold" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                Ajoutez vos évaluateurs avant de commencer cet assessment
                              </h3>
                              <p className="text-sm text-gray-600">
                                Invitez des collègues à fournir un feedback 360° sur votre leadership
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="primary"
                            className="!bg-arise-gold !text-white hover:!bg-arise-gold/90"
                            style={{ backgroundColor: '#d8b868', color: '#000000' }}
                            onClick={() => setShowEvaluatorModal(true)}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                  );
                } catch (renderError: any) {
                  // CRITICAL: Catch ANY rendering error to prevent React error #130
                  console.error('[CRITICAL] ========== ERROR RENDERING ASSESSMENT CARD! ==========');
                  console.error('[CRITICAL] Assessment index:', index);
                  console.error('[CRITICAL] Error:', renderError);
                  console.error('[CRITICAL] Error message:', renderError?.message || String(renderError));
                  console.error('[CRITICAL] Error stack:', renderError?.stack);
                  console.error('[CRITICAL] Original assessment:', assessment);
                  console.error('[CRITICAL] Assessment keys:', Object.keys(assessment));
                  
                  // Check every property for objects (except icon which is a React component)
                  Object.keys(assessment).forEach(key => {
                    // Skip icon - it's a React component and SHOULD be an object/function
                    if (key === 'icon') return;
                    
                    const value = (assessment as any)[key];
                    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                      console.error(`[CRITICAL] ⚠️⚠️⚠️ PROPERTY "${key}" IN ORIGINAL ASSESSMENT IS AN OBJECT!`, value);
                    }
                  });
                  
                  console.error('[CRITICAL] Assessment details:', {
                    id: assessment.id,
                    idType: typeof assessment.id,
                    title: assessment.title,
                    titleType: typeof assessment.title,
                    answerCount: assessment.answerCount,
                    answerCountType: typeof assessment.answerCount,
                    totalQuestions: assessment.totalQuestions,
                    totalQuestionsType: typeof assessment.totalQuestions,
                    assessmentId: assessment.assessmentId,
                    assessmentIdType: typeof assessment.assessmentId,
                    status: assessment.status,
                    statusType: typeof assessment.status,
                  });
                  console.error('[CRITICAL] =====================================================');
                  
                  // Render a safe fallback card instead of crashing
                  return (
                    <Card key={`error-${index}`} className="border-red-300 bg-red-50">
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          {typeof assessment.title === 'string' ? assessment.title : 'Assessment'}
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                          Erreur d'affichage. Veuillez rafraîchir la page.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            // Clear cache and reload
                            if (typeof window !== 'undefined') {
                              sessionStorage.removeItem('assessments_cache');
                              window.location.reload();
                            }
                          }}
                        >
                          Rafraîchir
                        </Button>
                      </div>
                    </Card>
                  );
                }
              })}
            </Stack>
          </MotionDiv>
        </div>
      </div>

      {/* Evaluator Modal */}
      {showEvaluatorModal && (() => {
        const feedback360Assessment = safeAssessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF');
        // CRITICAL: Ensure assessmentId is a number, not an object
        const safeModalAssessmentId = feedback360Assessment?.assessmentId !== undefined && feedback360Assessment?.assessmentId !== null
          ? (typeof feedback360Assessment.assessmentId === 'number' 
              ? feedback360Assessment.assessmentId 
              : typeof feedback360Assessment.assessmentId === 'string'
              ? parseInt(feedback360Assessment.assessmentId, 10)
              : undefined)
          : undefined;
        
        if (!safeModalAssessmentId || isNaN(safeModalAssessmentId)) {
          console.error('[Assessments] Cannot show evaluator modal: invalid assessmentId', {
            assessmentId: feedback360Assessment?.assessmentId,
            type: typeof feedback360Assessment?.assessmentId
          });
          return null;
        }
        return (
          <InviteAdditionalEvaluatorsModal
            key={`evaluator-modal-${safeModalAssessmentId}`}
            isOpen={showEvaluatorModal}
            onClose={() => setShowEvaluatorModal(false)}
            assessmentId={safeModalAssessmentId}
            onSuccess={() => {
              setShowEvaluatorModal(false);
              loadAssessments(); // Reload to refresh evaluator status
            }}
          />
        );
      })()}
    </>
  );
}

export default function AssessmentsPage() {
  return (
    <ErrorBoundary showDetails={false}>
      <AssessmentsContent />
    </ErrorBoundary>
  );
}
