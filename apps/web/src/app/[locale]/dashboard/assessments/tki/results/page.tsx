'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { getAssessmentResults } from '@/lib/api/assessments';
import { tkiModes, tkiQuestions } from '@/data/tkiQuestions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, LucideIcon } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';

interface TKIResults {
  mode_counts: Record<string, number>;
  dominant_mode: string;
  secondary_mode: string;
}

export default function TKIResultsPage() {
  const t = useTranslations('dashboard.assessments.tki.results');
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [results, setResults] = useState<TKIResults | null>(null);
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

      // Transform AssessmentResult to TKIResults format
      const { scores } = data;
      
      // Handle different possible score structures
      // Backend returns mode_counts, but it might be stored as mode_scores in the database
      // Use type assertion to access properties that may not be in the type definition
      const scoresAny = scores as any;
      let modeScores: Record<string, number> = {};
      
      if (scores.mode_scores) {
        // If stored as mode_scores in database
        modeScores = scores.mode_scores;
      } else if (scoresAny.mode_counts) {
        // If stored as mode_counts (what calculate_tki_score returns)
        modeScores = scoresAny.mode_counts;
      } else {
        // Check if mode counts are directly in scores object
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
        dominant_mode: sortedModes[0]?.[0] || '',
        secondary_mode: sortedModes[1]?.[0] || '',
      };

      setResults(transformedResults);
    } catch (err: unknown) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('[TKI Results] Failed to load results:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeInfo = (modeId: string) => {
    const mode = tkiModes.find(m => m.id === modeId);
    if (!mode) return null;
    
    // Translate title and description
    try {
      const translatedTitle = t(`modes.${modeId}.title`);
      const translatedDescription = t(`modes.${modeId}.description`);
      return {
        ...mode,
        title: translatedTitle !== `modes.${modeId}.title` ? translatedTitle : mode.title,
        description: translatedDescription !== `modes.${modeId}.description` ? translatedDescription : mode.description,
      };
    } catch (e) {
      // Fallback to original if translation fails
      return mode;
    }
  };

  const getModePercentage = (count: number) => {
    // Use actual question count from tkiQuestions array instead of hardcoded value
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arise-teal mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <div className="text-center">
            {/* Ensure error is always a string before rendering */}
            <p className="text-red-600 mb-4">{typeof error === 'string' ? error : formatError(error || t('errors.notFound'))}</p>
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

  const dominantModeInfo = getModeInfo(results.dominant_mode);
  const secondaryModeInfo = getModeInfo(results.secondary_mode);

  // Sort modes by count for display
  const sortedModes = Object.entries(results.mode_counts)
    .sort(([, a], [, b]) => b - a)
    .map(([modeId, count]) => ({ modeId, count }));

  return (
    <div className="relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8">
          <MotionDiv variant="slideUp" duration="normal">

            <div className="mb-8 pb-6">
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFF' }}>
                {t('title')}
              </h1>
              <p style={{ color: '#FFF', opacity: 0.8 }}>
                {t('subtitle')}
              </p>
            </div>

            {/* Dominant & Secondary Modes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-lg border shadow-sm bg-gradient-to-br from-arise-teal to-arise-teal-dark p-6 md:col-span-2">
                <div className="text-center">
                  <div className="text-4xl mb-3">{dominantModeInfo?.icon}</div>
                  <h3 className="text-sm font-medium mb-2 text-white opacity-95">{t('dominantMode')}</h3>
                  <h2 className="text-3xl font-bold mb-2 text-white">{dominantModeInfo?.title}</h2>
                  <p className="text-sm text-white opacity-95">
                    {t('responsesCount', { count: results.dominant_mode ? (results.mode_counts[results.dominant_mode] || 0) : 0, total: 30 })}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border shadow-sm bg-gradient-to-br from-arise-gold to-arise-gold-dark p-6 md:col-span-1">
                <div className="text-center">
                  <div className="text-4xl mb-3">{secondaryModeInfo?.icon}</div>
                  <h3 className="text-sm font-medium mb-2 text-white opacity-95">{t('secondaryMode')}</h3>
                  <h2 className="text-3xl font-bold mb-2 text-white">{secondaryModeInfo?.title}</h2>
                  <p className="text-sm text-white opacity-95">
                    {t('responsesCount', { count: results.secondary_mode ? (results.mode_counts[results.secondary_mode] || 0) : 0, total: 30 })}
                  </p>
                </div>
              </div>
            </div>

            {/* All Modes Breakdown */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                {t('profile.title')}
              </h2>

              <div className="space-y-6">
                {sortedModes.map(({ modeId, count }) => {
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
                            <h3 className="font-bold text-black">{modeInfo?.title}</h3>
                            <p className="text-sm text-black">{modeInfo?.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <LevelIcon size={20} className={level.color} />
                          <span className={`font-semibold ${level.color}`}>{level.label}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-black mb-1">
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
                      <div className="bg-arise-beige p-4 rounded-lg">
                        <p className="text-sm text-black">
                          {getModeInsight(modeId, count)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* KEY Recommendations */}
            <Card className="bg-arise-gold/10 border-2 border-arise-gold/30 mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                KEY {t('recommendations.title')}
              </h2>
              <div className="space-y-3">
                <p className="text-black">
                  <strong>{t('recommendations.leverage.title')}</strong> {t('recommendations.leverage.description', { mode: dominantModeInfo?.title.toLowerCase() || '' })}
                </p>
                <p className="text-black">
                  <strong>{t('recommendations.flexibility.title')}</strong> {t('recommendations.flexibility.description')}
                </p>
                <p className="text-black">
                  <strong>{t('recommendations.context.title')}</strong> {t('recommendations.context.description')}
                </p>
              </div>
            </Card>

            {/* Back button at bottom */}
            <div className="flex justify-center mt-8">
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
          </MotionDiv>
        </div>
    </div>
  );
}

