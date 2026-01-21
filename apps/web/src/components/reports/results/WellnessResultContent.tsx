'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { AssessmentResult, PillarScore } from '@/lib/api/assessments';
import { wellnessPillars } from '@/data/wellnessQuestionsReal';
import WellnessRadarChart from '@/components/assessments/charts/WellnessRadarChart';
import { getWellnessInsightWithLocale, getScoreColorCode } from '@/data/wellnessInsights';

interface WellnessResultContentProps {
  results: AssessmentResult;
  assessmentId: number;
}

export default function WellnessResultContent({ results, assessmentId }: WellnessResultContentProps) {
  const t = useTranslations('dashboard.assessments.results');
  const tWellness = useTranslations('dashboard.assessments.wellness.results');
  const locale = useLocale();

  const { scores } = results;

  // Ensure all numeric values are numbers
  const rawPercentage = scores?.percentage;
  const safePercentage = typeof rawPercentage === 'number' 
    ? rawPercentage 
    : typeof rawPercentage === 'string' 
    ? parseFloat(rawPercentage) 
    : 0;

  const rawTotalScore = scores?.total_score;
  const safeTotalScore = typeof rawTotalScore === 'number'
    ? rawTotalScore
    : typeof rawTotalScore === 'string'
    ? parseInt(rawTotalScore, 10)
    : 0;

  const rawMaxScore = scores?.max_score;
  const safeMaxScore = typeof rawMaxScore === 'number'
    ? rawMaxScore
    : typeof rawMaxScore === 'string'
    ? parseInt(rawMaxScore, 10)
    : 150;

  const pillar_scores = scores?.pillar_scores || {};

  const insightLevelTexts = {
    en: {
      strongFoundation: 'STRONG FOUNDATION - Healthy habits are established and practiced most of the time.',
      consistencyStage: 'CONSISTENCY STAGE - Good habits are in place and showing progress.',
      earlyDevelopment: 'EARLY DEVELOPMENT - Some positive habits are present, but they are irregular.',
      significantOpportunity: 'SIGNIFICANT GROWTH OPPORTUNITY - Currently limited or inconsistent practices.',
      noStrengths: 'No strengths identified yet. Keep building your wellness habits!',
      allStrong: 'Great work! All pillars are showing strong performance.'
    },
    fr: {
      strongFoundation: 'FONDATION SOLIDE - Les habitudes saines sont établies et pratiquées la plupart du temps.',
      consistencyStage: 'STADE DE COHÉRENCE - Les bonnes habitudes sont en place et progressent.',
      earlyDevelopment: 'DÉVELOPPEMENT PRÉCOCE - Certaines habitudes positives sont présentes, mais irrégulières.',
      significantOpportunity: 'OPPORTUNITÉ DE CROISSANCE SIGNIFICATIVE - Pratiques actuellement limitées ou incohérentes.',
      noStrengths: 'Aucune force identifiée pour le moment.',
      allStrong: 'Excellent travail! Tous les piliers montrent une forte performance.'
    }
  };
  const levelText = insightLevelTexts[locale as 'en' | 'fr'] || insightLevelTexts.en;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-arise-deep-teal to-arise-deep-teal/80 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Overall Score */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp size={40} className="mr-4" />
              <div className="text-6xl font-bold">{safePercentage.toFixed(0)}%</div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {(() => {
                if (safePercentage < 60) return t('overallScore.ranges.needsImprovement');
                else if (safePercentage >= 60 && safePercentage <= 74) return t('overallScore.ranges.developing');
                else if (safePercentage >= 75 && safePercentage <= 85) return t('overallScore.ranges.strong');
                else return t('overallScore.ranges.excellent');
              })()}
            </h2>
            <p className="text-white/90 text-lg">
              {t('overallScore.points', { score: safeTotalScore, max: safeMaxScore })}
            </p>
          </div>

          {/* Right side - Wellness Radar */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-4 text-center">ARISE Wellness Radar</h3>
            <div className="bg-white rounded-lg p-2 w-full">
              <WellnessRadarChart 
                scores={(() => {
                  const simpleScores: Record<string, number> = {};
                  Object.entries(pillar_scores).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                      simpleScores[key] = value;
                    } else if (typeof value === 'object' && value !== null && 'score' in value) {
                      simpleScores[key] = typeof value.score === 'number' ? value.score : 0;
                    }
                  });
                  return simpleScores;
                })()}
                labels={(() => {
                  const translatedLabels: Record<string, string> = {};
                  wellnessPillars.forEach(pillar => {
                    const pillarKey = pillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    try {
                      const translated = tWellness(`pillars.${pillarKey}`);
                      if (translated && !translated.includes('pillars.')) {
                        translatedLabels[pillar.id] = translated;
                      } else {
                        translatedLabels[pillar.id] = pillar.name;
                      }
                    } catch (e) {
                      translatedLabels[pillar.id] = pillar.name;
                    }
                  });
                  return translatedLabels;
                })()}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Pillar Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wellnessPillars.map((pillar) => {
          const rawPillarData = pillar_scores?.[pillar.id];
          const isPillarScoreObject = (data: number | PillarScore | undefined): data is PillarScore => {
            return typeof data === 'object' && data !== null && 'score' in data;
          };

          let pillarScore: number = 0;
          if (isPillarScoreObject(rawPillarData)) {
            const scoreValue = rawPillarData.score;
            pillarScore = typeof scoreValue === 'number' ? scoreValue : 0;
          } else if (typeof rawPillarData === 'number') {
            pillarScore = rawPillarData;
          }

          const pillarPercentage = (pillarScore / 25) * 100;

          const pillarKey = pillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          let displayName = pillar.name;
          try {
            const translated = tWellness(`pillars.${pillarKey}`);
            if (translated && !translated.includes('pillars.')) {
              displayName = translated;
            }
          } catch (e) {
            // Use fallback
          }

          const insightData = getWellnessInsightWithLocale(pillar.id, pillarScore, locale);

          return (
            <Card key={pillar.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{pillar.icon}</div>
                <h3 className="text-base font-bold text-gray-900">{displayName}</h3>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {insightData?.assessment || pillar.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('pillarScore.label')}</span>
                  <span className="font-bold text-arise-deep-teal">
                    {pillarScore} / 25
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="rounded-full h-3 transition-all duration-500"
                    style={{ 
                      width: `${pillarPercentage}%`,
                      backgroundColor: getScoreColorCode(pillarScore)
                    }}
                  />
                </div>
              </div>

              {/* Recommendation and Actions */}
              {insightData && (
                <div className="mt-3">
                  {insightData.recommendation && (
                    <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: getScoreColorCode(pillarScore) + '20' }}>
                      <p className="text-sm text-gray-800 font-medium">{insightData.recommendation}</p>
                    </div>
                  )}

                  {insightData.actions && insightData.actions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1.5">
                        {insightData.actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle 
                              className="w-4 h-4 flex-shrink-0 mt-0.5" 
                              style={{ color: getScoreColorCode(pillarScore) }} 
                            />
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Key Insights Section */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('insights.title')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('insights.strengths.title')}
            </h3>
            <div className="space-y-3">
              {(() => {
                const getPillarScore = (data: number | PillarScore | undefined): number => {
                  if (typeof data === 'number') return data;
                  if (typeof data === 'object' && data !== null && 'score' in data) {
                    return typeof data.score === 'number' ? data.score : 0;
                  }
                  return 0;
                };

                const strengthPillars = wellnessPillars.filter(p => {
                  const score = getPillarScore(pillar_scores?.[p.id]);
                  return score >= 16;
                });

                if (strengthPillars.length === 0) {
                  return <p className="text-sm text-gray-500 italic">{levelText.noStrengths}</p>;
                }

                return strengthPillars.map(pillar => {
                  const score = getPillarScore(pillar_scores?.[pillar.id]);
                  const colorCode = getScoreColorCode(score);
                  
                  let levelTextContent = score >= 21 ? levelText.strongFoundation : levelText.consistencyStage;

                  const pillarKey = pillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                  let displayName = pillar.name;
                  try {
                    const translated = tWellness(`pillars.${pillarKey}`);
                    if (translated && !translated.includes('pillars.')) displayName = translated;
                  } catch (e) {}

                  return (
                    <div key={pillar.id} className="p-4 rounded-lg" style={{ backgroundColor: colorCode + '15' }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pillar.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{displayName}</h4>
                            <span className="text-sm font-bold" style={{ color: colorCode }}>{score}/25</span>
                          </div>
                          <p className="text-xs text-gray-600">{levelTextContent}</p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Areas for Growth */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('insights.growth.title')}
            </h3>
            <div className="space-y-3">
              {(() => {
                const getPillarScore = (data: number | PillarScore | undefined): number => {
                  if (typeof data === 'number') return data;
                  if (typeof data === 'object' && data !== null && 'score' in data) {
                    return typeof data.score === 'number' ? data.score : 0;
                  }
                  return 0;
                };

                const growthPillars = wellnessPillars.filter(p => {
                  const score = getPillarScore(pillar_scores?.[p.id]);
                  return score < 16;
                });

                if (growthPillars.length === 0) {
                  return <p className="text-sm text-gray-500 italic">{levelText.allStrong}</p>;
                }

                return growthPillars.map(pillar => {
                  const score = getPillarScore(pillar_scores?.[pillar.id]);
                  const colorCode = getScoreColorCode(score);
                  
                  let levelTextContent = score >= 11 ? levelText.earlyDevelopment : levelText.significantOpportunity;

                  const pillarKey = pillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                  let displayName = pillar.name;
                  try {
                    const translated = tWellness(`pillars.${pillarKey}`);
                    if (translated && !translated.includes('pillars.')) displayName = translated;
                  } catch (e) {}

                  return (
                    <div key={pillar.id} className="p-4 rounded-lg" style={{ backgroundColor: colorCode + '15' }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pillar.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{displayName}</h4>
                            <span className="text-sm font-bold" style={{ color: colorCode }}>{score}/25</span>
                          </div>
                          <p className="text-xs text-gray-600">{levelTextContent}</p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
