'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { AssessmentResult, PillarScore, get360Evaluators, type EvaluatorStatus } from '@/lib/api/assessments';
import { feedback360Capabilities } from '@/data/feedback360Questions';
import { TrendingUp, TrendingDown, Minus, Users, CheckCircle, Clock, Mail, XCircle } from 'lucide-react';

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

interface ThreeSixtyResultContentProps {
  results: AssessmentResult;
  assessmentId: number;
}

export default function ThreeSixtyResultContent({ results, assessmentId }: ThreeSixtyResultContentProps) {
  const t = useTranslations('dashboard.assessments.360.results');
  const [evaluators, setEvaluators] = useState<EvaluatorStatus[]>([]);
  const [transformedResults, setTransformedResults] = useState<Results | null>(null);

  useEffect(() => {
    transformResults();
  }, [results]);

  const transformResults = async () => {
    const scores = results.scores;
    
    // Load evaluators using the passed assessmentId
    try {
      const evaluatorsResponse = await get360Evaluators(assessmentId);
      setEvaluators(evaluatorsResponse.evaluators || []);
    } catch (err) {
      console.warn('Failed to load evaluators:', err);
    }

    // Map backend capability IDs to frontend IDs
    const capabilityIdMap: Record<string, string> = {
      'problem_solving': 'problem_solving_and_decision_making',
      'communication': 'communication',
      'team_culture': 'team_culture',
      'leadership_style': 'leadership_style',
      'change_management': 'change_management',
      'stress_management': 'stress_management',
    };

    // Transform capability scores
    const capabilityScores: CapabilityScore[] = scores.capability_scores
      ? Object.entries(scores.capability_scores).map(([capability, score]) => {
          const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
          // Convert sum (max 25) to average (max 5.0) by dividing by 5
          const averageScore = rawScoreValue / 5;
          
          // Map capability ID to frontend format
          const mappedCapability = capabilityIdMap[capability] || capability;
          
          return {
            capability: mappedCapability,
            self_score: averageScore,
            others_avg_score: 0, // Will be set if evaluator responses exist
            gap: 0,
            level: averageScore >= 4 ? 'high' : averageScore >= 2.5 ? 'moderate' : 'low',
          };
        })
      : [];

    // Count completed evaluators
    const completedCount = evaluators.filter(
      (e) => e.status === 'completed' || e.status === 'COMPLETED'
    ).length;

    const hasEvaluatorResponses = completedCount > 0;

    // Calculate percentage if not provided
    let percentage = scores.percentage;
    if (!percentage || isNaN(percentage) || percentage === 0) {
      if (scores.total_score !== undefined && scores.max_score !== undefined && scores.max_score > 0) {
        percentage = (scores.total_score / scores.max_score) * 100;
      } else {
        percentage = 0;
      }
    }

    const transformed: Results = {
      total_score: scores.total_score || 0,
      max_score: scores.max_score || 150,
      percentage: Math.round(percentage * 10) / 10,
      capability_scores: capabilityScores,
      has_evaluator_responses: hasEvaluatorResponses,
      evaluator_count: completedCount,
    };

    setTransformedResults(transformed);
  };

  if (!transformedResults) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arise-deep-teal"></div>
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

    if (!transformedResults.has_evaluator_responses) {
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
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h2>

        {transformedResults.has_evaluator_responses ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span>
              {t('basedOnFeedback', { count: transformedResults.evaluator_count })}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('contributorStatus.title')}
            </h3>
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
                      <span title={t('contributorStatus.completed')}>
                        <CheckCircle className="h-5 w-5 text-success-600" />
                      </span>
                    ) : evaluator.status === 'in_progress' || evaluator.status === 'IN_PROGRESS' ? (
                      <span title={t('contributorStatus.inProgress')}>
                        <Clock className="h-5 w-5 text-primary-600" />
                      </span>
                    ) : evaluator.invitation_opened_at ? (
                      <span title={t('contributorStatus.invitationOpened')}>
                        <Mail className="h-5 w-5 text-yellow-600" />
                      </span>
                    ) : evaluator.invitation_sent_at ? (
                      <span title={t('contributorStatus.invitationSent')}>
                        <Mail className="h-5 w-5 text-gray-400" />
                      </span>
                    ) : (
                      <span title={t('contributorStatus.notInvited')}>
                        <XCircle className="h-5 w-5 text-gray-400" />
                      </span>
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
                <span>{t('contributorStatus.inProgress')} ({evaluators.filter((e) => (e.status === 'in_progress' || e.status === 'IN_PROGRESS')).length})</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{t('contributorStatus.invitationSent')} ({evaluators.filter((e) => e.invitation_sent_at && !e.invitation_opened_at).length})</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-arise-deep-teal to-arise-deep-teal/80 text-white">
        <h2 className="text-2xl font-semibold mb-6">
          {t('overallScore.title')}
        </h2>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">
              {transformedResults.percentage}%
            </div>
            <div className="text-white/90">
              {t('overallScore.points', { score: transformedResults.total_score, max: transformedResults.max_score })}
            </div>
          </div>
        </div>
      </Card>

      {/* Capability Breakdown */}
      <Card className="bg-white">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Leadership Capabilities
        </h2>

        <div className="space-y-6">
          {transformedResults.capability_scores.map((capScore) => {
            const capInfo = feedback360Capabilities.find(
              (c) => c.id === capScore.capability
            );
            
            const capabilityTitle = capInfo?.title || capScore.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const capabilityDescription = capInfo?.description || '';
            const capabilityIcon = capInfo?.icon || '📊';

            return (
              <div
                key={capScore.capability}
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

                  {transformedResults.has_evaluator_responses && (
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
                      <span className="font-semibold text-gray-900">
                        {capScore.self_score.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-arise-gold"
                        style={{ width: `${(capScore.self_score / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {transformedResults.has_evaluator_responses && (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Others' Average</span>
                        <span className="font-semibold text-gray-900">
                          {capScore.others_avg_score.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-primary-500"
                          style={{
                            width: `${(capScore.others_avg_score / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Insight */}
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{getInsight(capScore)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Results & Analysis Section */}
      {transformedResults.has_evaluator_responses && (
        <Card className="bg-white">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Results & Analysis: Self vs Contributors
          </h2>

          <div className="space-y-6">
            {transformedResults.capability_scores.map((capScore) => {
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

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">{getInsight(capScore)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
