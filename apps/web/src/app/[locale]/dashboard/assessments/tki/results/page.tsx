'use client';

/**
 * TKI Assessment Results Page (Improved)
 * Displays TKI results with radar chart, insights, and recommendations
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult } from '@/lib/api/assessments';
import { tkiModes } from '@/data/tkiQuestions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import TKIRadarChart from '@/components/assessments/charts/TKIRadarChart';
import InsightCard from '@/components/assessments/InsightCard';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download } from 'lucide-react';

export default function TKIResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentId) {
      loadResults();
    }
  }, [assessmentId]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await getAssessmentResults(Number(assessmentId));
      setResults(data);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(errorMessage || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const getModeInfo = (modeId: string) => {
    return tkiModes.find((m) => m.id === modeId);
  };

  const getModeLevel = (count: number): 'low' | 'moderate' | 'high' => {
    const percentage = Math.round((count / 12) * 100);
    if (percentage >= 66) return 'high';
    if (percentage >= 33) return 'moderate';
    return 'low';
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

  const modeScores = results.scores.mode_scores || {};
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];

  // Find dominant mode
  const sortedModes = Object.entries(modeScores).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  );
  const dominantMode = sortedModes[0]?.[0] || '';
  const dominantModeInfo = getModeInfo(dominantMode);

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
                  Your TKI Conflict Style Results
                </h1>
                <p className="text-gray-600">Understanding how you approach conflict situations</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </MotionDiv>

          {/* Dominant Mode Summary */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Your Dominant Conflict Mode
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{dominantModeInfo?.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-teal-700">{dominantModeInfo?.name}</h3>
                    <p className="text-gray-700 mt-1">{dominantModeInfo?.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Radar Chart */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Conflict Mode Profile
                </h2>
                <TKIRadarChart scores={modeScores} />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Insights</h2>
            <div className="grid gap-4">
              {Object.entries(modeScores).map(([mode, score], index) => {
                const modeInfo = getModeInfo(mode);
                const level = getModeLevel(score as number);
                const insight = insights[mode];

                return (
                  <MotionDiv
                    key={mode}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <InsightCard
                      title={modeInfo?.name || mode}
                      level={level}
                      score={score as number}
                      maxScore={12}
                      description={insight?.description || modeInfo?.description || ''}
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
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Personalized Recommendations
              </h2>
              <div className="grid gap-4">
                {recommendations.map((rec: any, index: number) => (
                  <MotionDiv
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
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
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <Card className="bg-gray-50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to explore more?</h3>
                <p className="text-gray-600 mb-4">
                  Continue your leadership development journey with our other assessments
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push('/dashboard/assessments/wellness')}>
                    Take Wellness Assessment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/assessments/360-feedback')}
                  >
                    Try 360° Feedback
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


