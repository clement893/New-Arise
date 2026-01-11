'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
      let modeScores: Record<string, number> = {};
      
      if (scores.mode_scores) {
        // If stored as mode_scores in database
        modeScores = scores.mode_scores;
      } else if (scores.mode_counts) {
        // If stored as mode_counts (what calculate_tki_score returns)
        modeScores = scores.mode_counts;
      } else {
        // Check if mode counts are directly in scores object
        const possibleModes = ['competing', 'collaborating', 'avoiding', 'accommodating', 'compromising'];
        possibleModes.forEach(mode => {
          if (typeof scores[mode] === 'number') {
            modeScores[mode] = scores[mode];
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
    return tkiModes.find(m => m.id === modeId);
  };

  const getModePercentage = (count: number) => {
    // Use actual question count from tkiQuestions array instead of hardcoded value
    const totalQuestions = tkiQuestions?.length || 30;
    return Math.round((count / totalQuestions) * 100);
  };

  const getModeLevel = (count: number): { label: string; color: string; icon: LucideIcon } => {
    const percentage = getModePercentage(count);
    if (percentage >= 40) {
      return { label: 'High', color: 'text-success-600', icon: TrendingUp };
    } else if (percentage >= 20) {
      return { label: 'Moderate', color: 'text-yellow-600', icon: Minus };
    } else {
      return { label: 'Low', color: 'text-gray-500', icon: TrendingDown };
    }
  };

  const getModeInsight = (modeId: string, count: number) => {
    const percentage = getModePercentage(count);
    const insights: Record<string, Record<string, string>> = {
      competing: {
        high: 'You tend to pursue your own concerns assertively, which can be effective in emergencies or when quick decisions are needed.',
        moderate: 'You use competing when necessary, balancing it with other approaches.',
        low: 'You rarely use a competing approach, preferring more collaborative or accommodating styles.',
      },
      collaborating: {
        high: 'You excel at finding win-win solutions that fully satisfy both parties. This is ideal for complex issues requiring diverse perspectives.',
        moderate: 'You use collaboration when appropriate, though you may also rely on other conflict modes.',
        low: 'You may benefit from developing your collaborative skills to find more integrative solutions.',
      },
      compromising: {
        high: 'You frequently seek middle-ground solutions, which can be efficient when time is limited or when goals are moderately important.',
        moderate: 'You use compromise as one of several conflict management tools in your repertoire.',
        low: 'You tend to favor other approaches over compromise, which may mean you seek more complete solutions.',
      },
      avoiding: {
        high: 'You often postpone or withdraw from conflicts. While useful for trivial issues, overuse may leave important matters unresolved.',
        moderate: 'You strategically avoid conflicts when appropriate, such as when emotions are high or more information is needed.',
        low: 'You rarely avoid conflicts, preferring to address issues directly.',
      },
      accommodating: {
        high: 'You frequently yield to others\' concerns. This builds goodwill but may lead to your needs being overlooked if overused.',
        moderate: 'You accommodate others when it makes sense, balancing their needs with your own.',
        low: 'You rarely accommodate others, which may indicate a strong focus on your own goals.',
      },
    };

    const level = percentage >= 40 ? 'high' : percentage >= 20 ? 'moderate' : 'low';
    return insights[modeId]?.[level] || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arise-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
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
            <p className="text-red-600 mb-4">{typeof error === 'string' ? error : formatError(error || 'No results found')}</p>
            <Button onClick={() => router.push('/dashboard/assessments')}>
              Back to Assessments
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
            <Button
              onClick={() => router.push('/dashboard/assessments')}
              variant="outline"
              className="mb-6"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Assessments
            </Button>

            <div className="mb-8 pb-6">
              <h1 className="text-4xl font-bold text-arise-teal mb-2">
                TKI Conflict Style Results
              </h1>
              <p className="text-white">
                Your conflict management profile
              </p>
            </div>

            {/* Dominant & Secondary Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-lg border shadow-sm bg-gradient-to-br from-arise-teal to-arise-teal-dark text-white p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3 text-white">{dominantModeInfo?.icon}</div>
                  <h3 className="text-sm font-medium opacity-90 mb-2 text-white">Dominant Mode</h3>
                  <h2 className="text-3xl font-bold mb-2 text-white">{dominantModeInfo?.title}</h2>
                  <p className="text-sm opacity-90 text-white">
                    {results.dominant_mode ? (results.mode_counts[results.dominant_mode] || 0) : 0} out of 30 responses
                  </p>
                </div>
              </div>

              <div className="rounded-lg border shadow-sm bg-gradient-to-br from-arise-gold to-arise-gold-dark text-white p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3 text-white">{secondaryModeInfo?.icon}</div>
                  <h3 className="text-sm font-medium opacity-90 mb-2 text-white">Secondary Mode</h3>
                  <h2 className="text-3xl font-bold mb-2 text-white">{secondaryModeInfo?.title}</h2>
                  <p className="text-sm opacity-90 text-white">
                    {results.secondary_mode ? (results.mode_counts[results.secondary_mode] || 0) : 0} out of 30 responses
                  </p>
                </div>
              </div>
            </div>

            {/* All Modes Breakdown */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-arise-teal mb-6">
                Your Conflict Management Profile
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
                            <h3 className="font-bold text-gray-900">{modeInfo?.title}</h3>
                            <p className="text-sm text-gray-600">{modeInfo?.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <LevelIcon size={20} className={level.color} />
                          <span className={`font-semibold ${level.color}`}>{level.label}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{count} responses</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-arise-teal h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%`, transitionDuration: '800ms' }}
                          />
                        </div>
                      </div>

                      {/* Insight */}
                      <div className="bg-arise-beige p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {getModeInsight(modeId, count)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
              <h2 className="text-2xl font-bold text-arise-teal mb-4">
                Recommendations
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Leverage your strengths:</strong> Your dominant {dominantModeInfo?.title.toLowerCase()} style can be very effective in appropriate situations. Continue to use it when it serves you well.
                </p>
                <p className="text-gray-700">
                  <strong>Develop flexibility:</strong> Consider situations where your less-used modes might be more effective. Expanding your conflict management repertoire will make you a more adaptable leader.
                </p>
                <p className="text-gray-700">
                  <strong>Context matters:</strong> No single conflict mode is best in all situations. The most effective leaders can flex between different approaches based on the context, relationship, and importance of the issue.
                </p>
              </div>
            </Card>
          </MotionDiv>
        </div>
    </div>
  );
}

