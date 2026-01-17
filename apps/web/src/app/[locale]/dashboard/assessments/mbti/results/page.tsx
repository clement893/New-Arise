'use client';

/**
 * MBTI Assessment Results Page
 * Displays personality type, dimension breakdowns, and insights
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult } from '@/lib/api/assessments';
import { mbtiTypes } from '@/data/mbtiQuestions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Brain, FileText, Upload } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';

export default function MBTIResultsPage() {
  const t = useTranslations('dashboard.assessments.mbti.results');
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (assessmentId) {
      loadResults();
    } else {
      // No assessment ID provided, redirect to upload page
      router.push('/dashboard/assessments/mbti/upload');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAssessmentResults(Number(assessmentId));
      setResults(data);
      retryCountRef.current = 0; // Reset retry count on success
      setIsLoading(false);
    } catch (err: any) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      
      // Check if it's a "not found" error (results don't exist)
      const isNotFound = err?.response?.status === 404 || 
          (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('not found')) ||
          (err?.message && err.message.toLowerCase().includes('not found'));
      
      if (isNotFound) {
        // Results don't exist yet - retry up to 3 times with increasing delays
        if (retryCountRef.current < 3) {
          const delay = (retryCountRef.current + 1) * 2000; // 2s, 4s, 6s
          console.log(`Results not found, retrying in ${delay}ms (attempt ${retryCountRef.current + 1}/3)`);
          retryCountRef.current += 1;
          setTimeout(() => {
            loadResults();
          }, delay);
          // Keep loading state while retrying
          return;
        }
        // After all retries, set error message
        setError('MBTI_RESULTS_NOT_FOUND');
        setIsLoading(false);
      } else {
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  };

  const getDimensionLabel = (dimension: string): string => {
    const labels: Record<string, string> = {
      EI: t('dimensions.energySource'),
      SN: t('dimensions.informationGathering'),
      TF: t('dimensions.decisionMaking'),
      JP: t('dimensions.lifestyle'),
    };
    return labels[dimension] || dimension;
  };

  const getPreferenceLabel = (preference: string): string => {
    const labels: Record<string, string> = {
      E: t('preferences.extraversion'),
      I: t('preferences.introversion'),
      S: t('preferences.sensing'),
      N: t('preferences.intuition'),
      T: t('preferences.thinking'),
      F: t('preferences.feeling'),
      J: t('preferences.judging'),
      P: t('preferences.perceiving'),
    };
    return labels[preference] || preference;
  };

  const translateStrengthOrChallenge = (text: string): string => {
    // Try to get translation from the translations object
    // next-intl returns the key if translation doesn't exist, so we check if result equals the key
    const strengthKey = `strengths.translations.${text}`;
    try {
      const strengthTranslation = t(strengthKey);
      // If translation exists and is different from the key path, use it
      if (strengthTranslation && strengthTranslation !== strengthKey) {
        return strengthTranslation;
      }
    } catch (e) {
      // Key doesn't exist, try challenges
    }
    
    // Try challenges translations
    const challengeKey = `strengths.challenges.${text}`;
    try {
      const challengeTranslation = t(challengeKey);
      if (challengeTranslation && challengeTranslation !== challengeKey) {
        return challengeTranslation;
      }
    } catch (e) {
      // Key doesn't exist
    }
    
    // Return original text if no translation found
    return text;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    // Check if it's a "results not found" error
    const isNotFound = error === 'MBTI_RESULTS_NOT_FOUND' || 
      (typeof error === 'string' && error.toLowerCase().includes('not found'));
    
    if (isNotFound || (!results && !isLoading)) {
      // Results don't exist - show upload page option
      return (
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <div className="p-6 text-center">
                <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('notFound.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('notFound.description')}
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="arise-primary"
                    onClick={() => router.push('/dashboard/assessments/mbti/upload')}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('notFound.uploadButton')}
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => router.push('/dashboard/assessments')}
                    className="w-full"
                    style={{ backgroundColor: '#0F4C56', color: '#fff' }}
                  >
                    {t('backToAssessments')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }
    
    // Other errors
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.notFound'));
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">{errorString}</p>
                <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/dashboard/assessments/mbti/upload')}>
                  {t('notFound.uploadButton')}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => router.push('/dashboard/assessments')}
                  style={{ backgroundColor: '#0F4C56', color: '#fff' }}
                >
                  {t('backToAssessments')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const mbtiType = results.scores?.mbti_type || 'XXXX';
  const dimensionPreferences = results.scores?.dimension_preferences || {};
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];
  const isFromOCR = results.scores?.source === 'pdf_ocr';
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
                <p className="text-gray-600">{t('subtitle')}</p>
                {isFromOCR && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
                    <FileText size={14} />
                    {t('ocrBadge')}
                  </div>
                )}
              </div>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const { generateAssessmentPDF, downloadBlob } = await import('@/lib/utils/pdfGenerator');
                    const pdfBlob = await generateAssessmentPDF({
                      id: Number(assessmentId),
                      name: 'MBTI Assessment Results',
                      type: 'MBTI',
                      completedDate: new Date().toLocaleDateString(),
                      score: mbtiType,
                      result: typeInfo.name,
                      detailedResult: results,
                    });
                    const timestamp = new Date().toISOString().split('T')[0];
                    downloadBlob(pdfBlob, `MBTI_Assessment_Results_${timestamp}.pdf`);
                  } catch (err) {
                    console.error('Error generating PDF:', err);
                    alert('Failed to generate PDF. Please try again.');
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('exportPdf')}
              </Button>
            </div>
          </MotionDiv>

          {/* Personality Type Card */}
          <MotionDiv variant="slideUp" duration="normal" delay={100} className="mb-8">
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{mbtiType}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{typeInfo.name}</h2>
                    <p className="text-lg text-gray-700 mb-4">{typeInfo.description}</p>
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
              </div>
            </Card>
          </MotionDiv>

          {/* Dimension Breakdown */}
          <MotionDiv variant="slideUp" duration="normal" delay={200} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dimensions.title')}</h2>
            <div className="grid gap-4">
              {Object.entries(dimensionPreferences).map(
                ([dimension, prefs]: [string, any], index) => {
                  // Handle different data structures from OCR vs manual input
                  let preference: string | undefined;
                  let percentage: number = 50; // Default to 50% if not found
                  let oppositePreference: string | undefined;
                  let oppositePercentage: number = 50; // Default to 50% if not found

                  if (prefs && typeof prefs === 'object') {
                    // Try to get preference from prefs.preference or infer from keys
                    if (prefs.preference) {
                      preference = prefs.preference;
                    } else {
                      // Try to infer from dimension (e.g., "EI" -> "E" or "I")
                      const dimKeys = dimension.split('');
                      if (dimKeys.length >= 2) {
                        preference = dimKeys[0]; // Default to first letter
                      }
                    }

                    if (preference) {
                      // Get percentage value - could be in prefs[preference] or prefs[preference].value
                      const prefValue = prefs[preference];
                      if (typeof prefValue === 'number') {
                        percentage = prefValue;
                      } else if (prefValue && typeof prefValue === 'object' && typeof prefValue.value === 'number') {
                        percentage = prefValue.value;
                      } else if (typeof prefValue === 'string' && !isNaN(Number(prefValue))) {
                        percentage = Number(prefValue);
                      }

                      // Get opposite preference
                      const dimKeys = dimension.split('');
                      oppositePreference = dimKeys.find(k => k !== preference) || dimKeys[1] || dimKeys[0];
                      
                      // Get opposite percentage
                      const oppositeValue = oppositePreference ? prefs[oppositePreference] : undefined;
                      if (typeof oppositeValue === 'number') {
                        oppositePercentage = oppositeValue;
                      } else if (oppositeValue && typeof oppositeValue === 'object' && typeof oppositeValue.value === 'number') {
                        oppositePercentage = oppositeValue.value;
                      } else if (typeof oppositeValue === 'string' && !isNaN(Number(oppositeValue))) {
                        oppositePercentage = Number(oppositeValue);
                      } else {
                        // Calculate from percentage if opposite not found
                        oppositePercentage = 100 - percentage;
                      }
                    }
                  }

                  // Ensure percentages are valid numbers
                  percentage = isNaN(percentage) || percentage < 0 || percentage > 100 ? 50 : percentage;
                  oppositePercentage = isNaN(oppositePercentage) || oppositePercentage < 0 || oppositePercentage > 100 
                    ? (100 - percentage) 
                    : oppositePercentage;

                  // Ensure they sum to 100
                  const total = percentage + oppositePercentage;
                  if (total !== 100 && total > 0) {
                    percentage = Math.round((percentage / total) * 100);
                    oppositePercentage = 100 - percentage;
                  }

                  return (
                    <MotionDiv
                      key={dimension}
                      variant="slideUp"
                      duration="fast"
                      delay={300 + index * 100}
                    >
                      <Card>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                              {getDimensionLabel(dimension)}
                            </h3>
                            {preference && (
                              <span className="text-sm font-medium text-purple-600">
                                {getPreferenceLabel(preference)}
                              </span>
                            )}
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
                }
              )}
            </div>
          </MotionDiv>

          {/* Strengths & Challenges */}
          {(insights.strengths || insights.challenges) && (
            <MotionDiv variant="slideUp" duration="normal" delay={600} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('strengths.title')}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                {insights.strengths && (
                  <Card className="bg-success-50 border-success-200">
                    <div className="p-6">
                      <h3 className="font-semibold text-success-900 mb-3">💪 {t('strengths.yourStrengths')}</h3>
                      <ul className="space-y-2">
                        {insights.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm text-success-800 flex items-start gap-2">
                            <span className="text-success-600 mt-1">•</span>
                            <span>{translateStrengthOrChallenge(strength)}</span>
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
                      <h3 className="font-semibold text-amber-900 mb-3">🎯 {t('strengths.growthAreas')}</h3>
                      <ul className="space-y-2">
                        {insights.challenges.map((challenge: string, index: number) => (
                          <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span>{translateStrengthOrChallenge(challenge)}</span>
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
            <MotionDiv variant="slideUp" duration="normal" delay={800} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('recommendations.title')}
              </h2>
              <div className="grid gap-4">
                {recommendations.map((rec: any, index: number) => (
                  <MotionDiv
                    key={index}
                    variant="slideUp"
                    duration="fast"
                    delay={900 + index * 100}
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
          <MotionDiv variant="slideUp" duration="normal" delay={1200} className="text-center">
            <Card className="bg-gray-50">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('nextSteps.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('nextSteps.description')}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push('/dashboard/assessments/tki')}>
                    {t('nextSteps.takeTKI')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/assessments/wellness')}
                  >
                    {t('nextSteps.tryWellness')}
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
