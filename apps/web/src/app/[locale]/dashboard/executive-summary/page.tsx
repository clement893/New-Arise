'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Card, Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { 
  Brain, 
  Target, 
  Users, 
  Heart,
  UserCheck,
  TrendingUp,
  Download,
  ArrowLeft
} from 'lucide-react';
import { getMyAssessments, getAssessmentResults, AssessmentType } from '@/lib/api/assessments';
import { formatError } from '@/lib/utils/formatError';
import { useMySubscription } from '@/lib/query/queries';

function ExecutiveSummaryContent() {
  const router = useRouter();
  const { data: subscriptionData } = useMySubscription();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get subscription data from React Query response
    // React Query wraps axios response in { data: AxiosResponse }
    // So subscriptionData.data is the AxiosResponse, and subscriptionData.data.data is the actual data
    const actualSubscriptionData = subscriptionData?.data?.data || subscriptionData?.data;
    
    // Check if user has access to Executive Summary based on their plan
    if (actualSubscriptionData?.plan) {
      // Normalize plan name to handle cases like "WELLNESS $99" -> "WELLNESS"
      const rawPlanName = actualSubscriptionData.plan.name?.toUpperCase() || '';
      const planName = rawPlanName.replace(/\s*\$\d+.*$/i, '').trim();
      const planFeatures = actualSubscriptionData.plan.features;
      
      // Parse plan features
      let features: Record<string, boolean> = {};
      if (planFeatures) {
        try {
          features = JSON.parse(planFeatures);
        } catch (e) {
          console.error('[Executive Summary] Failed to parse plan features:', e);
        }
      }

      // WELLNESS plan doesn't have access to Executive Summary
      if (planName === 'WELLNESS') {
        setError('Executive Summary is not available in your current plan. Please upgrade to SELF EXPLORATION or REVELATION to access this feature.');
        setIsLoading(false);
        return;
      }

      // SELF EXPLORATION and REVELATION have access if executive_summary feature is true
      if (planName !== 'REVELATION' && features.executive_summary !== true) {
        setError('Executive Summary is not available in your current plan. Please upgrade to access this feature.');
        setIsLoading(false);
        return;
      }
    }

    loadSummaryData();
  }, [subscriptionData]);

  const loadSummaryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all assessments
      const allAssessments = await getMyAssessments();
      const completedAssessments = allAssessments.filter(
        (a) => a.status === 'completed' || a.status === 'COMPLETED'
      );
      setAssessments(completedAssessments);

      // Load results for completed assessments
      const resultsMap: Record<string, any> = {};
      for (const assessment of completedAssessments) {
        try {
          const assessmentResults = await getAssessmentResults(assessment.id);
          resultsMap[assessment.assessment_type] = assessmentResults;
        } catch (err) {
          console.error(`Failed to load results for ${assessment.assessment_type}:`, err);
        }
      }
      setResults(resultsMap);
    } catch (err: unknown) {
      const errorMessage = formatError(err);
      console.error('Failed to load executive summary:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // TODO: Implement PDF download functionality
    alert('PDF download functionality will be implemented soon.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 text-center">
          <p className="text-gray-600">Loading executive summary...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadSummaryData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const assessmentTypes: AssessmentType[] = ['MBTI', 'TKI', 'THREE_SIXTY_SELF', 'WELLNESS'];
  const assessmentConfig: Record<AssessmentType, { icon: typeof Brain; title: string; color: string }> = {
    MBTI: { icon: Brain, title: 'MBTI Personality', color: '#0F4C56' },
    TKI: { icon: Target, title: 'ARISE Conflict Style', color: '#0F4C56' },
    THREE_SIXTY_SELF: { icon: Users, title: '360° Feedback', color: '#0F4C56' },
    THREE_SIXTY_EVALUATOR: { icon: UserCheck, title: '360° Evaluator', color: '#0F4C56' },
    WELLNESS: { icon: Heart, title: 'Wellness Assessment', color: '#0F4C56' },
  };

  const completedCount = assessments.length;
  const totalCount = assessmentTypes.length;

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 pb-6">
          <Button
            variant="primary"
            onClick={() => router.push('/dashboard')}
            className="mb-4 flex items-center gap-4"
            style={{ backgroundColor: '#0F4C56', color: '#fff' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Executive Summary
          </h1>
          <p className="text-white/90">
            Comprehensive overview of your leadership assessment results
          </p>
        </div>

        {/* Summary Card */}
        <MotionDiv variant="slideUp" duration="normal">
          <Card className="mb-8 bg-gradient-to-br from-arise-deep-teal to-arise-deep-teal/80 text-white">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp size={48} className="mr-4" />
                <div>
                  <div className="text-4xl font-bold mb-2">
                    {completedCount} / {totalCount}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Assessments Completed</h2>
                  <p className="text-white/90">
                    {completedCount === totalCount 
                      ? 'You have completed all assessments!'
                      : `Complete ${totalCount - completedCount} more assessment${totalCount - completedCount > 1 ? 's' : ''} for a complete profile.`
                    }
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  className="bg-white text-arise-deep-teal hover:bg-gray-100"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Executive Summary PDF
                </Button>
              </div>
            </div>
          </Card>
        </MotionDiv>

        {/* Assessment Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {assessmentTypes.map((type, index) => {
            const assessment = assessments.find(a => a.assessment_type === type);
            const assessmentResult = results[type];
            const config = assessmentConfig[type];
            const Icon = config.icon;

            return (
              <MotionDiv 
                key={type}
                variant="slideUp"
                duration="normal"
                delay={index * 0.1}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
                      <Icon className="text-arise-deep-teal" size={24} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 break-words">
                        {config.title}
                      </h3>
                      {assessment ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                            <span className="text-sm text-success-700 font-medium">Completed</span>
                          </div>
                          {assessmentResult?.scores?.percentage !== undefined && (
                            <div className="text-sm text-gray-600">
                              Score: {typeof assessmentResult.scores.percentage === 'number' 
                                ? `${assessmentResult.scores.percentage.toFixed(0)}%`
                                : 'N/A'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-500">Not completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {assessment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (type === 'TKI') {
                          router.push(`/dashboard/assessments/tki/results?id=${assessment.id}`);
                        } else if (type === 'WELLNESS') {
                          router.push(`/dashboard/assessments/results?id=${assessment.id}`);
                        } else if (type === 'THREE_SIXTY_SELF') {
                          router.push('/dashboard/assessments/360-feedback/results');
                        } else {
                          router.push(`/dashboard/assessments/results?id=${assessment.id}`);
                        }
                      }}
                      style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                    >
                      View Detailed Results
                    </Button>
                  )}
                </Card>
              </MotionDiv>
            );
          })}
        </div>

        {/* Key Insights */}
        {completedCount > 0 && (
          <MotionDiv variant="fade" duration="normal">
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Key Leadership Insights
              </h2>
              <div className="space-y-4">
                {completedCount === totalCount && (
                  <div className="p-4 bg-success-50 rounded-lg break-words">
                    <h3 className="font-bold text-success-900 mb-2">Complete Profile</h3>
                    <p className="text-success-800 break-words">
                      You have completed all four assessments, providing a comprehensive view of your leadership style, conflict management approach, team perception, and wellness.
                    </p>
                  </div>
                )}
                {results.WELLNESS && (
                  <div className="p-4 bg-blue-50 rounded-lg break-words">
                    <h3 className="font-bold text-blue-900 mb-2">Wellness Overview</h3>
                    <p className="text-blue-800 break-words">
                      {results.WELLNESS.scores?.percentage 
                        ? `Your overall wellness score is ${typeof results.WELLNESS.scores.percentage === 'number' ? results.WELLNESS.scores.percentage.toFixed(0) : 'N/A'}%. Focus on maintaining balance across all wellness pillars.`
                        : 'Review your wellness assessment results to identify areas for improvement.'}
                    </p>
                  </div>
                )}
                {results.THREE_SIXTY_SELF && (
                  <div className="p-4 bg-purple-50 rounded-lg break-words">
                    <h3 className="font-bold text-purple-900 mb-2">360° Feedback</h3>
                    <p className="text-purple-800 break-words">
                      {results.THREE_SIXTY_SELF.percentage 
                        ? `Your leadership effectiveness score is ${typeof results.THREE_SIXTY_SELF.percentage === 'number' ? results.THREE_SIXTY_SELF.percentage.toFixed(0) : 'N/A'}%. Continue building on your strengths while addressing areas for growth.`
                        : 'Your 360° feedback provides valuable insights into how others perceive your leadership.'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </MotionDiv>
        )}

        {/* Recommendations */}
        <MotionDiv variant="fade" duration="normal">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 break-words">
              Recommended Next Steps
            </h2>
            <ul className="space-y-3">
              {completedCount < totalCount && (
                <li className="flex items-start break-words">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700 break-words">
                    Complete the remaining {totalCount - completedCount} assessment{totalCount - completedCount > 1 ? 's' : ''} to get a complete leadership profile.
                  </p>
                </li>
              )}
              <li className="flex items-start break-words">
                <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">{completedCount < totalCount ? '2' : '1'}</span>
                </div>
                <p className="text-gray-700 break-words">
                  Review your Personal Growth Plan to create actionable development goals.
                </p>
              </li>
              <li className="flex items-start break-words">
                <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-sm font-bold">{completedCount < totalCount ? '3' : '2'}</span>
                </div>
                <p className="text-gray-700 break-words">
                  Connect with an ARISE coach to debrief your results and build a personalized growth plan.
                </p>
              </li>
            </ul>
            <div className="mt-6 flex gap-4 flex-wrap">
              <Button 
                variant="primary"
                onClick={() => router.push('/dashboard/development-plan')}
              >
                View Personal Growth Plan
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard/assessments')}
              >
                Continue Assessments
              </Button>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}

export default function ExecutiveSummaryPage() {
  return (
    <ErrorBoundary>
      <ExecutiveSummaryContent />
    </ErrorBoundary>
  );
}
