'use client';

import { useTranslations, useLocale } from 'next-intl';
import { AssessmentType, AssessmentResult, PillarScore } from '@/lib/api/assessments';
import { wellnessPillars } from '@/data/wellnessQuestionsReal';
import { feedback360Capabilities } from '@/data/feedback360Questions';
import { tkiModes } from '@/data/tkiQuestions';
import { getScoreColorCode } from '@/data/wellnessInsights';
import { get360ScoreColorCode } from '@/data/feedback360Insights';

interface AssessmentResultsBarsProps {
  assessmentType: AssessmentType;
  results: AssessmentResult | null;
}

// Type guard to check if a value is a PillarScore object
function isPillarScore(value: unknown): value is PillarScore {
  return typeof value === 'object' && value !== null && 'score' in value;
}

export default function AssessmentResultsBars({ assessmentType, results }: AssessmentResultsBarsProps) {
  const t = useTranslations('dashboard.assessments');
  const locale = useLocale();

  if (!results || !results.scores) {
    return null;
  }

  const { scores } = results;

  // Wellness Assessment - Show pillar bars
  if (assessmentType === 'WELLNESS') {
    const pillar_scores = scores?.pillar_scores || {};
    
    // Get all pillars with scores and sort by score (descending)
    const pillarsWithScores = wellnessPillars
      .map((pillar) => {
        const rawPillarData = pillar_scores?.[pillar.id];
        let pillarScore: number = 0;
        
        if (isPillarScore(rawPillarData)) {
          const scoreValue = rawPillarData.score;
          pillarScore = typeof scoreValue === 'number' ? scoreValue : 0;
        } else if (typeof rawPillarData === 'number') {
          pillarScore = rawPillarData;
        }
        
        return { pillar, score: pillarScore };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    if (pillarsWithScores.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Pillar Scores:</h4>
        <div className="space-y-2">
          {pillarsWithScores.map(({ pillar, score: pillarScore }) => {
            const pillarPercentage = (pillarScore / 25) * 100;
            const colorCode = getScoreColorCode(pillarScore);

            return (
              <div key={pillar.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate">{pillar.name}</span>
                  <span className="font-semibold text-gray-700">{pillarScore}/25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="rounded-full h-2 transition-all duration-300"
                    style={{ 
                      width: `${pillarPercentage}%`,
                      backgroundColor: colorCode
                    }}
                  />
                </div>
              </div>
            );
          })}
          {wellnessPillars.length > pillarsWithScores.length && (
            <p className="text-xs text-gray-500 italic">+ {wellnessPillars.length - pillarsWithScores.length} more pillars</p>
          )}
        </div>
      </div>
    );
  }

  // 360 Feedback Assessment - Show capability bars
  if (assessmentType === 'THREE_SIXTY_SELF') {
    const capability_scores = scores?.capability_scores || {};
    
    // Transform capability scores to array format and sort by score (descending)
    const capabilityScoresArray = Object.entries(capability_scores)
      .map(([capability, score]) => {
        const rawScoreValue = isPillarScore(score) ? score.score : (typeof score === 'number' ? score : 0);
        // Convert sum (max 25) to average (max 5.0) by dividing by 5
        const averageScore = rawScoreValue / 5;
        
        return {
          capability,
          self_score: averageScore,
        };
      })
      .filter(({ self_score }) => self_score > 0)
      .sort((a, b) => b.self_score - a.self_score)
      .slice(0, 3);

    if (capabilityScoresArray.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Capability Scores:</h4>
        <div className="space-y-2">
          {capabilityScoresArray.map((capScore) => {
            const capInfo = feedback360Capabilities.find(c => c.id === capScore.capability);
            const capabilityTitle = capInfo?.title || capScore.capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const percentage = (capScore.self_score / 5) * 100;
            const colorCode = get360ScoreColorCode(capScore.self_score);

            return (
              <div key={capScore.capability} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate">{capabilityTitle}</span>
                  <span className="font-semibold text-gray-700">{capScore.self_score.toFixed(1)}/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="rounded-full h-2 transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: colorCode
                    }}
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(capability_scores).length > capabilityScoresArray.length && (
            <p className="text-xs text-gray-500 italic">+ {Object.keys(capability_scores).length - capabilityScoresArray.length} more capabilities</p>
          )}
        </div>
      </div>
    );
  }

  // TKI Assessment - Show mode bars
  if (assessmentType === 'TKI') {
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

    const sortedModes = Object.entries(modeScores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);

    if (sortedModes.length === 0) {
      return null;
    }

    const totalQuestions = 30;
    
    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Mode Scores:</h4>
        <div className="space-y-2">
          {sortedModes.map(([modeId, count]) => {
            const mode = tkiModes.find(m => m.id === modeId);
            const modeTitle = mode?.title || modeId;
            const percentage = Math.round((count / totalQuestions) * 100);

            return (
              <div key={modeId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate">{modeTitle}</span>
                  <span className="font-semibold text-gray-700">{count}/30 ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(modeScores).length > 3 && (
            <p className="text-xs text-gray-500 italic">+ {Object.keys(modeScores).length - 3} more modes</p>
          )}
        </div>
      </div>
    );
  }

  // MBTI - No bars needed, just show the type
  return null;
}
