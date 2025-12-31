'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MotionDiv from '@/components/motion/MotionDiv';
import { getAssessmentResults, getMyAssessments } from '@/lib/api/assessments';
import { useFeedback360Store } from '@/stores/feedback360Store';
import { feedback360Capabilities } from '@/data/feedback360Questions';
import Button from '@/components/ui/Button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

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
  const router = useRouter();
  const { assessmentId } = useFeedback360Store();
  const [results, setResults] = useState<Results | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      
      // Get assessment ID from store or find it from my assessments
      let id = assessmentId;
      if (!id) {
        const assessments = await getMyAssessments();
        const feedback360Assessment = assessments.find(
          (a) => a.assessment_type === '360_self'
        );
        if (!feedback360Assessment) {
          setError('No 360 feedback assessment found');
          setIsLoading(false);
          return;
        }
        id = feedback360Assessment.id;
      }
      
      const response = await getAssessmentResults(id);
      
      // Transform AssessmentResult to Results format
      const { result_data } = response;
      const capabilityScores: CapabilityScore[] = result_data.capability_scores
        ? Object.entries(result_data.capability_scores).map(([capability, score]) => {
            const scoreValue = typeof score === 'number' ? score : score.score;
            return {
              capability,
              self_score: scoreValue,
              others_avg_score: 0, // Will be set if evaluator responses exist
              gap: 0,
              level: scoreValue >= 4 ? 'high' : scoreValue >= 2.5 ? 'moderate' : 'low',
            };
          })
        : [];
      
      // Check if there are evaluator responses (this would come from backend)
      // For now, we'll assume false if not provided
      const transformedResults: Results = {
        total_score: result_data.total_score,
        max_score: result_data.max_score,
        percentage: result_data.percentage,
        capability_scores: capabilityScores,
        has_evaluator_responses: false, // Backend should provide this
        evaluator_count: 0, // Backend should provide this
      };
      
      setResults(transformedResults);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : undefined;
      setError(errorMessage || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-arise-teal">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-arise-teal p-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <p className="mb-4 text-red-600">{error || 'No results found'}</p>
          <Button onClick={() => router.push('/dashboard/assessments')}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const getGapIcon = (gap: number) => {
    if (gap > 0.5) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (gap < -0.5) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-400" />;
  };

  const getGapLabel = (gap: number) => {
    if (gap > 0.5) return 'Self-rating higher';
    if (gap < -0.5) return 'Others rate higher';
    return 'Aligned';
  };

  const getGapColor = (gap: number) => {
    if (gap > 0.5) return 'text-orange-600';
    if (gap < -0.5) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getInsight = (capability: CapabilityScore) => {
    const capInfo = feedback360Capabilities.find((c) => c.id === capability.capability);
    const capName = capInfo?.title || capability.capability;

    if (!results.has_evaluator_responses) {
      if (capability.self_score >= 4) {
        return `You rate yourself highly in ${capName}. Consider inviting colleagues to validate this strength.`;
      } else if (capability.self_score <= 2.5) {
        return `You've identified ${capName} as an area for development. This self-awareness is valuable for growth.`;
      } else {
        return `You rate yourself moderately in ${capName}. Feedback from others will provide additional perspective.`;
      }
    }

    if (capability.gap > 0.5) {
      return `You rate yourself higher than others in ${capName}. This may indicate a blind spot or an opportunity to better demonstrate your capabilities.`;
    } else if (capability.gap < -0.5) {
      return `Others rate you higher than you rate yourself in ${capName}. This suggests you may be underestimating your impact in this area.`;
    } else {
      return `Your self-assessment aligns well with others' perceptions of your ${capName}. This indicates strong self-awareness.`;
    }
  };

  return (
    <div className="min-h-screen bg-arise-teal p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/assessments')}
            className="mb-4 border-white text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>

          <MotionDiv
            variant="slideUp"
            duration="normal"
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              360° Feedback Results
            </h1>

            {results.has_evaluator_responses ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>
                  Based on your self-assessment and feedback from {results.evaluator_count} colleague{results.evaluator_count !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These results are based on your self-assessment only. Invite colleagues to provide feedback for a complete 360° view.
                </p>
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
            Overall Leadership Score
          </h2>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-6xl font-bold text-arise-teal">
                {results.percentage}%
              </div>
              <div className="text-gray-600">
                {results.total_score} out of {results.max_score} points
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
                      <span className="text-3xl">{capInfo?.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {capInfo?.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {capInfo?.description}
                        </p>
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
                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Self-Assessment</span>
                        <span className="font-semibold text-gray-900">
                          {capScore.self_score.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-arise-teal"
                          style={{ width: `${(capScore.self_score / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {results.has_evaluator_responses && (
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Others' Average</span>
                          <span className="font-semibold text-gray-900">
                            {capScore.others_avg_score.toFixed(1)} / 5.0
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(capScore.others_avg_score / 5) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Insight */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">{getInsight(capScore)}</p>
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </MotionDiv>

        {/* Recommendations */}
        <MotionDiv
          variant="slideUp"
          duration="normal"
          delay={0.4}
          className="rounded-lg bg-white p-8 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Recommendations
          </h2>

          <div className="space-y-4">
            {!results.has_evaluator_responses && (
              <div className="rounded-lg bg-blue-50 p-6">
                <h3 className="mb-2 font-semibold text-blue-900">
                  Complete Your 360° View
                </h3>
                <p className="mb-4 text-sm text-blue-800">
                  Invite colleagues, managers, and direct reports to provide their perspective on your leadership. This will give you a comprehensive view of how others perceive your capabilities.
                </p>
                <Button
                  onClick={() => router.push('/dashboard/assessments')}
                  className="bg-arise-gold hover:bg-arise-gold/90"
                >
                  Invite Evaluators
                </Button>
              </div>
            )}

            <div className="rounded-lg bg-green-50 p-6">
              <h3 className="mb-2 font-semibold text-green-900">
                Create Your Development Plan
              </h3>
              <p className="text-sm text-green-800">
                Use these insights to create a personalized development plan focusing on your growth areas while leveraging your strengths.
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-6">
              <h3 className="mb-2 font-semibold text-purple-900">
                Schedule Coaching
              </h3>
              <p className="text-sm text-purple-800">
                Work with an ARISE coach to dive deeper into your results and create actionable strategies for leadership development.
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
