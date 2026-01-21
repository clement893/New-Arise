'use client';

/**
 * Wellness Assessment Results Page
 * Displays wellness results with bar chart, insights, and recommendations
 */

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult } from '@/lib/api/assessments';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Heart, CheckCircle } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';
import { getWellnessInsightWithLocale, getScoreColorCode } from '@/data/wellnessInsights';

export default function WellnessResultsPage() {
  const t = useTranslations('dashboard.assessments.wellness.results');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Translations for insight levels and section headers
  const translations = {
    en: {
      keyInsights: 'Key Insights',
      strengths: 'Strengths',
      areasForGrowth: 'Areas for Growth',
      noStrengths: 'No strengths identified yet. Keep building your wellness habits!',
      allStrong: 'Great work! All pillars are showing strong performance.',
      strongFoundation: 'STRONG FOUNDATION - Healthy habits are established and practiced most of the time. Continuing to refine and maintain consistency will keep this pillar robust.',
      consistencyStage: 'CONSISTENCY STAGE - Good habits are in place and showing progress, though not always steady. With more regularity, this pillar can become a solid strength.',
      earlyDevelopment: 'EARLY DEVELOPMENT - Some positive habits are present, but they are irregular or not yet sustainable. Building consistency will strengthen this pillar.',
      significantOpportunity: 'SIGNIFICANT GROWTH OPPORTUNITY - Currently limited or inconsistent practices in this area. A focused effort can create meaningful improvement in your overall well-being.'
    },
    fr: {
      keyInsights: 'Insights clés',
      strengths: 'Forces',
      areasForGrowth: 'Domaines de croissance',
      noStrengths: 'Aucune force identifiée pour le moment. Continuez à développer vos habitudes de bien-être!',
      allStrong: 'Excellent travail! Tous les piliers montrent une forte performance.',
      strongFoundation: 'FONDATION SOLIDE - Les habitudes saines sont établies et pratiquées la plupart du temps. Continuer à les raffiner et maintenir la cohérence gardera ce pilier robuste.',
      consistencyStage: 'STADE DE COHÉRENCE - Les bonnes habitudes sont en place et progressent, bien que pas toujours de façon régulière. Avec plus de régularité, ce pilier peut devenir une force solide.',
      earlyDevelopment: 'DÉVELOPPEMENT PRÉCOCE - Certaines habitudes positives sont présentes, mais elles sont irrégulières ou pas encore durables. Construire la cohérence renforcera ce pilier.',
      significantOpportunity: 'OPPORTUNITÉ DE CROISSANCE SIGNIFICATIVE - Pratiques actuellement limitées ou incohérentes dans ce domaine. Un effort concentré peut créer une amélioration significative de votre bien-être général.'
    }
  };
  const tr = translations[locale as 'en' | 'fr'] || translations.en;

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

  const pillarNames: Record<string, string> = {
    sleep: t('pillars.sleep'),
    nutrition: t('pillars.nutrition'),
    movement: t('pillars.movement'),
    avoidance_of_risky_substances: 'Avoidance of Risky Substances',
    stress_management: t('pillars.stressManagement'),
    social_connection: t('pillars.socialConnection'),
  };

  const pillarEmojis: Record<string, string> = {
    sleep: '😴',
    nutrition: '🥗',
    movement: '🏃',
    avoidance_of_risky_substances: '🚭',
    stress_management: '🧘',
    social_connection: '🤝',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    // Ensure error is always a string before rendering
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.notFound'));
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
  const recommendations = results.recommendations || [];

  // Find strongest and weakest pillars
  const sortedPillars = Object.entries(pillarScores).sort(
    ([, a], [, b]) => b - a
  );
  const strongestPillar = sortedPillars[0]?.[0] || '';
  const weakestPillar = sortedPillars[sortedPillars.length - 1]?.[0] || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <MotionDiv variant="slideUp" duration="normal" className="mb-8">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-4 flex items-center gap-4"
              style={{ backgroundColor: '#0F4C56', color: '#fff' }}
            >
              <ArrowLeft className="w-4 h-4" />
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
            </Card>
          </MotionDiv>

          {/* Key Insights: Strengths and Areas for Growth */}
          <MotionDiv variant="slideUp" duration="normal" delay={150} className="mb-8">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{tr.keyInsights}</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {tr.strengths}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(pillarScores)
                        .filter(([, score]) => score >= 16)
                        .map(([pillar, score]) => {
                          const colorCode = getScoreColorCode(score as number);
                          let levelText = '';
                          if (score >= 21) {
                            levelText = tr.strongFoundation;
                          } else if (score >= 16) {
                            levelText = tr.consistencyStage;
                          }
                          
                          return (
                            <div key={pillar} className="p-4 rounded-lg" style={{ backgroundColor: colorCode + '15' }}>
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{pillarEmojis[pillar] || '📊'}</span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{pillarNames[pillar]}</h4>
                                    <span className="text-sm font-bold" style={{ color: colorCode }}>
                                      {score}/25
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">{levelText}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {Object.entries(pillarScores).filter(([, score]) => score >= 16).length === 0 && (
                        <p className="text-sm text-gray-500 italic">{tr.noStrengths}</p>
                      )}
                    </div>
                  </div>

                  {/* Areas for Growth */}
                  <div>
                    <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {tr.areasForGrowth}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(pillarScores)
                        .filter(([, score]) => score < 16)
                        .map(([pillar, score]) => {
                          const colorCode = getScoreColorCode(score as number);
                          let levelText = '';
                          if (score >= 11) {
                            levelText = tr.earlyDevelopment;
                          } else {
                            levelText = tr.significantOpportunity;
                          }
                          
                          return (
                            <div key={pillar} className="p-4 rounded-lg" style={{ backgroundColor: colorCode + '15' }}>
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{pillarEmojis[pillar] || '📊'}</span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{pillarNames[pillar]}</h4>
                                    <span className="text-sm font-bold" style={{ color: colorCode }}>
                                      {score}/25
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">{levelText}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {Object.entries(pillarScores).filter(([, score]) => score < 16).length === 0 && (
                        <p className="text-sm text-gray-500 italic">{tr.allStrong}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Wellness Pillars with Insights */}
          <MotionDiv variant="slideUp" duration="normal" delay={200} className="mb-8">
            <div className="grid gap-6">
              {Object.entries(pillarScores).map(([pillar, score], index) => {
                const insightData = getWellnessInsightWithLocale(pillar, score as number, locale);
                const colorCode = getScoreColorCode(score as number);
                
                // Fallback to generic insight if no specific insight is found
                const pillarDisplayName = pillarNames[pillar] || pillar.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const description = insightData?.assessment || `Your ${pillarDisplayName.toLowerCase()} score is ${score} out of 25.`;

                return (
                  <MotionDiv
                    key={pillar}
                    variant="slideUp"
                    duration="fast"
                    delay={300 + index * 100}
                  >
                    <Card className="overflow-hidden">
                      <div className="p-6">
                        {/* Header: Icon and Title on same line */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">{pillarEmojis[pillar] || '📊'}</span>
                          <h3 className="text-xl font-semibold text-gray-900 flex-1">
                            {pillarDisplayName}
                          </h3>
                        </div>

                        {/* Description in full width below header */}
                        <p className="text-sm text-gray-600 mb-4">
                          {description}
                        </p>
                        
                        {/* Score and Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Score</span>
                            <span className="text-sm font-bold text-gray-900">
                              {score as number} / 25
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${((score as number) / 25) * 100}%`,
                                backgroundColor: colorCode
                              }}
                            />
                          </div>
                        </div>

                        {/* Recommendation */}
                        {insightData?.recommendation && (
                          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: colorCode + '20' }}>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed">
                              {insightData.recommendation}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {insightData?.actions && insightData.actions.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Recommended Actions:
                            </h4>
                            <ul className="space-y-2">
                              {insightData.actions.map((action, actionIndex) => (
                                <li 
                                  key={actionIndex}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colorCode }} />
                                  <span className="text-gray-700">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Card>
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
                    Take ARISE Assessment
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
  );
}



