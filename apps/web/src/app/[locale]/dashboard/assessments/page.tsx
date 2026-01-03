'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Stack, Progress } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { Brain, Target, Users, Heart, Upload, CheckCircle, Lock, type LucideIcon, Loader2 } from 'lucide-react';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType, submitAssessment } from '@/lib/api/assessments';
import { startAssessment } from '@/lib/api/assessments';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';

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
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAssessment, setStartingAssessment] = useState<string | null>(null);

  useEffect(() => {
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
      
      // Debug: Log assessment statuses for troubleshooting
      if (process.env.NODE_ENV === 'development') {
        console.log('[Assessments] Loaded assessments:', apiAssessments.map(a => ({
          type: a.assessment_type,
          status: a.status,
          id: a.id,
          answer_count: a.answer_count,
          total_questions: a.total_questions
        })));
      }
      
      // Create a map of existing assessments by type
      const existingAssessmentsMap = new Map<AssessmentType, ApiAssessment>();
      apiAssessments.forEach(assessment => {
        const existing = existingAssessmentsMap.get(assessment.assessment_type);
        // Keep the most recent assessment of each type
        if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
          existingAssessmentsMap.set(assessment.assessment_type, assessment);
        }
      });
      
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
        
        let status: 'completed' | 'in-progress' | 'locked' | 'available' = 'available';
        if (apiAssessment) {
          // Normalize status for comparison (backend returns lowercase with underscores)
          // Backend enum values: "completed", "in_progress", "not_started"
          const rawStatus = String(apiAssessment.status);
          const normalizedStatus = rawStatus.toLowerCase().replace(/_/g, '_');
          
          // Debug logging for Wellness assessments (always log in production for troubleshooting)
          if (apiType === 'WELLNESS') {
            console.log(`[Assessments] Wellness assessment status check:`, {
              rawStatus,
              normalizedStatus,
              assessmentId: apiAssessment.id,
              answerCount: apiAssessment.answer_count,
              totalQuestions: apiAssessment.total_questions,
              status: apiAssessment.status
            });
          }
          
          // Check status (backend returns: "completed", "in_progress", "not_started")
          // Normalize to lowercase for comparison
          const statusLower = rawStatus.toLowerCase().trim();
          
          // Always log for Wellness to debug
          if (apiType === 'WELLNESS') {
            console.log(`[Assessments] Status comparison for Wellness:`, {
              rawStatus,
              statusLower,
              matchesCompleted: statusLower === 'completed',
              answerCount: apiAssessment.answer_count,
              totalQuestions: apiAssessment.total_questions
            });
          }
          
          if (statusLower === 'completed') {
            status = 'completed';
          } else if (statusLower === 'in_progress' || statusLower === 'not_started') {
            status = 'in-progress';
          } else {
            // If status is unknown but assessment exists, check if it has all answers
            // This handles edge cases where status might not be updated correctly
            if (apiAssessment.answer_count !== undefined && 
                apiAssessment.total_questions !== undefined &&
                apiAssessment.answer_count >= apiAssessment.total_questions) {
              // All questions answered, treat as completed
              status = 'completed';
              console.warn(`[Assessments] Assessment ${apiAssessment.id} has all answers (${apiAssessment.answer_count}/${apiAssessment.total_questions}) but status is "${rawStatus}", treating as completed`);
            } else {
              // Log unknown status for debugging
              console.warn(`[Assessments] Unknown status "${rawStatus}" for assessment ${apiAssessment.id}, type ${apiType}`);
            }
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
          assessmentId: apiAssessment?.id,
          assessmentType: apiType,
          answerCount: apiAssessment?.answer_count,
          totalQuestions: apiAssessment?.total_questions,
        };
      });
      
      setAssessments(displayAssessments);
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
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
      console.error('Failed to start assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
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
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            Terminé
          </div>
        );
      case 'in-progress':
        return (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
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
    const isStarting = startingAssessment === assessment.assessmentType;
    
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
        return (
          <Button 
            variant="outline" 
            onClick={() => {
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
              }
            }}
          >
            Voir les résultats
          </Button>
        );
      case 'in-progress':
        // If all questions are answered, show "Voir les résultats" button
        if (assessment.answerCount !== undefined && 
            assessment.totalQuestions !== undefined && 
            assessment.answerCount === assessment.totalQuestions &&
            assessment.assessmentId) {
          return (
            <Button 
              variant="outline"
              disabled={isStarting}
              onClick={async () => {
                if (assessment.assessmentId) {
                  try {
                    setStartingAssessment(assessment.assessmentType);
                    // Submit the assessment first if not already submitted
                    await submitAssessment(assessment.assessmentId);
                    // Then redirect to results
                    if (assessment.assessmentType === 'TKI') {
                      router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
                    } else if (assessment.assessmentType === 'WELLNESS') {
                      router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
                    } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                      router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
                    }
                  } catch (err) {
                    console.error('Failed to submit assessment:', err);
                    // If submission fails, try to go to results anyway (might already be submitted)
                    if (assessment.assessmentType === 'TKI') {
                      router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
                    } else if (assessment.assessmentType === 'WELLNESS') {
                      router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
                    } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                      router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
                    }
                  } finally {
                    setStartingAssessment(null);
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
                'Voir les résultats'
              )}
            </Button>
          );
        }
        // Otherwise, show "Continuer" button
        return (
          <Button 
            variant="primary"
            disabled={isStarting}
            onClick={() => {
              if (assessment.requiresEvaluators) {
                setShowEvaluatorModal(true);
              } else {
                // For 360 feedback, include assessmentId in URL
                if (assessment.assessmentType === 'THREE_SIXTY_SELF' && assessment.assessmentId) {
                  router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessment.assessmentId}`);
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
            variant="primary"
            disabled={isStarting}
            onClick={() => handleStartAssessment(assessment.assessmentType, assessment.assessmentId)}
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

  if (isLoading) {
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadAssessments}>
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Vos assessments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez et gérez vos assessments de leadership
          </p>
        </div>
      </MotionDiv>

      <MotionDiv variant="slideUp" delay={100}>
        <Stack gap="normal">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            return (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-arise-deep-teal" size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assessment.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(assessment.status)}
                    {assessment.status === 'in-progress' && assessment.answerCount !== undefined && assessment.totalQuestions !== undefined && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {assessment.answerCount}/{assessment.totalQuestions}
                      </span>
                    )}
                    {assessment.externalLink && assessment.status !== 'completed' && (
                      <span className="px-3 py-1 border border-arise-deep-teal text-arise-deep-teal rounded-full text-xs font-medium">
                        Lien externe
                      </span>
                    )}
                    {getActionButton(assessment)}
                  </div>
                </div>
                {/* Progress bar */}
                {assessment.answerCount !== undefined && assessment.totalQuestions !== undefined && assessment.totalQuestions > 0 && (
                  <div className="mt-4">
                    <Progress
                      value={assessment.answerCount}
                      max={assessment.totalQuestions}
                      variant={assessment.status === 'completed' ? 'success' : 'default'}
                      size="md"
                      showLabel={true}
                      label={`Progression: ${assessment.answerCount}/${assessment.totalQuestions} questions`}
                    />
                  </div>
                )}
              </Card>
            );
          })}

          {/* 360 Feedback Evaluators Section */}
          {assessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF') && (
            <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-arise-gold/20 rounded-full flex items-center justify-center">
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
                  className="bg-arise-gold text-white hover:bg-arise-gold/90"
                  onClick={() => setShowEvaluatorModal(true)}
                >
                  Ajouter
                </Button>
              </div>
            </Card>
          )}
        </Stack>
      </MotionDiv>

      {/* Evaluator Modal */}
      {showEvaluatorModal && (() => {
        const feedback360Assessment = assessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF');
        if (!feedback360Assessment?.assessmentId) {
          return null;
        }
        return (
          <InviteAdditionalEvaluatorsModal
            isOpen={showEvaluatorModal}
            onClose={() => setShowEvaluatorModal(false)}
            assessmentId={feedback360Assessment.assessmentId}
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
    <ErrorBoundary>
      <AssessmentsContent />
    </ErrorBoundary>
  );
}
