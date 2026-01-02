'use client';

/**
 * Wellness Assessment Results Page
 * Displays wellness results with bar chart, insights, and recommendations
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult } from '@/lib/api/assessments';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import WellnessBarChart from '@/components/assessments/charts/WellnessBarChart';
import InsightCard from '@/components/assessments/InsightCard';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Heart } from 'lucide-react';

export default function WellnessResultsPage() {
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
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : undefined;
      setError(errorMessage || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const getPillarLevel = (score: number): 'low' | 'moderate' | 'high' | 'very_high' => {
    const percentage = (score / 25) * 100;
    if (percentage >= 80) return 'very_high';
    if (percentage >= 60) return 'high';
    if (percentage >= 40) return 'moderate';
    return 'low';
  };

  const pillarNames: Record<string, string> = {
    sleep: 'Sleep',
    nutrition: 'Nutrition',
    hydration: 'Hydration',
    movement: 'Movement',
    stress_management: 'Stress Management',
    social_connection: 'Social Connection',
  };

  const pillarEmojis: Record<string, string> = {
    sleep: '😴',
    nutrition: '🥗',
    hydration: '💧',
    movement: '🏃',
    stress_management: '🧘',
    social_connection: '🤝',
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

  const pillarScores = results.scores.pillar_scores || {};
  const totalScore = results.scores.total_score || 0;
  const maxScore = results.scores.max_score || 150;
  const percentage = results.scores.percentage || 0;
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];

  // Find strongest and weakest pillars
  const sortedPillars = Object.entries(pillarScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  const strongestPillar = sortedPillars[0]?.[0] || '';
  const weakestPillar = sortedPillars[sortedPillars.length - 1]?.[0] || '';

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
                  Your Wellness Assessment Results
                </h1>
                <p className="text-gray-600">
                  A comprehensive view of your well-being across 6 key pillars
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </MotionDiv>

          {/* Overall Score */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Overall Wellness Score
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-teal-700">
                        {totalScore}
                      </span>
                      <span className="text-2xl text-gray-600">/ {maxScore}</span>
                      <span className="text-xl text-teal-600 ml-4">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Heart className="w-16 h-16 text-teal-600" />
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Strongest Pillar</p>
                    <p className="font-semibold text-gray-900">
                      {pillarEmojis[strongestPillar]} {pillarNames[strongestPillar]}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Area for Growth</p>
                    <p className="font-semibold text-gray-900">
                      {pillarEmojis[weakestPillar]} {pillarNames[weakestPillar]}
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
                  Your Wellness Profile
                </h2>
                <WellnessBarChart scores={pillarScores} />
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
              Detailed Insights by Pillar
            </h2>
            <div className="grid gap-4">
              {Object.entries(pillarScores).map(([pillar, score], index) => {
                const level = getPillarLevel(score as number);
                const insight = insights[pillar];

                return (
                  <MotionDiv
                    key={pillar}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <InsightCard
                      title={`${pillarEmojis[pillar]} ${pillarNames[pillar]}`}
                      level={level}
                      score={score as number}
                      maxScore={25}
                      description={insight?.description || `Your ${pillarNames[pillar].toLowerCase()} score indicates ${level} performance in this area.`}
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
                Personalized Recommendations
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
                  Continue Your Leadership Journey
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
