'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { Card, Button, LoadingSkeleton } from '@/components/ui';
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
import { useMySubscription } from '@/lib/query/queries';

function DashboardContent() {
  const t = useTranslations('dashboard.main');
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: subscriptionData, refetch: refetchSubscription } = useMySubscription();
  
  // Mapping of assessment types to display info - translated
  const ASSESSMENT_CONFIG: Record<string, { title: string; description: string; icon: typeof Brain; externalLink?: string }> = {
    MBTI: {
      title: t('assessments.mbti.title'),
      description: t('assessments.mbti.description'),
      icon: Brain,
      externalLink: 'https://www.psychometrics.com/assessments/mbti/',
    },
    TKI: {
      title: t('assessments.tki.title'),
      description: t('assessments.tki.description'),
      icon: Target,
    },
    THREE_SIXTY_SELF: {
      title: t('assessments.360.title'),
      description: t('assessments.360.description'),
      icon: Users,
    },
    WELLNESS: {
      title: t('assessments.wellness.title'),
      description: t('assessments.wellness.description'),
      icon: Heart,
    },
  };
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState<ApiAssessment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluators, setEvaluators] = useState<EvaluatorStatus[]>([]);

  useEffect(() => {
    // Only load assessments if user is authenticated
    if (user) {
      loadAssessments();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Reload assessments when subscription changes (plan upgrade/downgrade)
  useEffect(() => {
    if (user && subscriptionData) {
      // Reload assessments to reflect new plan features
      loadAssessments();
    }
  }, [subscriptionData?.data?.data?.plan_id, subscriptionData?.data?.plan_id]);

  // Refresh subscription data when coming from payment success page
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let pollInterval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;
    
    if (searchParams.get('refresh') === 'true') {
      // Clear subscription cache immediately
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('subscription_cache');
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      // Force refetch subscription data immediately
      refetchSubscription();
      
      // Also poll for updates (webhook might take a few seconds)
      pollInterval = setInterval(() => {
        refetchSubscription();
      }, 2000); // Poll every 2 seconds
      
      // Stop polling after 20 seconds
      timeout = setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      }, 20000);
      
      // Remove refresh parameter from URL
      searchParams.delete('refresh');
      const newUrl = window.location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
    
    // Always return cleanup function
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [refetchSubscription]);

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
    // Clear cache before loading to ensure fresh data
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('subscription_cache');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
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
      setError(err instanceof Error ? err.message : t('errors.loadFailed'));
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
              {t('errors.tryAgain')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Helper function to normalize plan name (remove price and extra spaces)
  const normalizePlanName = (planName: string): string => {
    if (!planName) return '';
    let normalized = planName.toUpperCase().trim();
    normalized = normalized.replace(/\s*\$\d+.*$/i, '').trim();
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  };

  // Helper function to check if an assessment is available for the current plan
  const isAssessmentAvailableForPlan = (assessmentType: AssessmentType): boolean => {
    try {
      // Get subscription data from React Query response
      const actualSubscriptionData = subscriptionData?.data?.data || subscriptionData?.data;
      
      // Helper function to get plan from cache
      const getPlanFromCache = (): { planName: string; planFeatures: string | null } | null => {
        if (typeof window === 'undefined') return null;
        try {
          const cachedSubscription = localStorage.getItem('subscription_cache');
          if (cachedSubscription) {
            const parsed = JSON.parse(cachedSubscription);
            if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              const cachedData = parsed.data;
              if (cachedData?.plan) {
                return {
                  planName: (cachedData.plan.name?.toUpperCase() || '').replace(/\s*\$\d+.*$/i, '').trim(),
                  planFeatures: cachedData.plan.features || null
                };
              }
            }
          }
        } catch (e) {
          // Ignore cache errors
        }
        return null;
      };

      // Get plan name and features
      let planName = '';
      let planFeatures: string | null = null;

      // Always prefer fresh subscription data over cache
      if (actualSubscriptionData?.plan) {
        planName = normalizePlanName(actualSubscriptionData.plan.name || '');
        planFeatures = actualSubscriptionData.plan.features || null;
        
        // Update cache with fresh data
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('subscription_cache', JSON.stringify({
              data: actualSubscriptionData,
              timestamp: Date.now()
            }));
          } catch (e) {
            // Ignore cache errors
          }
        }
      } else {
        // Only use cache if no fresh data available
        const cachedPlan = getPlanFromCache();
        if (cachedPlan) {
          planName = cachedPlan.planName;
          planFeatures = cachedPlan.planFeatures;
        }
      }

      // If no plan found, show all assessments
      if (!planName) {
        return true;
      }

      // Parse plan features
      let features: Record<string, boolean> = {};
      const hasFeatures = !!planFeatures;
      if (planFeatures) {
        try {
          features = JSON.parse(planFeatures);
        } catch (e) {
          // If parsing fails, fall back to plan-name-based rules
        }
      }

      // REVELATION plan: all assessments available
      if (planName === 'REVELATION') {
        return true;
      }

      // SELF EXPLORATION plan: Professional Assessment (TKI) + Wellness Pulse
      if (planName === 'SELF EXPLORATION') {
        if (assessmentType === 'TKI' || assessmentType === 'WELLNESS') {
          // If features are available, check the feature flag; otherwise, allow by default
          if (hasFeatures) {
            if (assessmentType === 'TKI' && features.professional_assessment !== undefined) {
              return features.professional_assessment === true;
            }
            if (assessmentType === 'WELLNESS' && features.wellness_pulse !== undefined) {
              return features.wellness_pulse === true;
            }
          }
          // Fallback: SELF EXPLORATION includes TKI and WELLNESS by default
          return true;
        }
        // MBTI and 360 are not available in SELF EXPLORATION
        return false;
      }

      // WELLNESS plan: only Wellness Pulse
      if (planName === 'WELLNESS') {
        if (assessmentType === 'WELLNESS') {
          // If features are available, check the feature flag; otherwise, allow by default
          if (hasFeatures && features.wellness_pulse !== undefined) {
            return features.wellness_pulse === true;
          }
          // Fallback: WELLNESS plan includes WELLNESS assessment by default
          return true;
        }
        // All other assessments are not available in WELLNESS plan
        return false;
      }

      // Default: allow if not explicitly restricted
      return true;
    } catch (error) {
      // If any error occurs, show all assessments to avoid blocking the user
      return true;
    }
  };

  // Calculate progress data from real assessments
  // Order: MBTI, TKI (ARISE Conflict Style), 360 Feedback, Wellness
  const assessmentTypes: AssessmentType[] = ['MBTI', 'TKI', 'THREE_SIXTY_SELF', 'WELLNESS'];
  
  // Filter assessment types based on plan
  const availableAssessmentTypes = assessmentTypes.filter(type => isAssessmentAvailableForPlan(type));
  
  const progressItems = availableAssessmentTypes.map(type => {
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

  const overallProgress = progressItems.length > 0
    ? Math.round(progressItems.reduce((sum, item) => sum + item.percentage, 0) / progressItems.length)
    : 0;

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

  const evaluations = availableAssessmentTypes
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
            {t('status.completed')}
          </span>
        );
      case 'in-progress':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
              {t('status.inProgress')}
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
          {t('actions.locked')}
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
            // Navigate to Results & Reports section for all assessments
            router.push('/dashboard/reports');
          }}
        >
          {t('actions.viewResults')}
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
              // Then redirect to Results & Reports section
              router.push('/dashboard/reports');
            } catch (err) {
              console.error('Failed to submit assessment:', err);
              // If submission fails, try to go to results anyway (might already be submitted)
              router.push('/dashboard/reports');
            }
          }}
        >
          {t('actions.viewResults')}
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
          {t('actions.continue')}
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
        {t('actions.start')}
      </Button>
    );
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'primary':
      case 'teal':
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
                <span className="text-white">{t('welcome.title')}</span> <span style={{ color: '#D5B667' }}>{user?.name?.split(' ')[0] || t('welcome.user')}</span>
              </h1>
              <p className="text-white text-lg">
                {t('welcome.subtitle')}
              </p>
            </div>
          </MotionDiv>

          {/* Wrapper for 3 sections with background color block */}
          <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
            {/* Background color block behind the 3 sections - starts a bit higher */}
            <div 
              className="absolute md:left-[-7.5%] md:right-[-7.5%] md:w-[calc(100%+15%)]"
              style={{ 
                backgroundColor: '#D5DEE0',
                top: '-20px',
                bottom: 0,
                left: '0',
                right: '0',
                zIndex: 0,
                borderRadius: '24px',
                width: '100%',
                margin: 'auto',
              }}
            />
            
            {/* Content sections with relative positioning */}
            <div className="relative z-10 w-full md:w-auto mx-auto px-2 sm:px-4">
              {/* Feedback Banner */}
              <MotionDiv variant="slideUp" delay={100}>
                <Card className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e7eeef' }}
                      >
                        <Info className="text-arise-deep-teal" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                          {t('contributorsBanner.title')}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-900">
                          {t('contributorsBanner.description')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {(() => {
                      const feedback360Assessment = assessments.find(
                        a => a.assessment_type === 'THREE_SIXTY_SELF'
                      );
                      if (feedback360Assessment?.id) {
                        return (
                          <Link href={`/dashboard/evaluators?id=${feedback360Assessment.id}`} className="w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full sm:w-auto whitespace-nowrap font-semibold transition-colors flex flex-row items-center justify-center gap-2 text-xs sm:text-sm"
                              style={{ color: '#0F444C', borderColor: '#0F444C' }}
                              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
                              }}
                              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Eye size={16} />
                              <span className="truncate">{evaluators.length > 0 ? t('contributorsBanner.viewContributorsWithCount', { count: evaluators.length }) : t('contributorsBanner.viewContributors')}</span>
                            </Button>
                          </Link>
                        );
                      }
                      return null;
                    })()}
                    <Button 
                      variant="arise-primary"
                      size="sm"
                      className="w-full sm:w-auto whitespace-nowrap font-semibold text-xs sm:text-sm"
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
                      {t('contributorsBanner.addContributors')}
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
                  <div className="flex md:flex-row flex-col md:justify-between md:items-start md:mb-6 md:gap-8 gap-4">
                    <div className="flex-1 w-full">
                      <h2 className="text-xl sm:text-2xl font-medium mb-2 text-white">{t('progress.title')}</h2>
                      <div className="text-4xl sm:text-6xl font-medium mb-2" style={{ color: '#d5b667' }}>{progressData.overall} %</div>
                      <p className="text-sm sm:text-base text-white/90 mb-1">
                        {t('progress.description')}
                      </p>
                    </div>
                    
                    {/* Progress Bars - Right side */}
                    <div className="flex-1 w-full md:min-w-[200px] space-y-4">
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
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:mt-0 mt-4">
                    <Button 
                      variant="primary" 
                      className="w-full sm:w-auto font-semibold px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
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
                      {t('progress.continueLearning')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto bg-arise-button-primary border-2 font-semibold px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
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
                      onClick={() => router.push('/dashboard/reports')}
                    >
                      {t('progress.viewReports')}
                    </Button>
                  </div>
                </Card>
              </MotionDiv>

              {/* Evaluations Section */}
              <MotionDiv variant="slideUp" delay={300}>
                <div className="mb-8 sm:mb-16 md:mb-32">
                  <div className="flex items-center justify-start mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-medium text-gray-900">{t('evaluations.title')}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {evaluations.map((evaluation, index) => {
                      const Icon = evaluation.icon;
                      return (
                        <Card 
                          key={index} 
                          className={`group relative transition-all duration-300 flex flex-col h-full ${evaluation.status === 'locked' ? 'opacity-60' : ''}`}
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
                            backgroundColor: evaluation.status === 'locked' ? undefined : '#FFFFFF',
                          }}
                        >
                          <div className="flex flex-col h-full">
                            {/* Icon in upper left corner */}
                            <div 
                              className="absolute top-4 left-4 w-12 h-12 rounded-lg flex items-center justify-center z-10"
                              style={{ backgroundColor: '#e7eeef' }}
                            >
                              <Icon className="text-arise-deep-teal" size={24} />
                            </div>
                            {/* Status badges */}
                            <div className="flex items-start justify-end mb-4">
                              {/* Badges based on assessment type */}
                              {evaluation.assessmentType === 'MBTI' && evaluation.externalLink && (
                                <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                                  {t('badges.externalLink')}
                                </span>
                              )}
                              {evaluation.assessmentType === 'TKI' && (
                                <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                                  {t('badges.label')}
                                </span>
                              )}
                              {evaluation.assessmentType === 'THREE_SIXTY_SELF' && (
                                <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                                  {t('badges.arisePlatform')}
                                </span>
                              )}
                              {evaluation.assessmentType === 'WELLNESS' && (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="w-3 h-3 text-gray-600" />
                                </div>
                              )}
                            </div>
                            {/* Add padding top to account for icon */}
                            <div className="md:pt-12 pt-6 flex-1 flex flex-col">
                              {/* Title and Description */}
                              <div className="mb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  {evaluation.title}
                                </h3>
                                <p className="text-sm text-gray-900">
                                  {evaluation.description}
                                </p>
                              </div>

                              {/* Status Badge */}
                              <div className="mb-4">
                                {evaluation.status === 'locked' ? (
                                  <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">{t('status.locked')}</span>
                                  </div>
                                ) : (
                                  getStatusBadge(evaluation.status, evaluation.answerCount, evaluation.totalQuestions)
                                )}
                              </div>

                              {/* Action Button - pushed to bottom */}
                              <div className="mt-auto">
                                {getActionButton(evaluation)}
                              </div>
                            </div>
                          </div>
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
              className="text-white border-0 overflow-hidden p-4 sm:p-6 md:pl-[calc(7.5%+2rem)] md:pr-[calc(7.5%+2rem)] md:pt-8 md:pb-8" 
              style={{ 
                backgroundColor: '#2E2E2E',
                borderRadius: '24px',
              }}
            >
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-1 min-w-0 w-full">
                  <h2 className="text-xl sm:text-2xl font-medium mb-2 sm:mb-3">
                    {t('coaching.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90 mb-4 break-words">
                    {t('coaching.description')}
                  </p>
                  <Button 
                    variant="arise-primary"
                    className="w-full sm:w-auto text-sm sm:text-base"
                    onClick={() => router.push('/dashboard/coaching-options')}
                  >
                    {t('coaching.exploreOptions')}
                  </Button>
                </div>
                <div className="relative w-full sm:w-48 h-48 flex-shrink-0 mt-4 md:mt-0">
                  <Image
                    src="/images/leader-4.jpg"
                    alt={t('coaching.imageAlt')}
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
