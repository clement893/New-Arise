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
import { getFeedback360GapInsightWithLocale } from '@/data/feedback360GapInsights';
import Button from '@/components/ui/Button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users, CheckCircle, Clock, Mail, XCircle, Eye, Target } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';
import { useLocale } from 'next-intl';

// Type guard to check if a value is a PillarScore object
function isPillarScore(value: unknown): value is PillarScore {
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
      const comparisonData = response.comparison_data;
      console.log('[360-Feedback Results] Raw scores from API:', JSON.stringify(scores, null, 2));
      console.log('[360-Feedback Results] Comparison data from API:', JSON.stringify(comparisonData, null, 2));
      
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

      // Check if there are evaluator responses
      const hasEvaluatorResponses = completedCount > 0;

      // Calculate others_avg_score from comparison_data if available
      let othersAvgScores: Record<string, number> = {};
      if (comparisonData && typeof comparisonData === 'object') {
        // Check if comparison_data has capability scores
        if (comparisonData.capability_scores && typeof comparisonData.capability_scores === 'object') {
          Object.entries(comparisonData.capability_scores).forEach(([capability, score]) => {
            const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
            // Convert sum (max 25) to average (max 5.0) by dividing by 5
            const averageScore = rawScoreValue / 5;
            const mappedCapability = capabilityIdMap[capability] || capability;
            othersAvgScores[mappedCapability] = averageScore;
          });
        }
      }
      
      // Transform capability scores
      // Backend returns sums (max 25 for 5 questions), frontend needs averages (max 5.0)
      const capabilityScores: CapabilityScore[] = scores.capability_scores
        ? Object.entries(scores.capability_scores).map(([capability, score]) => {
            const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
            // Convert sum (max 25) to average (max 5.0) by dividing by 5
            const averageScore = rawScoreValue / 5;
            
            // Map capability ID to frontend format
            const mappedCapability = capabilityIdMap[capability] || capability;
            
            // Get others_avg_score from comparison_data if available
            const othersAvgScore = othersAvgScores[mappedCapability] || 0;
            
            // Calculate gap (self_score - others_avg_score)
            const gap = averageScore - othersAvgScore;
            
            console.log('[360-Feedback Results] Capability score:', {
              backendId: capability,
              frontendId: mappedCapability,
              rawSum: rawScoreValue,
              average: averageScore,
              othersAvgScore: othersAvgScore,
              gap: gap
            });
            
            return {
              capability: mappedCapability,
              self_score: averageScore,
              others_avg_score: othersAvgScore,
              gap: gap,
              level: averageScore >= 4 ? 'high' : averageScore >= 2.5 ? 'moderate' : 'low',
            };
          })
        : [];
      
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
                          style={{ backgroundColor: insight.colorCode }}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Analysis</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{insight.analysis}</p>
                        </div>

                        {/* Recommendations */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ backgroundColor: insight.colorCode }}
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

        {/* OVERALL RESULTS' STATEMENT with Capabilities Categorization */}
        <MotionDiv
          variant="slideUp"
          duration="normal"
          delay={0.4}
          className="mb-8 rounded-lg bg-white p-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
              <Target className="text-arise-deep-teal" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              OVERALL RESULTS' STATEMENT
            </h2>
          </div>
          
          {(() => {
            // Calculate average score across all capabilities
            const avgScore = results.capability_scores.length > 0
              ? results.capability_scores.reduce((sum, cap) => {
                  const score = results.has_evaluator_responses && cap.others_avg_score > 0
                    ? cap.others_avg_score
                    : cap.self_score;
                  return sum + score;
                }, 0) / results.capability_scores.length
              : 0;
            
            const roundedAvgScore = Math.round(avgScore);
            let statement = '';
            let statementColor = '';
            
            if (roundedAvgScore >= 4) {
              statement = 'The results demonstrate a high level of self-awareness, as self-perception closely aligns with the perspectives of others across most evaluated capabilities. This indicates a strong understanding of how personal behaviors, strengths, and development areas are perceived by others. It reflects maturity, emotional intelligence, and authenticity in leadership interactions. Individuals with this profile tend to be effective at maintaining trust, adapting feedback, and fostering positive team dynamics.';
              statementColor = '#C6EFCE';
            } else if (roundedAvgScore >= 3) {
              statement = 'The results indicate good self-awareness, showing that in several key areas there is alignment between self-perception and how others experience behaviors and impact. Some variations across capabilities suggest opportunities to deepen reflection and seek additional feedback to bridge minor perception gaps. This balanced profile highlights a generally accurate self-view, coupled with potential for further growth through targeted development and open dialogue.';
              statementColor = '#FFEB9C';
            } else {
              statement = 'The results suggest lower self-awareness, with noticeable differences between self-assessment and the perspectives provided by others. This may indicate that certain behaviors or leadership patterns are not fully recognized, or that expectations and impact are perceived differently by colleagues. This outcome represents an opportunity for constructive growth — encouraging deeper reflection, open discussion, and feedback-seeking to better understand and align internal perceptions with external observations. Increasing awareness in this way can significantly strengthen effectiveness, relationships, and overall leadership presence.';
              statementColor = '#FFC7CE';
            }

            // Filter capabilities by score range
            const growthCapabilities = results.capability_scores.filter(cap => {
              const score = results.has_evaluator_responses && cap.others_avg_score > 0
                ? cap.others_avg_score
                : cap.self_score;
              return Math.round(score) >= 1 && Math.round(score) <= 2;
            });

            const neutralCapabilities = results.capability_scores.filter(cap => {
              const score = results.has_evaluator_responses && cap.others_avg_score > 0
                ? cap.others_avg_score
                : cap.self_score;
              return Math.round(score) === 3;
            });

            const strengthCapabilities = results.capability_scores.filter(cap => {
              const score = results.has_evaluator_responses && cap.others_avg_score > 0
                ? cap.others_avg_score
                : cap.self_score;
              return Math.round(score) >= 4;
            });

            // Only show columns that have capabilities
            const hasGrowth = growthCapabilities.length > 0;
            const hasNeutral = neutralCapabilities.length > 0;
            const hasStrengths = strengthCapabilities.length > 0;
            
            const columnCount = [hasGrowth, hasNeutral, hasStrengths].filter(Boolean).length;
            
            return (
              <>
                <div 
                  className="rounded-lg p-6 mb-6"
                  style={{ backgroundColor: statementColor }}
                >
                  <p className="text-gray-700 leading-relaxed">{statement}</p>
                </div>

                {columnCount > 0 && (
                  <div className={`grid ${columnCount === 1 ? 'md:grid-cols-1' : columnCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
                    {/* Areas for Growth (1-2) */}
                    {hasGrowth && (
                      <div>
                        <h3 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <TrendingDown className="w-5 h-5" />
                          Areas for Growth
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Deepen self-reflection, actively seek feedback, and explore perception differences to strengthen impact and alignment.
                        </p>
                        <div className="space-y-3">
                          {growthCapabilities.map(cap => {
                            const capInfo = feedback360Capabilities.find(c => c.id === cap.capability);
                            const capabilityTitle = capInfo?.title || cap.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            const capabilityIcon = capInfo?.icon || '📊';
                            const score = results.has_evaluator_responses && cap.others_avg_score > 0
                              ? cap.others_avg_score
                              : cap.self_score;

                            return (
                              <div 
                                key={cap.capability} 
                                className="p-2 rounded-lg" 
                                style={{ backgroundColor: '#FFC7CE' }}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{capabilityIcon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-gray-900 text-sm">{capabilityTitle}</h4>
                                      <span className="text-sm font-bold" style={{ color: '#FFC7CE' }}>
                                        {score.toFixed(1)}/5.0
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Neutral (3) */}
                    {hasNeutral && (
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                          <Minus className="w-5 h-5" />
                          Neutral
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Focus on areas of gap, engage in feedback discussions, and seek specific examples to calibrate perceptions.
                        </p>
                        <div className="space-y-3">
                          {neutralCapabilities.map(cap => {
                            const capInfo = feedback360Capabilities.find(c => c.id === cap.capability);
                            const capabilityTitle = capInfo?.title || cap.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            const capabilityIcon = capInfo?.icon || '📊';
                            const score = results.has_evaluator_responses && cap.others_avg_score > 0
                              ? cap.others_avg_score
                              : cap.self_score;

                            return (
                              <div 
                                key={cap.capability} 
                                className="p-2 rounded-lg" 
                                style={{ backgroundColor: '#FFEB9C' }}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{capabilityIcon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-gray-900 text-sm">{capabilityTitle}</h4>
                                      <span className="text-sm font-bold" style={{ color: '#FFEB9C' }}>
                                        {score.toFixed(1)}/5.0
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Strengths (4-5) */}
                    {hasStrengths && (
                      <div>
                        <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Strengths
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Continue leveraging strengths, use feedback as reinforcement for ongoing growth.
                        </p>
                        <div className="space-y-3">
                          {strengthCapabilities.map(cap => {
                            const capInfo = feedback360Capabilities.find(c => c.id === cap.capability);
                            const capabilityTitle = capInfo?.title || cap.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            const capabilityIcon = capInfo?.icon || '📊';
                            const score = results.has_evaluator_responses && cap.others_avg_score > 0
                              ? cap.others_avg_score
                              : cap.self_score;

                            return (
                              <div 
                                key={cap.capability} 
                                className="p-2 rounded-lg" 
                                style={{ backgroundColor: '#C6EFCE' }}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{capabilityIcon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-gray-900 text-sm">{capabilityTitle}</h4>
                                      <span className="text-sm font-bold" style={{ color: '#C6EFCE' }}>
                                        {score.toFixed(1)}/5.0
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </MotionDiv>

        {/* Results & Analysis Section */}
        {results.has_evaluator_responses && (
          <MotionDiv
            variant="slideUp"
            duration="normal"
            delay={0.5}
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

                // Calculate gap (self_score - others_avg_score)
                const gap = capScore.self_score - capScore.others_avg_score;
                
                // Get gap insight
                const gapInsight = getFeedback360GapInsightWithLocale(
                  capScore.capability,
                  gap,
                  locale
                );

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

                  {/* Others' Average */}
                  {results.has_evaluator_responses && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Others' Average</span>
                        <span 
                          className="font-semibold"
                          style={{ color: get360ScoreColorCode(capScore.others_avg_score || 0) }}
                        >
                          {(capScore.others_avg_score || 0).toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full"
                          style={{
                            width: `${((capScore.others_avg_score || 0) / 5) * 100}%`,
                            backgroundColor: get360ScoreColorCode(capScore.others_avg_score || 0)
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Gap-based Overview and Recommendation */}
                  {gapInsight && (
                    <div className="space-y-3">
                      {/* Overview */}
                      <div 
                        className="rounded-lg p-4"
                        style={{ backgroundColor: gapInsight.colorCode }}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Overview</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{gapInsight.overview}</p>
                      </div>

                      {/* Recommendation */}
                      <div 
                        className="rounded-lg p-4"
                        style={{ backgroundColor: gapInsight.colorCode }}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Recommendation</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{gapInsight.recommendation}</p>
                      </div>
                    </div>
                  )}
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

