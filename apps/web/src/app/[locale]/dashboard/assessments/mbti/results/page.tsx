'use client';

/**
 * MBTI Assessment Results Page
 * Displays personality type, dimension breakdowns, and insights
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult } from '@/lib/api/assessments';
import { mbtiTypes } from '@/data/mbtiQuestions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Brain } from 'lucide-react';

export default function MBTIResultsPage() {
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

  const getDimensionLabel = (dimension: string): string => {
    const labels: Record<string, string> = {
      'EI': 'Energy Source',
      'SN': 'Information Gathering',
      'TF': 'Decision Making',
      'JP': 'Lifestyle',
    };
    return labels[dimension] || dimension;
  };

  const getPreferenceLabel = (preference: string): string => {
    const labels: Record<string, string> = {
      'E': 'Extraversion',
      'I': 'Introversion',
      'S': 'Sensing',
      'N': 'Intuition',
      'T': 'Thinking',
      'F': 'Feeling',
      'J': 'Judging',
      'P': 'Perceiving',
    };
    return labels[preference] || preference;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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

  const mbtiType = results.scores.mbti_type || 'XXXX';
  const dimensionPreferences = results.scores.dimension_preferences || {};
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];
  const typeInfo = mbtiTypes[mbtiType] || {
    name: 'Unknown Type',
    description: 'Type description not available.',
    strengths: [],
  };

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
                  Your MBTI Personality Type
                </h1>
                <p className="text-gray-600">
                  Understanding your unique personality profile
                </p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </MotionDiv>

          {/* Personality Type Card */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {mbtiType}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {typeInfo.name}
                    </h2>
                    <p className="text-lg text-gray-700 mb-4">
                      {typeInfo.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {typeInfo.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Brain className="w-16 h-16 text-purple-600 flex-shrink-0" />
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Dimension Breakdown */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Personality Dimensions
            </h2>
            <div className="grid gap-4">
              {Object.entries(dimensionPreferences).map(([dimension, prefs]: [string, any], index) => {
                const preference = prefs.preference;
                const percentage = prefs[preference];
                const oppositePreference = dimension.replace(preference, '').trim();
                const oppositePercentage = prefs[oppositePreference] || (100 - percentage);

                return (
                  <MotionDiv
                    key={dimension}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            {getDimensionLabel(dimension)}
                          </h3>
                          <span className="text-sm font-medium text-purple-600">
                            {getPreferenceLabel(preference)}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <div
                            className="absolute left-0 h-full bg-purple-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-4">
                            <span className="text-xs font-medium text-gray-700">
                              {dimension[0]} ({oppositePercentage.toFixed(0)}%)
                            </span>
                            <span className="text-xs font-medium text-white">
                              {dimension[1]} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {insights.dimensions && insights.dimensions[dimension] && (
                          <p className="text-sm text-gray-600">
                            {insights.dimensions[dimension].description}
                          </p>
                        )}
                      </div>
                    </Card>
                  </MotionDiv>
                );
              })}
            </div>
          </MotionDiv>

          {/* Strengths & Challenges */}
          {(insights.strengths || insights.challenges) && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Strengths & Growth Areas
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                {insights.strengths && (
                  <Card className="bg-green-50 border-green-200">
                    <div className="p-6">
                      <h3 className="font-semibold text-green-900 mb-3">
                        💪 Your Strengths
                      </h3>
                      <ul className="space-y-2">
                        {insights.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )}

                {/* Challenges */}
                {insights.challenges && (
                  <Card className="bg-amber-50 border-amber-200">
                    <div className="p-6">
                      <h3 className="font-semibold text-amber-900 mb-3">
                        🎯 Growth Areas
                      </h3>
                      <ul className="space-y-2">
                        {insights.challenges.map((challenge: string, index: number) => (
                          <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )}
              </div>
            </MotionDiv>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Personalized Development Recommendations
              </h2>
              <div className="grid gap-4">
                {recommendations.map((rec: any, index: number) => (
                  <MotionDiv
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
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
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <Card className="bg-gray-50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Continue Your Leadership Journey
                </h3>
                <p className="text-gray-600 mb-4">
                  Explore other assessments to gain deeper insights
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push('/dashboard/assessments/tki')}>
                    Take TKI Assessment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/assessments/wellness')}
                  >
                    Try Wellness Assessment
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
