'use client';

/**
 * Wellness Assessment Results Page
 * Displays wellness results with bar chart, insights, and recommendations
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult } from '@/lib/api/assessments';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import WellnessBarChart from '@/components/assessments/charts/WellnessBarChart';
import InsightCard from '@/components/assessments/InsightCard';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Heart } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';

export default function WellnessResultsPage() {
  const t = useTranslations('dashboard.assessments.wellness.results');
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
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      setError(errorMessage);
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
    sleep: t('pillars.sleep'),
    nutrition: t('pillars.nutrition'),
    hydration: t('pillars.hydration'),
    movement: t('pillars.movement'),
    stress_management: t('pillars.stressManagement'),
    social_connection: t('pillars.socialConnection'),
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
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    // Ensure error is always a string before rendering
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.notFound'));
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">{errorString}</p>
              <Button 
                onClick={() => router.push('/dashboard/assessments')} 
                variant="primary"
                className="flex items-center gap-4"
                style={{ backgroundColor: '#0F4C56', color: '#fff' }}
              >
                {t('backToAssessments')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const pillarScoresRaw = results.scores.pillar_scores || {};
  // Convert pillar_scores to Record<string, number> for WellnessBarChart
  // pillar_scores can be either number or PillarScore object
  const pillarScores: Record<string, number> = Object.entries(pillarScoresRaw).reduce(
    (acc, [key, value]) => {
      acc[key] = typeof value === 'number' ? value : (value as { score?: number }).score || 0;
      return acc;
    },
    {} as Record<string, number>
  );
  const totalScore = results.scores.total_score || 0;
  const maxScore = results.scores.max_score || 150;
  const percentage = results.scores.percentage || 0;
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];

  // Find strongest and weakest pillars
  const sortedPillars = Object.entries(pillarScores).sort(
    ([, a], [, b]) => b - a
  );
  const strongestPillar = sortedPillars[0]?.[0] || '';
  const weakestPillar = sortedPillars[sortedPillars.length - 1]?.[0] || '';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <MotionDiv variant="slideUp" duration="normal" className="mb-8">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-4 flex items-center gap-4"
              style={{ backgroundColor: '#0F4C56', color: '#fff' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToAssessments')}
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600">
                  {t('subtitle')}
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {t('exportPdf')}
              </Button>
            </div>
          </MotionDiv>

          {/* Overall Score */}
          <MotionDiv variant="slideUp" duration="normal" delay={100} className="mb-8">
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {t('overallScore.title')}
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-primary-700">{totalScore}</span>
                      <span className="text-2xl text-gray-600">/ {maxScore}</span>
                      <span className="text-xl text-primary-600 ml-4">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <Heart className="w-16 h-16 text-primary-600" />
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{t('overallScore.strongestPillar')}</p>
                    <p className="font-semibold text-gray-900">
                      {pillarEmojis[strongestPillar]} {pillarNames[strongestPillar]}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{t('overallScore.areaForGrowth')}</p>
                    <p className="font-semibold text-gray-900">
                      {pillarEmojis[weakestPillar]} {pillarNames[weakestPillar]}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Bar Chart */}
          <MotionDiv variant="slideUp" duration="normal" delay={200} className="mb-8">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profile.title')}</h2>
                <WellnessBarChart scores={pillarScores} />
              </div>
            </Card>
          </MotionDiv>

          {/* Insights */}
          <MotionDiv variant="slideUp" duration="normal" delay={300} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('insights.title')}</h2>
            <div className="grid gap-4">
              {Object.entries(pillarScores).map(([pillar, score], index) => {
                const level = getPillarLevel(score as number);
                const insight = insights[pillar];

                return (
                  <MotionDiv
                    key={pillar}
                    variant="slideUp"
                    duration="fast"
                    delay={400 + index * 100}
                  >
                    <InsightCard
                      title={`${pillarEmojis[pillar] || '📊'} ${pillarNames[pillar] || pillar}`}
                      level={level}
                      score={score as number}
                      maxScore={25}
                      description={
                        insight?.description ||
                        `Your ${(pillarNames[pillar] || pillar).toLowerCase()} score indicates ${level} performance in this area.`
                      }
                    />
                  </MotionDiv>
                );
              })}
            </div>
          </MotionDiv>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <MotionDiv variant="slideUp" duration="normal" delay={900} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('recommendations.title')}
              </h2>
              <div className="grid gap-4">
                {recommendations.map((rec: any, index: number) => (
                  <MotionDiv
                    key={index}
                    variant="slideUp"
                    duration="fast"
                    delay={1000 + index * 100}
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
          <MotionDiv variant="slideUp" duration="normal" delay={1400} className="text-center">
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



