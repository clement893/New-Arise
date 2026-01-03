'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Stack } from '@/components/ui';
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
          // Normalize status for comparison (backend can return various formats)
          // Backend enum values: "completed", "in_progress", "not_started" (or uppercase versions)
          const rawStatus = String(apiAssessment.status);
          
          // Normalize to lowercase and replace underscores/hyphens for consistent comparison
          const statusNormalized = rawStatus.toLowerCase().trim().replace(/[_-]/g, '');
          
          // Debug logging for Wellness assessments (always log in production for troubleshooting)
          if (apiType === 'WELLNESS') {
            console.log(`[Assessments] Wellness assessment status check:`, {
              rawStatus,
              statusNormalized,
              assessmentId: apiAssessment.id,
              answerCount: apiAssessment.answer_count,
              totalQuestions: apiAssessment.total_questions,
              status: apiAssessment.status
            });
          }
          
          // First, check if assessment is actually completed by checking answer count
          // This handles cases where status might not be updated correctly
          const hasAllAnswers = apiAssessment.answer_count !== undefined && 
                                apiAssessment.total_questions !== undefined &&
                                apiAssessment.total_questions > 0 &&
                                apiAssessment.answer_count >= apiAssessment.total_questions;
          
          if (hasAllAnswers) {
            // All questions answered, treat as completed regardless of status
            status = 'completed';
            if (statusNormalized !== 'completed') {
              console.log(`[Assessments] Assessment ${apiAssessment.id} (${apiType}) has all answers (${apiAssessment.answer_count}/${apiAssessment.total_questions}) but status is "${rawStatus}", treating as completed`);
            }
          } else if (statusNormalized === 'completed' || statusNormalized === 'complete') {
            // Status explicitly says completed
            status = 'completed';
          } else if (statusNormalized === 'inprogress' || statusNormalized === 'in_progress' || statusNormalized === 'notstarted' || statusNormalized === 'not_started') {
            // Status is in progress or not started, and not all answers are provided
            status = 'in-progress';
          } else {
            // Unknown status - log for debugging but default to in-progress if there are some answers
            console.warn(`[Assessments] Unknown status "${rawStatus}" for assessment ${apiAssessment.id}, type ${apiType}`);
            if (apiAssessment.answer_count !== undefined && apiAssessment.answer_count > 0) {
              status = 'in-progress';
            } else {
              status = 'available';
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
            className="!bg-[#0F454D] hover:!bg-[#0d4148] !text-white"
            style={{ backgroundColor: '#0F454D', color: '#ffffff' }}
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
          <MotionDiv variant="slideUp" delay={100}>
            <Stack gap="normal">
              {assessments.map((assessment) => {
                const Icon = assessment.icon;
                const is360Feedback = assessment.assessmentType === 'THREE_SIXTY_SELF';
                return (
                  <Card 
                    key={assessment.id} 
                    className="hover:shadow-lg transition-shadow"
                    style={is360Feedback ? { backgroundColor: '#e7eeef' } : undefined}
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
                    {/* Progress bar - always visible */}
                    <div className="mt-4">
                      {(() => {
                        // Calculate progress percentage
                        let progressValue = 0;
                        let progressMax = 100;
                        let progressLabel = 'Progression';
                        let progressPercentage = 0;
                        
                        if (assessment.status === 'completed') {
                          progressValue = 100;
                          progressMax = 100;
                          progressPercentage = 100;
                          progressLabel = 'Terminé';
                        } else if (assessment.status === 'in-progress' && 
                                   assessment.answerCount !== undefined && 
                                   assessment.totalQuestions !== undefined && 
                                   assessment.totalQuestions > 0) {
                          progressValue = assessment.answerCount;
                          progressMax = assessment.totalQuestions;
                          progressPercentage = Math.round((assessment.answerCount / assessment.totalQuestions) * 100);
                          progressLabel = `Progression: ${assessment.answerCount}/${assessment.totalQuestions} questions`;
                        } else if (assessment.status === 'available') {
                          progressValue = 0;
                          progressMax = 100;
                          progressPercentage = 0;
                          progressLabel = 'Non commencé';
                        } else if (assessment.status === 'locked') {
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
                                {progressLabel}
                              </span>
                              <span className="text-sm text-gray-600">{progressPercentage}%</span>
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
                      })()}
                    </div>
                    
                    {/* 360 Feedback Evaluators Section - integrated in the same Card */}
                    {is360Feedback && (
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
              })}
            </Stack>
          </MotionDiv>
        </div>
      </div>

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
