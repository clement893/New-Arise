'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, Button, LoadingSkeleton, Grid, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { 
  Brain, 
  Target, 
  Users, 
  Heart,
  Info,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType } from '@/lib/api/assessments';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';

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

  useEffect(() => {
    loadAssessments();
  }, []);

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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton variant="custom" className="h-10 w-64 mb-8" />
        <LoadingSkeleton variant="card" className="h-48 mb-8" />
        <LoadingSkeleton variant="card" className="h-64 mb-8" />
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
        </Grid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
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

  // Calculate progress data from real assessments
  const assessmentTypes: AssessmentType[] = ['MBTI', 'TKI', 'THREE_SIXTY_SELF', 'WELLNESS'];
  const progressItems = assessmentTypes.map(type => {
    const assessment = assessments.find(a => a.assessment_type === type);
    let percentage = 0;
    let color = 'gray';
    
    if (assessment) {
      if (assessment.status === 'COMPLETED') {
        percentage = 100;
        color = 'teal';
      } else if (assessment.status === 'IN_PROGRESS' || assessment.status === 'NOT_STARTED') {
        // Calculate percentage based on answers
        const answerCount = assessment.answer_count || 0;
        const totalQuestions = assessment.total_questions || 30;
        percentage = totalQuestions > 0 ? Math.round((answerCount / totalQuestions) * 100) : 0;
        color = percentage > 0 ? 'orange' : 'gray';
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
      
      let status: 'completed' | 'in-progress' | 'locked' | 'available' = 'available';
      if (assessment) {
        if (assessment.status === 'COMPLETED') {
          status = 'completed';
        } else if (assessment.status === 'IN_PROGRESS' || assessment.status === 'NOT_STARTED') {
          status = 'in-progress';
        }
      }
      
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
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            <CheckCircle size={12} />
            Terminé
          </span>
        );
      case 'in-progress':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              En cours
            </span>
            {answerCount !== undefined && totalQuestions !== undefined && (
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
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
          Verrouillé
        </Button>
      );
    }

    if (evaluation.status === 'completed') {
      return (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            if (evaluation.assessmentType === 'TKI' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'WELLNESS' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'MBTI' && evaluation.externalLink) {
              window.open(evaluation.externalLink, '_blank');
            }
          }}
        >
          Voir les résultats
        </Button>
      );
    }

    return (
      <Button 
        variant="primary" 
        className="w-full"
        onClick={() => {
          router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
        }}
      >
        {evaluation.status === 'in-progress' ? 'Continuer' : 'Commencer'}
      </Button>
    );
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'teal':
        return 'bg-arise-deep-teal';
      case 'orange':
        return 'bg-arise-gold';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div>
          {/* Welcome Header */}
          <MotionDiv variant="fade" duration="normal">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-gray-600 text-lg">
                Continue your journey to authentic leadership
              </p>
            </div>
          </MotionDiv>

          {/* Feedback Banner */}
          <MotionDiv variant="slideUp" delay={100}>
            <Card className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-arise-deep-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Add Your 360° Feedback Evaluators
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get comprehensive feedback by inviting colleagues to evaluate your leadership.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  className="whitespace-nowrap"
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
                  Ajouter des évaluateurs
                </Button>
              </div>
            </Card>
          </MotionDiv>

          {/* Progress Section */}
          <MotionDiv variant="slideUp" delay={200}>
            <Card 
              className="mb-8 text-white border-0"
              style={{ backgroundColor: 'rgba(10, 58, 64, 0.9)' } as React.CSSProperties}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Your Progress</h2>
                  <div className="text-6xl font-bold mb-2 text-white">{progressData.overall} %</div>
                  <p className="text-white/80 mb-1">
                    You are making good progress in your holistic leadership journey.
                  </p>
                  <p className="text-white font-semibold">Keep it up!</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 mb-6">
                {progressData.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.percentage} %</span>
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

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  variant="primary" 
                  className="bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90"
                  onClick={() => router.push('/dashboard/assessments')}
                >
                  Continuer les assessments
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10"
                  onClick={() => router.push('/dashboard/results')}
                >
                  Voir les rapports
                </Button>
              </div>
            </Card>
          </MotionDiv>

          {/* Evaluations Section */}
          <MotionDiv variant="slideUp" delay={300}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your evaluations</h2>
              <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
                {evaluations.map((evaluation, index) => {
                  const Icon = evaluation.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`${evaluation.status === 'locked' ? 'opacity-60' : ''}`}
                    >
                      <Stack gap="normal">
                        {/* Icon and Status */}
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="text-arise-deep-teal" size={24} />
                          </div>
                          {evaluation.externalLink && evaluation.status !== 'completed' && (
                            <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                              Lien externe
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {evaluation.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {evaluation.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        {getStatusBadge(evaluation.status, evaluation.answerCount, evaluation.totalQuestions)}

                        {/* Action Button */}
                        <div className="mt-auto">
                          {getActionButton(evaluation)}
                        </div>
                      </Stack>
                    </Card>
                  );
                })}
              </Grid>
            </div>
          </MotionDiv>

          {/* Coaching Section */}
          <MotionDiv variant="slideUp" delay={400}>
            <Card 
              className="text-white border-0 relative overflow-hidden"
              style={{ backgroundColor: 'rgba(10, 58, 64, 0.9)' } as React.CSSProperties}
            >
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255, 255, 255, 0.1) 50px, rgba(255, 255, 255, 0.1) 51px)'
                }}
              />

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to accelerate your growth?
                </h2>
                <p className="text-white/90 mb-6 max-w-2xl">
                  Connect with expert ARISE coaches who specialize in leadership development. 
                  Schedule your FREE coaching session to debrief your results and build a 
                  personalized development plan.
                </p>
                <Button 
                  variant="primary" 
                  className="bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90 flex items-center gap-2"
                  onClick={() => router.push('/dashboard/coaching-options')}
                >
                  Explore coaching options
                  <ArrowRight size={20} />
                </Button>
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
