'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Card, Button, LoadingSkeleton, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import Image from 'next/image';
import { 
  Brain, 
  Target, 
  Users, 
  Heart,
  Info,
  CheckCircle,
  Lock,
  Eye
} from 'lucide-react';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType, get360Evaluators, EvaluatorStatus, submitAssessment } from '@/lib/api/assessments';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';
import { determineAssessmentStatus } from '@/lib/utils/assessmentStatus';

// Mapping of assessment types to display info
const ASSESSMENT_CONFIG: Record<string, { title: string; description: string; icon: typeof Brain; externalLink?: string }> = {
  MBTI: {
    title: 'MBTI Personality',
    description: 'Understanding your natural preferences',
    icon: Brain,
    externalLink: 'https://www.psychometrics.com/assessments/mbti/',
  },
  TKI: {
    title: 'TKI Conflict Style',
    description: 'Explore Your Conflict Management Approach',
    icon: Target,
  },
  THREE_SIXTY_SELF: {
    title: '360° Feedback',
    description: 'Multi-Faceted Leadership Perspectives',
    icon: Users,
  },
  WELLNESS: {
    title: 'Wellness',
    description: 'Your overall well-being',
    icon: Heart,
  },
};

function DashboardContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluators, setEvaluators] = useState<EvaluatorStatus[]>([]);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    // Load evaluators if user has a 360 feedback assessment
    const feedback360Assessment = assessments.find(
      a => a.assessment_type === 'THREE_SIXTY_SELF'
    );
    if (feedback360Assessment?.id) {
      loadEvaluators(feedback360Assessment.id);
    }
  }, [assessments]);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiAssessments = await getMyAssessments();
      
      // Create a map of existing assessments by type (keep most recent)
      const assessmentsMap = new Map<AssessmentType, ApiAssessment>();
      apiAssessments.forEach(assessment => {
        const existing = assessmentsMap.get(assessment.assessment_type);
        if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
          assessmentsMap.set(assessment.assessment_type, assessment);
        }
      });
      
      setAssessments(Array.from(assessmentsMap.values()));
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvaluators = async (assessmentId: number) => {
    try {
      const response = await get360Evaluators(assessmentId);
      setEvaluators(response.evaluators || []);
    } catch (err) {
      console.error('Failed to load evaluators:', err);
      // Don't show error, just set empty array
      setEvaluators([]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton variant="custom" className="h-10 w-64 mb-8" />
        <LoadingSkeleton variant="card" className="h-48 mb-8" />
        <LoadingSkeleton variant="card" className="h-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              variant="arise-primary"
              onClick={loadAssessments}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate progress data from real assessments
  const assessmentTypes: AssessmentType[] = ['MBTI', 'TKI', 'THREE_SIXTY_SELF', 'WELLNESS'];
  const progressItems = assessmentTypes.map(type => {
    const assessment = assessments.find(a => a.assessment_type === type);
    let percentage = 0;
    let color = 'gray';
    
    if (assessment) {
      // Normalize status: backend returns "not_started", "in_progress", "completed" (lowercase)
      const rawStatus = String(assessment.status);
      const statusNormalized = rawStatus.toLowerCase().trim().replace(/[_-]/g, '');
      
      // SPECIAL CASE: MBTI is external assessment (no internal questions)
      // Use backend status only
      if (type === 'MBTI') {
        if (statusNormalized === 'completed' || statusNormalized === 'complete') {
          percentage = 100;
          color = 'primary';
        } else {
          percentage = 0;
          color = 'gray';
        }
      } else {
        // For other assessments, calculate percentage based on answers
        const answerCount = assessment.answer_count ?? 0;
        const totalQuestions = assessment.total_questions ?? 0;
        
        // Check if completed: either status is completed OR all questions are answered
        const isCompleted = (statusNormalized === 'completed' || statusNormalized === 'complete') ||
                           (totalQuestions > 0 && answerCount === totalQuestions);
        
        if (isCompleted) {
          percentage = 100;
          color = 'primary';
        } else if (totalQuestions > 0) {
          // Calculate percentage based on answers
          percentage = Math.round((answerCount / totalQuestions) * 100);
          // Ensure percentage doesn't exceed 100
          percentage = Math.min(percentage, 100);
          color = percentage > 0 ? 'orange' : 'gray';
        } else {
          // No total questions available, use status
          if (statusNormalized === 'inprogress' || statusNormalized === 'inprogress') {
            percentage = 50; // Estimate if in progress
            color = 'orange';
          } else {
            percentage = 0;
            color = 'gray';
          }
        }
      }
    }
    
    return {
      label: ASSESSMENT_CONFIG[type]?.title || type,
      percentage,
      color,
    };
  });

  const overallProgress = Math.round(
    progressItems.reduce((sum, item) => sum + item.percentage, 0) / progressItems.length
  );

  const progressData = {
    overall: overallProgress,
    items: progressItems,
  };

  // Build evaluations list from real assessments
  type EvaluationItem = {
    title: string;
    description: string;
    status: 'completed' | 'in-progress' | 'locked' | 'available';
    icon: typeof Brain;
    assessmentType: AssessmentType;
    assessmentId?: number;
    answerCount?: number;
    totalQuestions?: number;
    externalLink?: string;
  };

  const evaluations = assessmentTypes
    .map(type => {
      const config = ASSESSMENT_CONFIG[type];
      if (!config) {
        return null;
      }
      const assessment = assessments.find(a => a.assessment_type === type);
      
      // Use utility function for consistent status determination
      const status = determineAssessmentStatus(assessment, type);
      
      const evaluation: EvaluationItem = {
        title: config.title,
        description: config.description,
        status,
        icon: config.icon,
        assessmentType: type,
        assessmentId: assessment?.id,
        answerCount: assessment?.answer_count,
        totalQuestions: assessment?.total_questions,
        externalLink: config.externalLink,
      };
      return evaluation;
    })
    .filter((evaluation): evaluation is EvaluationItem => evaluation !== null);

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
        return String(type).toLowerCase();
    }
  };

      const getStatusBadge = (status: string, answerCount?: number, totalQuestions?: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-100 text-success-700 text-xs rounded-full font-medium">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
              In Progress
            </span>
            {answerCount !== undefined && totalQuestions !== undefined && (
              <span className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
                {answerCount}/{totalQuestions}
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getActionButton = (evaluation: typeof evaluations[0]) => {
    if (evaluation.status === 'locked') {
      return (
        <Button variant="secondary" disabled className="w-full">
          Locked
        </Button>
      );
    }

    // Case: Completed → View Results
    if (evaluation.status === 'completed') {
      return (
        <Button 
          variant="outline" 
          className="w-full rounded-full"
          style={{ color: '#0F444C', borderColor: '#0F444C' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => {
            if (evaluation.assessmentType === 'TKI' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'WELLNESS' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'MBTI' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/mbti/results?id=${evaluation.assessmentId}`);
            }
          }}
        >
          View Results
        </Button>
      );
    }

    // Case: In progress with all answers → View Results (with auto submission)
    if (evaluation.status === 'in-progress' && 
        evaluation.answerCount !== undefined && 
        evaluation.totalQuestions !== undefined && 
        evaluation.answerCount >= evaluation.totalQuestions &&
        evaluation.assessmentId) {
      return (
        <Button 
          variant="outline" 
          className="w-full rounded-full"
          style={{ color: '#0F444C', borderColor: '#0F444C' }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={async () => {
            if (!evaluation.assessmentId) return;
            
            try {
              // Submit assessment first if not already submitted
              await submitAssessment(evaluation.assessmentId);
              // Then redirect to results
              if (evaluation.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
              } else if (evaluation.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
              } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
              } else if (evaluation.assessmentType === 'MBTI') {
                router.push(`/dashboard/assessments/mbti/results?id=${evaluation.assessmentId}`);
              }
            } catch (err) {
              console.error('Failed to submit assessment:', err);
              // If submission fails, try to go to results anyway (might already be submitted)
              if (evaluation.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
              } else if (evaluation.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
              } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
              } else if (evaluation.assessmentType === 'MBTI') {
                router.push(`/dashboard/assessments/mbti/results?id=${evaluation.assessmentId}`);
              }
            }
          }}
        >
          View Results
        </Button>
      );
    }

    // Case: In progress with partial answers → Continue
    if (evaluation.status === 'in-progress') {
      return (
        <Button 
          variant="outline"
          className="w-full font-semibold"
          style={{ color: '#0F454D', borderColor: '#0F454D' }}
          onClick={() => {
            router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
          }}
        >
          Continue
        </Button>
      );
    }

    // Case: Available or not started → Start
    return (
      <Button 
        variant="primary" 
        size="sm"
        className="w-full !bg-arise-gold-alt !text-arise-deep-teal-alt hover:!bg-arise-gold-alt/90 font-semibold"
        style={{ backgroundColor: 'var(--color-arise-gold-alt, #F4B860)', color: 'var(--color-arise-deep-teal-alt, #1B5E6B)' }}
        onClick={() => {
          router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
        }}
      >
        Start
      </Button>
    );
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'primary':
      case 'teal':
        return 'bg-arise-deep-teal';
      case 'orange':
        return 'bg-arise-gold';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="relative">
          {/* Welcome Header */}
          <MotionDiv variant="fade" duration="normal">
            <div className="mb-8 pb-6">
              <h1 className="text-4xl font-medium mb-2">
                <span className="text-white">Welcome</span> <span style={{ color: '#D5B667' }}>{user?.name?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="text-white text-lg">
                Continue your journey to authentic leadership
              </p>
            </div>
          </MotionDiv>

          {/* Wrapper for 3 sections with background color block */}
          <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
            {/* Background color block behind the 3 sections - starts a bit higher */}
            <div 
              className="absolute"
              style={{ 
                backgroundColor: '#D5DEE0',
                top: '-20px',
                bottom: 0,
                left: '-7.5%',
                right: '-7.5%',
                width: 'calc(100% + 15%)',
                zIndex: 0,
                borderRadius: '24px',
              }}
            />
            
            {/* Content sections with relative positioning */}
            <div className="relative z-10">
              {/* Feedback Banner */}
              <MotionDiv variant="slideUp" delay={100}>
                <Card className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e7eeef' }}
                      >
                        <Info className="text-arise-deep-teal" size={20} />
                      </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Add Your 360° Feedback: Evaluators
                      </h3>
                      <p className="text-sm text-gray-900">
                        Get comprehensive feedback by inviting colleagues to evaluate your leadership.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const feedback360Assessment = assessments.find(
                        a => a.assessment_type === 'THREE_SIXTY_SELF'
                      );
                      if (feedback360Assessment?.id) {
                        return (
                          <Link href={`/dashboard/evaluators?id=${feedback360Assessment.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="whitespace-nowrap font-semibold transition-colors flex flex-row items-center gap-2 text-sm"
                              style={{ color: '#0F444C', borderColor: '#0F444C' }}
                              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
                              }}
                              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Eye size={16} />
                              {evaluators.length > 0 ? `View Evaluators (${evaluators.length})` : 'View Evaluators'}
                            </Button>
                          </Link>
                        );
                      }
                      return null;
                    })()}
                    <Button 
                      variant="arise-primary"
                      size="sm"
                      className="whitespace-nowrap font-semibold text-sm"
                      onClick={() => {
                        // Check if a 360° feedback assessment already exists
                        const feedback360Assessment = assessments.find(
                          a => a.assessment_type === 'THREE_SIXTY_SELF'
                        );
                        
                        if (feedback360Assessment?.id) {
                          // Open modal directly if assessment exists
                          setShowEvaluatorModal(true);
                        } else {
                          // Redirect to start page if no assessment exists yet
                          router.push('/dashboard/assessments/360-feedback/start');
                        }
                      }}
                    >
                      Add Evaluators
                    </Button>
                  </div>
                  </div>
                </Card>
              </MotionDiv>

              {/* Progress Section */}
              <MotionDiv variant="slideUp" delay={200}>
                <Card 
                  className="mb-8 text-white border-0"
                  style={{ backgroundColor: '#0F454D' }}
                >
                  <div className="flex justify-between items-start mb-6 gap-8">
                    <div className="flex-1">
                      <h2 className="text-2xl font-medium mb-2 text-white">Your Progress</h2>
                      <div className="text-6xl font-medium mb-2" style={{ color: '#d5b667' }}>{progressData.overall} %</div>
                      <p className="text-white/90 mb-1">
                        You are making good progress in your holistic leadership journey. Keep it up!
                      </p>
                    </div>
                    
                    {/* Progress Bars - Right side */}
                    <div className="flex-1 space-y-4 min-w-[200px]">
                    {progressData.items.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          <span className="text-sm font-semibold" style={{ color: '#d5b667' }}>{item.percentage} %</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className={`${getProgressColor(item.color)} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      variant="primary" 
                      className="font-semibold"
                      style={{ backgroundColor: '#d5b667', color: '#000000' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = '#d5b667';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = '#d5b667';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onClick={() => router.push('/dashboard/assessments')}
                    >
                      Continue Learning
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-arise-button-primary border-2 font-semibold"
                      style={{ 
                        borderColor: '#799ba1',
                        color: '#FFFFFF',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = 'rgba(121, 155, 161, 0.1)';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => router.push('/dashboard/results')}
                    >
                      View Reports
                    </Button>
                  </div>
                </Card>
              </MotionDiv>

              {/* Evaluations Section */}
              <MotionDiv variant="slideUp" delay={300}>
                <div className="mb-32">
                  <div className="flex items-center justify-start mb-6">
                    <h2 className="text-2xl font-medium text-gray-900">Your evaluations</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {evaluations.map((evaluation, index) => {
                      const Icon = evaluation.icon;
                      return (
                        <Card 
                          key={index} 
                          className={`group relative transition-all duration-300 ${evaluation.status === 'locked' ? 'opacity-60' : ''}`}
                          onMouseEnter={evaluation.status !== 'locked' ? (e: React.MouseEvent<HTMLDivElement>) => {
                            const cardElement = e.currentTarget;
                            cardElement.style.backgroundColor = 'rgba(15, 76, 86, 0.2)';
                            cardElement.style.setProperty('--glassmorphism-card-background', 'rgba(15, 76, 86, 0.2)');
                          } : undefined}
                          onMouseLeave={evaluation.status !== 'locked' ? (e: React.MouseEvent<HTMLDivElement>) => {
                            const cardElement = e.currentTarget;
                            cardElement.style.backgroundColor = '';
                            cardElement.style.removeProperty('--glassmorphism-card-background');
                          } : undefined}
                          style={{
                            backgroundColor: evaluation.status === 'locked' ? undefined : 'transparent',
                          }}
                        >
                          <Stack gap="normal">
                            {/* Icon in upper left corner */}
                            <div 
                              className="absolute top-4 left-4 w-12 h-12 rounded-lg flex items-center justify-center z-10"
                              style={{ backgroundColor: '#e7eeef' }}
                            >
                              <Icon className="text-arise-deep-teal" size={24} />
                            </div>
                            {/* Status badges */}
                            <div className="flex items-start justify-end">
                              {/* Badges based on assessment type */}
                              {evaluation.assessmentType === 'MBTI' && evaluation.externalLink && (
                                <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                                  External link
                                </span>
                              )}
                              {evaluation.assessmentType === 'TKI' && (
                                <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                                  Label
                                </span>
                              )}
                              {evaluation.assessmentType === 'THREE_SIXTY_SELF' && (
                                <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                                  ARISE Platform
                                </span>
                              )}
                              {evaluation.assessmentType === 'WELLNESS' && (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="w-3 h-3 text-gray-600" />
                                </div>
                              )}
                            </div>
                            {/* Add padding top to account for icon */}
                            <div className="pt-12">
                              {/* Title and Description */}
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  {evaluation.title}
                                </h3>
                                <p className="text-sm text-gray-900 mb-4">
                                  {evaluation.description}
                                </p>
                              </div>
                            </div>

                            {/* Status Badge */}
                            {evaluation.status === 'locked' ? (
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">Locked</span>
                              </div>
                            ) : (
                              getStatusBadge(evaluation.status, evaluation.answerCount, evaluation.totalQuestions)
                            )}

                            {/* Action Button */}
                            <div className="mt-auto flex items-end">
                              {getActionButton(evaluation)}
                            </div>
                          </Stack>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </MotionDiv>
            </div>
          </div>

          {/* Coaching Section */}
          <MotionDiv variant="slideUp" delay={400}>
            <Card 
              className="text-white border-0 overflow-hidden" 
              style={{ 
                backgroundColor: '#2E2E2E',
                marginLeft: '-7.5%',
                marginRight: '-7.5%',
                width: 'calc(100% + 15%)',
                borderRadius: '24px',
                paddingLeft: 'calc(7.5% + 2rem)',
                paddingRight: 'calc(7.5% + 2rem)',
                paddingTop: '2rem',
                paddingBottom: '2rem',
              }}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-medium mb-3">
                    Ready to accelerate your growth?
                  </h2>
                  <p className="text-white/90 mb-4 break-words">
                    Connect with expert ARISE coaches who specialize in leadership development. 
                    Schedule your FREE coaching session to debrief your results and build a personalized development plan.
                  </p>
                  <Button 
                    variant="arise-primary"
                    onClick={() => router.push('/dashboard/coaching-options')}
                  >
                    Explore coaching options →
                  </Button>
                </div>
                <div className="relative w-48 h-48 flex-shrink-0">
                  <Image
                    src="/images/leader-4.jpg"
                    alt="Coaching session"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Evaluator Modal */}
          {showEvaluatorModal && (() => {
            const feedback360Assessment = assessments.find(
              a => a.assessment_type === 'THREE_SIXTY_SELF'
            );
            if (!feedback360Assessment?.id) {
              return null;
            }
            return (
              <InviteAdditionalEvaluatorsModal
                isOpen={showEvaluatorModal}
                onClose={() => setShowEvaluatorModal(false)}
                assessmentId={feedback360Assessment.id}
                onSuccess={() => {
                  setShowEvaluatorModal(false);
                  loadAssessments(); // Reload to refresh evaluator status
                }}
              />
            );
          })()}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
