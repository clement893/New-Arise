'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { AssessmentResult } from '@/lib/api/assessments';
import { mbtiTypes } from '@/data/mbtiQuestions';
import { Brain } from 'lucide-react';

interface MBTIResultContentProps {
  results: AssessmentResult;
}

export default function MBTIResultContent({ results }: MBTIResultContentProps) {
  const t = useTranslations('dashboard.assessments.mbti.results');

  const mbtiType = results.scores?.mbti_type || 'XXXX';
  const dimensionPreferences = results.scores?.dimension_preferences || {};
  const insights = results.insights || {};
  const isFromOCR = results.scores?.source === 'pdf_ocr';
  
  // Extract base type without variant (e.g., "ISFP-T" -> "ISFP")
  const baseType = mbtiType.split('-')[0] || 'XXXX';
  const typeInfo = mbtiTypes[baseType] || {
    name: 'Unknown Type',
    description: 'Type description not available.',
    strengths: [],
  };

  // Use personality description from URL import if available
  const personalityDescription = (results.scores as any)?.personality_description || 
                                  insights.description || 
                                  typeInfo.description;

  // Get dimension details if available (from URL import)
  const dimensionDetails = (results.scores as any)?.dimension_details || {};

  const translateStrengthOrChallenge = (text: string): string => {
    try {
      const strengthKey = `strengths.translations.${text}`;
      const strengthTranslation = t(strengthKey);
      if (strengthTranslation && strengthTranslation !== strengthKey) {
        return strengthTranslation;
      }
    } catch (e) {
      // Try challenges
    }
    
    try {
      const challengeKey = `strengths.challenges.${text}`;
      const challengeTranslation = t(challengeKey);
      if (challengeTranslation && challengeTranslation !== challengeKey) {
        return challengeTranslation;
      }
    } catch (e) {
      // Return original
    }
    
    return text;
  };

  const getDimensionLabel = (dimension: string): string => {
    const labels: Record<string, string> = {
      EI: t('dimensions.energySource'),
      SN: t('dimensions.informationGathering'),
      TF: t('dimensions.decisionMaking'),
      JP: t('dimensions.lifestyle'),
      Energy: 'Energy',
      Mind: 'Mind',
      Nature: 'Nature',
      Tactics: 'Tactics',
      Identity: 'Identity',
    };
    return labels[dimension] || dimension;
  };

  return (
    <div className="space-y-6">
      {/* Personality Type Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center">
              <span className={`font-bold text-white ${mbtiType.length > 4 ? 'text-2xl' : 'text-4xl'}`}>
                {mbtiType}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{typeInfo.name}</h2>
            <p className="text-lg text-gray-700 mb-4">{personalityDescription}</p>
            {isFromOCR && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
                <Brain size={14} />
                {t('ocrBadge')}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {typeInfo.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {translateStrengthOrChallenge(strength)}
                </span>
              ))}
            </div>
          </div>
          <Brain className="w-16 h-16 text-purple-600 flex-shrink-0" />
        </div>
      </Card>

      {/* Dimension Breakdown */}
      <Card className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dimensions.title')}</h2>
        <div className="grid gap-4">
          {/* Check if we have dimension_details from URL import (preferred) */}
          {Object.keys(dimensionDetails).length > 0 ? (
            // Render using dimension_details (from 16Personalities URL import)
            ['Energy', 'Mind', 'Nature', 'Tactics', 'Identity'].map((dimName) => {
              const dimInfo = dimensionDetails[dimName];
              if (!dimInfo) return null;

              const { trait, percentage, description, image_url, image_alt } = dimInfo;
              const oppositePercentage = 100 - percentage;
              
              const oppositeTraitMap: Record<string, Record<string, string>> = {
                'Energy': { 'Introverted': 'Extraverted', 'Extraverted': 'Introverted' },
                'Mind': { 'Observant': 'Intuitive', 'Intuitive': 'Observant' },
                'Nature': { 'Feeling': 'Thinking', 'Thinking': 'Feeling' },
                'Tactics': { 'Prospecting': 'Judging', 'Judging': 'Prospecting' },
                'Identity': { 'Turbulent': 'Assertive', 'Assertive': 'Turbulent' },
              };
              const oppositeTrait = oppositeTraitMap[dimName]?.[trait] || '';

              return (
                <div key={dimName} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{dimName}</h3>
                    <span className="text-sm font-medium text-purple-600">
                      {percentage}% {trait}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                      className="absolute left-0 h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <span className="text-xs font-medium text-gray-700">
                        {oppositeTrait} ({oppositePercentage}%)
                      </span>
                      <span className="text-xs font-medium text-white">
                        {trait} ({percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Description with Image */}
                  {description && (
                    <div className="flex gap-4 items-start">
                      {image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={image_url} 
                            alt={image_alt || trait}
                            className="w-32 h-24 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-sm text-gray-600 flex-1">{description}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Fallback: Render using old dimensionPreferences format
            Object.entries(dimensionPreferences).map(([dimension, prefs]: [string, any]) => {
              let preference: string | undefined;
              let percentage: number = 50;

              if (prefs && typeof prefs === 'object') {
                if (prefs.preference) {
                  preference = prefs.preference;
                } else {
                  const dimKeys = dimension.split('');
                  if (dimKeys.length >= 2) preference = dimKeys[0];
                }

                if (preference) {
                  const prefValue = prefs[preference];
                  if (typeof prefValue === 'number') {
                    percentage = prefValue;
                  }
                }
              }

              return (
                <div key={dimension} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{getDimensionLabel(dimension)}</h3>
                  </div>

                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <span className="text-xs font-medium text-gray-700">
                        {dimension[0]} ({(100 - percentage).toFixed(0)}%)
                      </span>
                      <span className="text-xs font-medium text-white">
                        {dimension[1]} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Leadership Capabilities Analysis */}
      {insights.leadership_capabilities && Object.keys(insights.leadership_capabilities).length > 0 && (
        <Card className="bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            MBTI Profile and Capabilities Analysis
          </h2>
          <p className="text-gray-600 mb-6">Based on 6 key leadership skills</p>
          <div className="grid gap-4">
            {insights.leadership_capabilities.communication && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg mb-2">
                      Communication: {insights.leadership_capabilities.communication.title}
                    </h3>
                    <p className="text-blue-800 text-sm">
                      {insights.leadership_capabilities.communication.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {insights.leadership_capabilities.problemSolving && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-lg mb-2">
                      Problem-solving: {insights.leadership_capabilities.problemSolving.title}
                    </h3>
                    <p className="text-green-800 text-sm">
                      {insights.leadership_capabilities.problemSolving.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {insights.leadership_capabilities.leadershipStyle && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-900 text-lg mb-2">
                      Leadership Style: {insights.leadership_capabilities.leadershipStyle.title}
                    </h3>
                    <p className="text-purple-800 text-sm">
                      {insights.leadership_capabilities.leadershipStyle.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {insights.leadership_capabilities.teamCulture && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 text-lg mb-2">
                      Team culture: {insights.leadership_capabilities.teamCulture.title}
                    </h3>
                    <p className="text-amber-800 text-sm">
                      {insights.leadership_capabilities.teamCulture.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {insights.leadership_capabilities.change && (
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-teal-900 text-lg mb-2">
                      Change: {insights.leadership_capabilities.change.title}
                    </h3>
                    <p className="text-teal-800 text-sm">
                      {insights.leadership_capabilities.change.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {insights.leadership_capabilities.stress && (
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-rose-900 text-lg mb-2">
                      Stress: {insights.leadership_capabilities.stress.title}
                    </h3>
                    <p className="text-rose-800 text-sm">
                      {insights.leadership_capabilities.stress.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
