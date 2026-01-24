'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { AssessmentResult } from '@/lib/api/assessments';
import { mbtiTypes } from '@/data/mbtiQuestions';
import { mbtiPersonalities } from '@/data/mbtiPersonalities';
import { Brain } from 'lucide-react';

interface MBTIResultContentProps {
  results: AssessmentResult;
}

export default function MBTIResultContent({ results }: MBTIResultContentProps) {
  const t = useTranslations('dashboard.assessments.mbti.results');

  const mbtiType = results.scores?.mbti_type || 'XXXX';
  const insights = results.insights || {};
  const isFromOCR = results.scores?.source === 'pdf_ocr';
  
  // Extract base type without variant (e.g., "ISFP-T" -> "ISFP")
  const baseType = mbtiType.substring(0, 4).toUpperCase() || 'XXXX';
  
  // Get personality data from new comprehensive data structure
  const personalityData = mbtiPersonalities[baseType];
  
  // Fallback to old typeInfo if personality data not found
  const typeInfo = mbtiTypes[baseType] || {
    name: 'Unknown Type',
    description: 'Type description not available.',
    strengths: [],
  };

  // Use personality description from new data structure, or fallback
  const personalityDescription = personalityData?.descriptionOverall || 
                                  (results.scores as any)?.personality_description || 
                                  insights.description || 
                                  typeInfo.description;

  return (
    <div className="space-y-6">
      {/* Personality Type Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-white text-2xl">
                {baseType}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {personalityData?.name || typeInfo.name}
            </h2>
            <p className="text-lg text-gray-700 mb-4">{personalityDescription}</p>
            {isFromOCR && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
                <Brain size={14} />
                {t('ocrBadge')}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {personalityData?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Brain className="w-16 h-16 text-purple-600 flex-shrink-0" />
        </div>
      </Card>

      {/* Your Personality Dimensions */}
      {personalityData && (
        <Card className="bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Personality Dimensions
          </h2>
          <div className="grid gap-4">
            {/* 1. Communication */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-2">
                    {personalityData.capabilities.communication.name}
                  </h3>
                  <p className="text-blue-800 text-sm">
                    {personalityData.capabilities.communication.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Problem-Solving & Conflict Resolution */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 text-lg mb-2">
                    {personalityData.capabilities.problemSolving.name}
                  </h3>
                  <p className="text-purple-800 text-sm">
                    {personalityData.capabilities.problemSolving.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Leadership Style */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-2">
                    {personalityData.capabilities.leadershipStyle.name}
                  </h3>
                  <p className="text-blue-800 text-sm">
                    {personalityData.capabilities.leadershipStyle.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Team-Culture */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 text-lg mb-2">
                    {personalityData.capabilities.teamCulture.name}
                  </h3>
                  <p className="text-purple-800 text-sm">
                    {personalityData.capabilities.teamCulture.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Change */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-2">
                    {personalityData.capabilities.change.name}
                  </h3>
                  <p className="text-blue-800 text-sm">
                    {personalityData.capabilities.change.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Stress */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 text-lg mb-2">
                    {personalityData.capabilities.stress.name}
                  </h3>
                  <p className="text-purple-800 text-sm">
                    {personalityData.capabilities.stress.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
