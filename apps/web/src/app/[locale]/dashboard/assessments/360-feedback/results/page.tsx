'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import MotionDiv from '@/components/motion/MotionDiv';
import {
  getAssessmentResults,
  getMyAssessments,
  PillarScore,
  get360Evaluators,
  type EvaluatorStatus,
} from '@/lib/api/assessments';
import { useFeedback360Store } from '@/stores/feedback360Store';
import { feedback360Capabilities } from '@/data/feedback360Questions';
import { get360ScoreColorCode, getFeedback360InsightWithLocale } from '@/data/feedback360Insights';
import Button from '@/components/ui/Button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users, CheckCircle, Clock, Mail, XCircle, Eye } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';
import { useLocale } from 'next-intl';

// Type guard to check if a value is a PillarScore object
function isPillarScore(value: number | PillarScore): value is PillarScore {
  return typeof value === 'object' && value !== null && 'score' in value;
}

interface CapabilityScore {
  capability: string;
  self_score: number;
  others_avg_score: number;
  gap: number;
  level: string;
}

interface Results {
  total_score: number;
  max_score: number;
  percentage: number;
  capability_scores: CapabilityScore[];
  has_evaluator_responses: boolean;
  evaluator_count: number;
}

export default function Feedback360ResultsPage() {
  const t = useTranslations('dashboard.assessments.360.results');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assessmentId } = useFeedback360Store();
  const [results, setResults] = useState<Results | null>(null);
  const [evaluators, setEvaluators] = useState<EvaluatorStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get assessment ID from URL params, store, or find it from my assessments
      const urlId = searchParams?.get('id');
      let id: number | null = urlId ? parseInt(urlId, 10) : null;
      
      console.log('[360-Feedback Results] Loading results', {
        urlId,
        parsedId: id,
        storeAssessmentId: assessmentId,
        isNaN: urlId ? isNaN(parseInt(urlId, 10)) : null
      });
      
      if (!id || isNaN(id)) {
        id = assessmentId || null;
        console.log('[360-Feedback Results] Using store assessmentId:', id);
      }
      
      // Get all assessments to find the one we're looking for and check its status
      let assessments;
      try {
        const allAssessments = await getMyAssessments();
        // Filter out evaluator assessments (360_evaluator) - these shouldn't appear in user's list
        assessments = allAssessments.filter(
          (a) => {
            const type = String(a.assessment_type).toLowerCase();
            return type !== 'three_sixty_evaluator' && type !== '360_evaluator';
          }
        );
        console.log('[360-Feedback Results] Loaded assessments:', assessments.length, assessments.map(a => ({ id: a.id, type: a.assessment_type, status: a.status })));
      } catch (assessmentListError: any) {
        // If we get a 401, it's an authentication issue
        if (assessmentListError?.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          setIsLoading(false);
          return;
        }
        // Re-throw other errors
        throw assessmentListError;
      }
      
      if (!id || isNaN(id)) {
        const feedback360Assessment = assessments.find(
          (a) => a.assessment_type === 'THREE_SIXTY_SELF'
        );
        console.log('[360-Feedback Results] Found 360 assessment:', feedback360Assessment ? { id: feedback360Assessment.id, status: feedback360Assessment.status } : 'none');
        if (!feedback360Assessment) {
          // No 360 assessment found, redirect to start page
          console.log('[360-Feedback Results] No 360 assessment found, redirecting to start page');
          router.push('/dashboard/assessments/360-feedback/start');
          return;
        }
        id = feedback360Assessment.id;
      }

      // Find the assessment to check its status
      const assessment = assessments.find((a) => a.id === id);
      
      console.log('[360-Feedback Results] Assessment found:', assessment ? { id: assessment.id, type: assessment.assessment_type, status: assessment.status, answer_count: assessment.answer_count, total_questions: assessment.total_questions } : 'none');
      
      if (!assessment) {
        // Assessment not found, redirect to assessments page
        console.log('[360-Feedback Results] Assessment not found, redirecting to assessments page');
        router.push('/dashboard/assessments');
        return;
      }

      // Check if assessment is completed by status OR by having all answers
      const isCompletedByStatus = assessment.status === 'completed' || assessment.status === 'COMPLETED';
      const answerCount = assessment.answer_count ?? 0;
      const totalQuestions = assessment.total_questions ?? 0;
      const hasAllAnswers = totalQuestions > 0 && answerCount > 0 && answerCount === totalQuestions;
      const isCompleted = isCompletedByStatus || hasAllAnswers;
      
      console.log('[360-Feedback Results] Assessment status check:', { 
        status: assessment.status, 
        isCompletedByStatus,
        hasAllAnswers,
        answerCount,
        totalQuestions,
        isCompleted 
      });
      
      if (!isCompleted) {
        // If assessment is not completed, redirect to the assessment page instead of showing error
        console.log('[360-Feedback Results] Assessment not completed, redirecting to assessment page');
        router.push(`/dashboard/assessments/360-feedback?assessmentId=${id}`);
        return;
      }

      // Load results and evaluators in parallel
      // Catch 404 errors for results gracefully
      let response;
      try {
        response = await getAssessmentResults(id);
      } catch (resultsError: any) {
        // Check if it's a 404 (results not found)
        if (resultsError?.response?.status === 404 || 
            (typeof resultsError === 'string' && resultsError.includes('not found')) ||
            (resultsError?.message && resultsError.message.includes('not found'))) {
          setError(t('errors.notFound'));
          setIsLoading(false);
          return;
        }
        // Re-throw other errors
        throw resultsError;
      }

      const evaluatorsResponse = await get360Evaluators(id).catch(() => ({ evaluators: [] })); // Don't fail if evaluators endpoint fails
      setEvaluators(evaluatorsResponse.evaluators || []);

      const completedCount = evaluatorsResponse.evaluators?.filter(
        (e) => e.status === 'completed' || e.status === 'COMPLETED'
      ).length || 0;

      // Transform AssessmentResult to Results format
      const scores = response.scores;
      console.log('[360-Feedback Results] Raw scores from API:', JSON.stringify(scores, null, 2));
      
      // Map backend capability IDs to frontend IDs
      const capabilityIdMap: Record<string, string> = {
        'problem_solving': 'problem_solving_and_decision_making',
        // Other capabilities should match
        'communication': 'communication',
        'team_culture': 'team_culture',
        'leadership_style': 'leadership_style',
        'change_management': 'change_management',
        'stress_management': 'stress_management',
      };
      
      // Transform capability scores
      // Backend returns sums (max 25 for 5 questions), frontend needs averages (max 5.0)
      const capabilityScores: CapabilityScore[] = scores.capability_scores
        ? Object.entries(scores.capability_scores).map(([capability, score]) => {
            const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
            // Convert sum (max 25) to average (max 5.0) by dividing by 5
            const averageScore = rawScoreValue / 5;
            
            // Map capability ID to frontend format
            const mappedCapability = capabilityIdMap[capability] || capability;
            
            console.log('[360-Feedback Results] Capability score:', {
              backendId: capability,
              frontendId: mappedCapability,
              rawSum: rawScoreValue,
              average: averageScore
            });
            
            return {
              capability: mappedCapability,
              self_score: averageScore,
              others_avg_score: 0, // Will be set if evaluator responses exist
              gap: 0,
              level: averageScore >= 4 ? 'high' : averageScore >= 2.5 ? 'moderate' : 'low',
            };
          })
        : [];

      // Check if there are evaluator responses
      const hasEvaluatorResponses = completedCount > 0;
      
      // Calculate percentage if not provided or invalid
      let percentage = scores.percentage;
      if (!percentage || isNaN(percentage) || percentage === 0) {
        // Calculate from total_score and max_score
        if (scores.total_score !== undefined && scores.max_score !== undefined && scores.max_score > 0) {
          percentage = (scores.total_score / scores.max_score) * 100;
          console.log('[360-Feedback Results] Calculated percentage:', percentage, 'from', scores.total_score, '/', scores.max_score);
        } else {
          percentage = 0;
        }
      }

      const transformedResults: Results = {
        total_score: scores.total_score || 0,
        max_score: scores.max_score || 150,
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
        capability_scores: capabilityScores,
        has_evaluator_responses: hasEvaluatorResponses,
        evaluator_count: completedCount,
      };
      
      console.log('[360-Feedback Results] Transformed results:', JSON.stringify(transformedResults, null, 2));

      setResults(transformedResults);
    } catch (err: unknown) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('[360-Feedback Results] Failed to load results:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-arise-teal">
        <div className="text-white">{t('loading')}</div>
      </div>
    );
  }

  if (error || !results) {
    // Ensure error is always a string before rendering
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.noResults'));
    
    // Check if the error indicates the assessment is not completed
    const isNotCompletedError = errorString.toLowerCase().includes('not completed') || 
                                 errorString.toLowerCase().includes('not found');
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-arise-teal p-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg max-w-2xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            {isNotCompletedError ? t('errors.notCompleted.title') : t('errors.unableToLoad.title')}
          </h2>
          <p className="mb-6 text-gray-600">{errorString}</p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push('/dashboard/assessments')} 
              variant="primary" 
              className="flex items-center gap-4"
              style={{ backgroundColor: '#0F4C56', color: '#fff' }}
            >
              {t('backToAssessments')}
            </Button>
            {isNotCompletedError && (
              <Button onClick={() => {
                const id = searchParams?.get('id') || assessmentId;
                if (id) {
                  router.push(`/dashboard/assessments/360-feedback?assessmentId=${id}`);
                } else {
                  router.push('/dashboard/assessments/360-feedback');
                }
              }}>
                {t('errors.notCompleted.completeButton')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getGapIcon = (gap: number) => {
    if (gap > 0.5) return <TrendingUp className="h-5 w-5 text-success-500" />;
    if (gap < -0.5) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-400" />;
  };

  const getGapLabel = (gap: number) => {
    if (gap > 0.5) return t('gap.selfHigher');
    if (gap < -0.5) return t('gap.othersHigher');
    return t('gap.aligned');
  };

  const getGapColor = (gap: number) => {
    if (gap > 0.5) return 'text-orange-600';
    if (gap < -0.5) return 'text-primary-600';
    return 'text-gray-600';
  };

  const getInsight = (capability: CapabilityScore) => {
    const capInfo = feedback360Capabilities.find((c) => c.id === capability.capability);
    const capName = capInfo?.title || capability.capability;

    if (!results.has_evaluator_responses) {
      if (capability.self_score >= 4) {
        return t('insights.selfOnly.high', { capability: capName });
      } else if (capability.self_score <= 2.5) {
        return t('insights.selfOnly.low', { capability: capName });
      } else {
        return t('insights.selfOnly.moderate', { capability: capName });
      }
    }

    if (capability.gap > 0.5) {
      return t('insights.withContributors.selfHigher', { capability: capName });
    } else if (capability.gap < -0.5) {
      return t('insights.withContributors.othersHigher', { capability: capName });
    } else {
      return t('insights.withContributors.aligned', { capability: capName });
    }
  };

  return (
    <div className="min-h-screen bg-arise-teal p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">

          <MotionDiv
            variant="slideUp"
            duration="normal"
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {t('title')}
            </h1>

            {results.has_evaluator_responses ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>
                  {t('basedOnFeedback', { count: results.evaluator_count })}
                </span>
              </div>
            ) : (
              <div className="rounded-lg bg-primary-50 p-4">
                <p className="text-sm text-primary-800">
                  <strong>{t('note')}</strong> {t('selfAssessmentOnly')}
                </p>
              </div>
            )}

            {/* Contributors Status Section */}
            {evaluators.length > 0 && (
              <div className="mt-6 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('contributorStatus.title')}
                  </h3>
                  <Link href="/dashboard/evaluators">
                    <Button variant="outline" size="sm" className="text-xs flex flex-row items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {t('contributorStatus.viewAll')}
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {evaluators.map((evaluator) => (
                    <div
                      key={evaluator.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {evaluator.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {evaluator.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {evaluator.role}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {evaluator.status === 'completed' || evaluator.status === 'COMPLETED' ? (
                          <div className="flex items-center gap-1 text-success-600" title={t('contributorStatus.completed')}>
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        ) : evaluator.status === 'in_progress' || evaluator.status === 'IN_PROGRESS' ? (
                          <div className="flex items-center gap-1 text-primary-600" title={t('contributorStatus.inProgress')}>
                            <Clock className="h-5 w-5" />
                          </div>
                        ) : evaluator.invitation_opened_at ? (
                          <div className="flex items-center gap-1 text-yellow-600" title={t('contributorStatus.invitationOpened')}>
                            <Mail className="h-5 w-5" />
                          </div>
                        ) : evaluator.invitation_sent_at ? (
                          <div className="flex items-center gap-1 text-gray-400" title={t('contributorStatus.invitationSent')}>
                            <Mail className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400" title={t('contributorStatus.notInvited')}>
                            <XCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success-600" />
                    <span>{t('contributorStatus.completed')} ({evaluators.filter((e) => e.status === 'completed' || e.status === 'COMPLETED').length})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary-600" />
                    <span>{t('contributorStatus.inProgress')} ({evaluators.filter((e) => (e.status === 'in_progress' || e.status === 'IN_PROGRESS') || (e.invitation_opened_at && e.status !== 'completed' && e.status !== 'COMPLETED')).length})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{t('contributorStatus.invitationSent')} ({evaluators.filter((e) => (e.status === 'not_started' || e.status === 'NOT_STARTED') && e.invitation_sent_at && !e.invitation_opened_at).length})</span>
                  </div>
                </div>
              </div>
            )}
          </MotionDiv>
        </div>

        {/* Overall Score */}
        <MotionDiv
          variant="slideUp"
          duration="normal"
          delay={0.1}
          className="mb-8 rounded-lg bg-white p-8 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            {t('overallScore.title')}
          </h2>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold text-arise-teal">
                {results.percentage !== undefined && !isNaN(results.percentage) ? `${results.percentage}%` : '0%'}
              </div>
              <div className="text-gray-600">
                {t('overallScore.points', { score: results.total_score || 0, max: results.max_score || 150 })}
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Capability Breakdown */}
        <MotionDiv
          variant="slideUp"
          duration="normal"
          delay={0.2}
          className="mb-8 rounded-lg bg-white p-8 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Leadership Capabilities
          </h2>

          <div className="space-y-6">
            {results.capability_scores.map((capScore, index) => {
              const capInfo = feedback360Capabilities.find(
                (c) => c.id === capScore.capability
              );
              
              // Fallback if capability not found
              const capabilityTitle = capInfo?.title || capScore.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const capabilityDescription = capInfo?.description || '';
              const capabilityIcon = capInfo?.icon || '📊';

              return (
                <MotionDiv
                  key={capScore.capability}
                  variant="slideUp"
                  duration="normal"
                  delay={0.3 + index * 0.1}
                  className="rounded-lg border border-gray-200 p-6"
                >
                  {/* Capability Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{capabilityIcon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {capabilityTitle}
                        </h3>
                        {capabilityDescription && (
                          <p className="text-sm text-gray-600">
                            {capabilityDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    {results.has_evaluator_responses && (
                      <div className="flex items-center gap-2">
                        {getGapIcon(capScore.gap)}
                        <span className={`text-sm font-medium ${getGapColor(capScore.gap)}`}>
                          {getGapLabel(capScore.gap)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Scores */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('capabilities.selfAssessment')}</span>
                        <span 
                          className="font-semibold"
                          style={{ color: get360ScoreColorCode(capScore.self_score) }}
                        >
                          {capScore.self_score.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full"
                          style={{ 
                            width: `${(capScore.self_score / 5) * 100}%`,
                            backgroundColor: get360ScoreColorCode(capScore.self_score)
                          }}
                        />
                      </div>
                    </div>

                    {results.has_evaluator_responses && (
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Others' Average</span>
                          <span 
                            className="font-semibold"
                            style={{ color: get360ScoreColorCode(capScore.others_avg_score) }}
                          >
                            {capScore.others_avg_score.toFixed(1)} / 5.0
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full"
                            style={{
                              width: `${(capScore.others_avg_score / 5) * 100}%`,
                              backgroundColor: get360ScoreColorCode(capScore.others_avg_score)
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis and Recommendations based on score */}
                  {(() => {
                    // Use self_score for insights (or others_avg_score if available and preferred)
                    const scoreForInsight = results.has_evaluator_responses && capScore.others_avg_score > 0
                      ? capScore.others_avg_score
                      : capScore.self_score;
                    
                    const insight = getFeedback360InsightWithLocale(
                      capScore.capability,
                      scoreForInsight,
                      locale
                    );

                    // Debug log (can be removed later)
                    if (!insight && (capScore.capability === 'communication' || capScore.capability === 'leadership_style')) {
                      console.log('[360 Insights Debug]', {
                        capability: capScore.capability,
                        score: scoreForInsight,
                        self_score: capScore.self_score,
                        others_avg_score: capScore.others_avg_score
                      });
                    }

                    if (!insight) return null;

                    return (
                      <div className="mt-4 space-y-3">
                        {/* Analysis */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ backgroundColor: insight.colorCode + '40' }}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Analysis</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.analysis}</p>
                        </div>

                        {/* Recommendations */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ backgroundColor: insight.colorCode + '40' }}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recommendations</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.recommendation}</p>
                        </div>
                      </div>
                    );
                  })()}
                </MotionDiv>
              );
            })}
          </div>
        </MotionDiv>

        {/* Results & Analysis Section */}
        {results.has_evaluator_responses && (
          <MotionDiv
            variant="slideUp"
            duration="normal"
            delay={0.3}
            className="mb-8 rounded-lg bg-white p-8 shadow-lg"
          >
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Results & Analysis: Self vs Contributors
            </h2>

            <div className="space-y-6">
              {results.capability_scores.map((capScore) => {
                const capInfo = feedback360Capabilities.find(
                  (c) => c.id === capScore.capability
                );
                const capabilityTitle = capInfo?.title || capScore.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <div
                    key={`analysis-${capScore.capability}`}
                    className="rounded-lg border border-gray-200 p-6"
                  >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {capabilityTitle}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getGapIcon(capScore.gap)}
                      <span className={`text-sm font-medium ${getGapColor(capScore.gap)}`}>
                        {getGapLabel(capScore.gap)}
                      </span>
                    </div>
                  </div>

                  {/* Analysis and Recommendations */}
                  {(() => {
                    // Get insight based on others_avg_score (since we have evaluator responses)
                    const scoreForInsight = capScore.others_avg_score > 0 ? capScore.others_avg_score : capScore.self_score;
                    const insight = getFeedback360InsightWithLocale(
                      capScore.capability,
                      scoreForInsight,
                      locale
                    );

                    if (!insight) return null;

                    return (
                      <div className="space-y-3 mb-4">
                        {/* Analysis */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ backgroundColor: insight.colorCode + '40' }}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Analysis</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.analysis}</p>
                        </div>

                        {/* Recommendations */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ backgroundColor: insight.colorCode + '40' }}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recommendations</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.recommendation}</p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">{getInsight(capScore)}</p>
                  </div>
                  </div>
                );
              })}
            </div>
          </MotionDiv>
        )}

        {/* Back to assessments button at bottom */}
        <div className="flex justify-center mt-8 mb-8">
          <Button
            onClick={() => router.push('/dashboard/assessments')}
            variant="primary"
            className="flex items-center gap-4"
            style={{ backgroundColor: '#0F4C56', color: '#fff' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToAssessments')}
          </Button>
        </div>
      </div>
    </div>
  );
}

