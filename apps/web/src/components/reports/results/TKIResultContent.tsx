'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { AssessmentResult } from '@/lib/api/assessments';
import { tkiModes, tkiQuestions } from '@/data/tkiQuestions';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface TKIResults {
  mode_counts: Record<string, number>;
  dominant_mode: string;
  secondary_mode: string;
}

interface TKIResultContentProps {
  results: AssessmentResult;
}

export default function TKIResultContent({ results }: TKIResultContentProps) {
  const t = useTranslations('dashboard.assessments.tki.results');

  // Transform AssessmentResult to TKIResults format
  const { scores } = results;
  const scoresAny = scores as any;
  
  let modeScores: Record<string, number> = {};
  
  if (scores.mode_scores) {
    modeScores = scores.mode_scores;
  } else if (scoresAny.mode_counts) {
    modeScores = scoresAny.mode_counts;
  } else {
    const possibleModes = ['competing', 'collaborating', 'avoiding', 'accommodating', 'compromising'];
    possibleModes.forEach(mode => {
      if (typeof scoresAny[mode] === 'number') {
        modeScores[mode] = scoresAny[mode];
      }
    });
  }

  // Find dominant and secondary modes
  const sortedModes = Object.entries(modeScores)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const transformedResults: TKIResults = {
    mode_counts: modeScores as Record<string, number>,
    dominant_mode: scoresAny.dominant_mode || sortedModes[0]?.[0] || '',
    secondary_mode: scoresAny.secondary_mode || sortedModes[1]?.[0] || '',
  };

  const getModeInfo = (modeId: string) => {
    const mode = tkiModes.find(m => m.id === modeId);
    if (!mode) return null;
    
    try {
      const translatedTitle = t(`modes.${modeId}.title`);
      const translatedDescription = t(`modes.${modeId}.description`);
      return {
        ...mode,
        title: translatedTitle !== `modes.${modeId}.title` ? translatedTitle : mode.title,
        description: translatedDescription !== `modes.${modeId}.description` ? translatedDescription : mode.description,
      };
    } catch (e) {
      return mode;
    }
  };

  const getModePercentage = (count: number) => {
    const totalQuestions = tkiQuestions?.length || 30;
    return Math.round((count / totalQuestions) * 100);
  };

  const getModeLevel = (count: number): { label: string; color: string; icon: LucideIcon } => {
    const percentage = getModePercentage(count);
    if (percentage >= 40) {
      return { label: t('levels.high'), color: 'text-success-600', icon: TrendingUp };
    } else if (percentage >= 20) {
      return { label: t('levels.moderate'), color: 'text-yellow-600', icon: Minus };
    } else {
      return { label: t('levels.low'), color: 'text-gray-500', icon: TrendingDown };
    }
  };

  const getModeInsight = (modeId: string, count: number) => {
    const percentage = getModePercentage(count);
    const level = percentage >= 40 ? 'high' : percentage >= 20 ? 'moderate' : 'low';
    return t(`insights.${modeId}.${level}`, { defaultValue: '' });
  };

  const dominantModeInfo = getModeInfo(transformedResults.dominant_mode);
  const secondaryModeInfo = getModeInfo(transformedResults.secondary_mode);

  // Sort modes by count for display
  const sortedModesList = Object.entries(transformedResults.mode_counts)
    .sort(([, a], [, b]) => b - a)
    .map(([modeId, count]) => ({ modeId, count }));

  return (
    <div className="space-y-6">
      {/* Dominant & Secondary Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-white md:col-span-2" padding={false}>
          <div className="h-full p-lg bg-arise-deep-teal">
            <div className="text-center">
              <div className="text-4xl mb-3">{dominantModeInfo?.icon}</div>
              <h3 className="text-sm font-medium mb-2 opacity-95">{t('dominantMode')}</h3>
              <h2 className="text-3xl font-bold mb-2">{dominantModeInfo?.title}</h2>
              <p className="text-sm opacity-95 mb-4">
                {t('responsesCount', { 
                  count: transformedResults.dominant_mode ? (transformedResults.mode_counts[transformedResults.dominant_mode] || 0) : 0, 
                  total: 30 
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-arise-gold to-arise-gold-dark text-white md:col-span-1">
          <div className="text-center">
            <div className="text-4xl mb-3">{secondaryModeInfo?.icon}</div>
            <h3 className="text-sm font-medium mb-2 opacity-95">{t('secondaryMode')}</h3>
            <h2 className="text-3xl font-bold mb-2">{secondaryModeInfo?.title}</h2>
            <p className="text-sm opacity-95">
              {t('responsesCount', { 
                count: transformedResults.secondary_mode ? (transformedResults.mode_counts[transformedResults.secondary_mode] || 0) : 0, 
                total: 30 
              })}
            </p>
          </div>
        </Card>
        <div className="mt-4 flex justify-center">
                <Image 
                  src="/images/assessments/arise_tki_pictogram.webp" 
                  alt="ARISE TKI Pictogram" 
                  width={300} 
                  height={200} 
                  className="rounded-lg shadow-md bg-white/10 p-2"
                />
              </div>
      </div>

      {/* All Modes Breakdown */}
      <Card className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('profile.title')}
        </h2>

        <div className="space-y-6">
          {sortedModesList.map(({ modeId, count }) => {
            const modeInfo = getModeInfo(modeId);
            const level = getModeLevel(count);
            const LevelIcon = level.icon;
            const percentage = getModePercentage(count);

            return (
              <div key={modeId} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{modeInfo?.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{modeInfo?.title}</h3>
                      <p className="text-sm text-gray-700">{modeInfo?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LevelIcon size={20} className={level.color} />
                    <span className={`font-semibold ${level.color}`}>{level.label}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>{t('responses', { count })}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%`, transitionDuration: '800ms' }}
                    />
                  </div>
                </div>

                {/* Insight */}
                {getModeInsight(modeId, count) && (
                  <div className="bg-arise-beige p-4 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {getModeInsight(modeId, count)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* KEY Recommendations */}
      <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          KEY {t('recommendations.title')}
        </h2>
        <div className="space-y-3">
          <p className="text-gray-900">
            <strong>{t('recommendations.leverage.title')}</strong> {t('recommendations.leverage.description', { mode: dominantModeInfo?.title.toLowerCase() || '' })}
          </p>
          <p className="text-gray-900">
            <strong>{t('recommendations.flexibility.title')}</strong> {t('recommendations.flexibility.description')}
          </p>
          <p className="text-gray-900">
            <strong>{t('recommendations.context.title')}</strong> {t('recommendations.context.description')}
          </p>
        </div>
      </Card>
    </div>
  );
}
