'use client';

/**
 * 360° Feedback Results Page (Improved)
 * Displays 360° feedback results with bar chart, insights, and recommendations
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAssessmentResults, getMyAssessments, AssessmentResult } from '@/lib/api/assessments';
import { useFeedback360Store } from '@/stores/feedback360Store';
import { feedback360Capabilities } from '@/data/feedback360Questions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import Feedback360BarChart from '@/components/assessments/charts/Feedback360BarChart';
import InsightCard from '@/components/assessments/InsightCard';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Users, UserPlus } from 'lucide-react';

export default function Feedback360ResultsPage() {
  const router = useRouter();
  const { assessmentId } = useFeedback360Store();
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      
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
      
      const data = await getAssessmentResults(id);
      setResults(data);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : undefined;
      setError(errorMessage || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const getCapabilityLevel = (score: number): 'low' | 'moderate' | 'high' | 'very_high' => {
    const percentage = (score / 25) * 100;
    if (percentage >= 80) return 'very_high';
    if (percentage >= 60) return 'high';
    if (percentage >= 40) return 'moderate';
    return 'low';
  };

  const capabilityNames: Record<string, string> = {
    communication: 'Communication',
    team_culture: 'Team Culture',
    accountability: 'Accountability',
    talent_development: 'Talent Development',
    execution: 'Execution',
    strategic_thinking: 'Strategic Thinking',
  };

  const capabilityEmojis: Record<string, string> = {
    communication: '💬',
    team_culture: '🤝',
    accountability: '✅',
    talent_development: '🌱',
    execution: '🎯',
    strategic_thinking: '🧠',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">{error || 'Results not found'}</p>
              <Button onClick={() => router.push('/dashboard/assessments')}>
                Back to Assessments
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const capabilityScores = results.scores.capability_scores || {};
  const totalScore = results.scores.total_score || 0;
  const maxScore = results.scores.max_score || 150;
  const percentage = results.scores.percentage || 0;
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];
  const comparisonData = results.comparison_data || {};
  const hasEvaluatorResponses = comparisonData && Object.keys(comparisonData).length > 0;

  // Find strongest and weakest capabilities
  const sortedCapabilities = Object.entries(capabilityScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  const strongestCapability = sortedCapabilities[0]?.[0] || '';
  const weakestCapability = sortedCapabilities[sortedCapabilities.length - 1]?.[0] || '';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your 360° Feedback Results
                </h1>
                <p className="text-gray-600">
                  Leadership capabilities assessment
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </MotionDiv>

          {/* Evaluator Status */}
          {!hasEvaluatorResponses && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <UserPlus className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        Get Complete 360° Feedback
                      </h3>
                      <p className="text-blue-800 mb-3">
                        These results are based on your self-assessment only. Invite colleagues, managers, and direct reports to provide feedback for a complete 360° view.
                      </p>
                      <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Evaluators
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </MotionDiv>
          )}

          {/* Overall Score */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Overall Leadership Score
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-amber-700">
                        {totalScore}
                      </span>
                      <span className="text-2xl text-gray-600">/ {maxScore}</span>
                      <span className="text-xl text-amber-600 ml-4">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  {hasEvaluatorResponses && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">
                        Based on feedback from multiple evaluators
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Strongest Capability</p>
                    <p className="font-semibold text-gray-900">
                      {capabilityEmojis[strongestCapability]} {capabilityNames[strongestCapability]}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Area for Growth</p>
                    <p className="font-semibold text-gray-900">
                      {capabilityEmojis[weakestCapability]} {capabilityNames[weakestCapability]}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Bar Chart */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Leadership Capabilities Profile
                </h2>
                <Feedback360BarChart 
                  scores={capabilityScores} 
                  comparisonScores={hasEvaluatorResponses ? comparisonData : undefined}
                />
              </div>
            </Card>
          </MotionDiv>

          {/* Insights */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Detailed Insights by Capability
            </h2>
            <div className="grid gap-4">
              {Object.entries(capabilityScores).map(([capability, score], index) => {
                const level = getCapabilityLevel(score as number);
                const insight = insights[capability];

                return (
                  <MotionDiv
                    key={capability}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <InsightCard
                      title={`${capabilityEmojis[capability]} ${capabilityNames[capability]}`}
                      level={level}
                      score={score as number}
                      maxScore={25}
                      description={insight?.description || `Your ${capabilityNames[capability].toLowerCase()} score indicates ${level} performance in this leadership capability.`}
                    />
                  </MotionDiv>
                );
              })}
            </div>
          </MotionDiv>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Personalized Development Recommendations
              </h2>
              <div className="grid gap-4">
                {recommendations.map((rec: any, index: number) => (
                  <MotionDiv
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                  >
                    <RecommendationCard
                      title={rec.title}
                      description={rec.description}
                      actions={rec.actions}
                      resources={rec.resources}
                      priority={rec.priority || 'medium'}
                    />
                  </MotionDiv>
                ))}
              </div>
            </MotionDiv>
          )}

          {/* Next Steps */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="text-center"
          >
            <Card className="bg-gray-50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Continue Your Leadership Development
                </h3>
                <p className="text-gray-600 mb-4">
                  Explore other assessments to gain deeper insights into your leadership style
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push('/dashboard/assessments/tki')}>
                    Take TKI Assessment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/assessments/wellness')}
                  >
                    Try Wellness Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
