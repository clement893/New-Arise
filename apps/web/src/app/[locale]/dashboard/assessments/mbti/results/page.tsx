'use client';

/**
 * MBTI Assessment Results Page
 * Displays personality type, dimension breakdowns, and insights
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { getAssessmentResults, AssessmentResult, getMyAssessments, Assessment } from '@/lib/api/assessments';
import { mbtiTypes } from '@/data/mbtiQuestions';
import { mbtiPersonalities } from '@/data/mbtiPersonalities';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import RecommendationCard from '@/components/assessments/RecommendationCard';
import { ArrowLeft, Download, Brain, FileText, Upload, Eye } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';

export default function MBTIResultsPage() {
  const t = useTranslations('dashboard.assessments.mbti.results');
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAssessments, setUserAssessments] = useState<Assessment[]>([]);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (assessmentId) {
      loadResults();
      loadUserAssessments();
    } else {
      // No assessment ID provided, redirect to upload page
      router.push('/dashboard/assessments/mbti/upload');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const loadUserAssessments = async () => {
    try {
      const assessments = await getMyAssessments();
      console.log('[MBTI Results] Loaded user assessments:', assessments);
      setUserAssessments(assessments);
    } catch (err) {
      console.error('Failed to load user assessments:', err);
      // Don't set error state, just continue without smart suggestions
      setUserAssessments([]);
    }
  };

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
      // Support for direct dimension names from 16Personalities
      Energy: 'Energy',
      Mind: 'Mind',
      Nature: 'Nature',
      Tactics: 'Tactics',
      Identity: 'Identity',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      );
    }
    
    // Other errors
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.notFound'));
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  const mbtiType = results.scores?.mbti_type || 'XXXX';
  const dimensionPreferences = results.scores?.dimension_preferences || {};
  const insights = results.insights || {};
  const recommendations = results.recommendations || [];
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

  // Get dimension details if available (from URL import)
  const dimensionDetails = (results.scores as any)?.dimension_details || {};

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
                className="flex gap-4 items-center"
                onClick={async () => {
                  try {
                    const { generateAssessmentPDF, downloadBlob } = await import('@/lib/utils/pdfGenerator');
                    
                    // Ensure all data is properly formatted before generating PDF
                    const pdfData = {
                      id: Number(assessmentId),
                      name: 'MBTI Assessment Results',
                      type: 'MBTI',
                      completedDate: new Date().toLocaleDateString(),
                      score: mbtiType || 'XXXX',
                      result: typeInfo.name || 'Unknown Type',
                      detailedResult: {
                        ...results,
                        scores: {
                          ...results.scores,
                          mbti_type: mbtiType || 'XXXX',
                          dimension_preferences: results.scores?.dimension_preferences || {},
                        },
                        insights: results.insights || {},
                        recommendations: results.recommendations || [],
                      },
                    };
                    
                    const pdfBlob = await generateAssessmentPDF(pdfData);
                    const timestamp = new Date().toISOString().split('T')[0];
                    downloadBlob(pdfBlob, `MBTI_Assessment_Results_${timestamp}.pdf`);
                  } catch (err) {
                    console.error('Error generating PDF:', err);
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    alert(`Failed to generate PDF: ${errorMessage}. Please try again.`);
                  }
                }}
              >
                <Download className="w-4 h-4" />
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
              </div>
            </Card>
          </MotionDiv>

          {/* Dimension Breakdown */}
          <MotionDiv variant="slideUp" duration="normal" delay={200} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dimensions.title')}</h2>
            <div className="grid gap-4">
              {/* Check if we have dimension_details from URL import (preferred) */}
              {Object.keys(dimensionDetails).length > 0 ? (
                // Render using dimension_details (from 16Personalities URL import)
                ['Energy', 'Mind', 'Nature', 'Tactics', 'Identity'].map((dimName, index) => {
                  const dimInfo = dimensionDetails[dimName];
                  if (!dimInfo) return null;

                  const { trait, percentage, description, image_url, image_alt } = dimInfo;
                  
                  // Calculate opposite percentage
                  const oppositePercentage = 100 - percentage;
                  
                  // Get opposite trait name based on dimension
                  const oppositeTraitMap: Record<string, Record<string, string>> = {
                    'Energy': { 'Introverted': 'Extraverted', 'Extraverted': 'Introverted' },
                    'Mind': { 'Observant': 'Intuitive', 'Intuitive': 'Observant' },
                    'Nature': { 'Feeling': 'Thinking', 'Thinking': 'Feeling' },
                    'Tactics': { 'Prospecting': 'Judging', 'Judging': 'Prospecting' },
                    'Identity': { 'Turbulent': 'Assertive', 'Assertive': 'Turbulent' },
                  };
                  const oppositeTrait = oppositeTraitMap[dimName]?.[trait] || '';

                  return (
                    <MotionDiv
                      key={dimName}
                      variant="slideUp"
                      duration="fast"
                      delay={300 + index * 100}
                    >
                      <Card>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {dimName}
                            </h3>
                            <span className="text-sm font-medium text-purple-600">
                              {trait}
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
                                {oppositeTrait}
                              </span>
                              <span className="text-xs font-medium text-white">
                                {trait}
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
                              <p className="text-sm text-gray-600 flex-1">
                                {description}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </MotionDiv>
                  );
                })
              ) : (
                // Fallback: Render using old dimensionPreferences format
                Object.entries(dimensionPreferences).map(
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
                                  {getPreferenceLabel(dimension[0])}
                                </span>
                                <span className="text-xs font-medium text-white">
                                  {getPreferenceLabel(dimension[1])}
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
                )
              )}
            </div>
          </MotionDiv>

          {/* Your Personality Dimensions */}
          {personalityData && (
            <MotionDiv variant="slideUp" duration="normal" delay={600} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Personality Dimensions
              </h2>
              <div className="grid gap-6">
                {/* 1. Communication */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">
                          {personalityData.capabilities.communication.name}
                        </h3>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {personalityData.capabilities.communication.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 2. Problem-Solving & Conflict Resolution */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-green-900 text-lg mb-2">
                          {personalityData.capabilities.problemSolving.name}
                        </h3>
                        <p className="text-green-800 text-sm leading-relaxed">
                          {personalityData.capabilities.problemSolving.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 3. Leadership Style */}
                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900 text-lg mb-2">
                          {personalityData.capabilities.leadershipStyle.name}
                        </h3>
                        <p className="text-purple-800 text-sm leading-relaxed">
                          {personalityData.capabilities.leadershipStyle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 4. Team-Culture */}
                <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-amber-900 text-lg mb-2">
                          {personalityData.capabilities.teamCulture.name}
                        </h3>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          {personalityData.capabilities.teamCulture.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 5. Change */}
                <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-teal-900 text-lg mb-2">
                          {personalityData.capabilities.change.name}
                        </h3>
                        <p className="text-teal-800 text-sm leading-relaxed">
                          {personalityData.capabilities.change.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 6. Stress */}
                <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-rose-900 text-lg mb-2">
                          {personalityData.capabilities.stress.name}
                        </h3>
                        <p className="text-rose-800 text-sm leading-relaxed">
                          {personalityData.capabilities.stress.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
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
                <div className="flex gap-4 justify-center flex-wrap">
                  {(() => {
                    // Helper function to check if assessment is completed
                    const isAssessmentCompleted = (assessment: Assessment | undefined) => {
                      if (!assessment) return false;
                      const status = (assessment.status || '').toUpperCase();
                      // Check status or if it has results (completed_at or score_summary)
                      return status === 'COMPLETED' || !!assessment.completed_at || !!assessment.score_summary;
                    };

                    // Check if user has completed TKI assessment
                    const tkiAssessment = userAssessments.find(a => a.assessment_type === 'TKI');
                    const isTKICompleted = isAssessmentCompleted(tkiAssessment);

                    // Check if user has completed Wellness assessment
                    const wellnessAssessment = userAssessments.find(a => a.assessment_type === 'WELLNESS');
                    const isWellnessCompleted = isAssessmentCompleted(wellnessAssessment);

                    // Check if user has completed 360 Feedback
                    const feedback360Assessment = userAssessments.find(a => a.assessment_type === 'THREE_SIXTY_SELF');
                    const is360Completed = isAssessmentCompleted(feedback360Assessment);

                    // Debug logging
                    console.log('[MBTI Results] Assessment completion status:', {
                      TKI: { found: !!tkiAssessment, completed: isTKICompleted, assessment: tkiAssessment },
                      Wellness: { found: !!wellnessAssessment, completed: isWellnessCompleted, assessment: wellnessAssessment },
                      '360': { found: !!feedback360Assessment, completed: is360Completed, assessment: feedback360Assessment },
                    });

                    const buttons = [];

                    // TKI Button
                    if (isTKICompleted && tkiAssessment) {
                      buttons.push(
                        <Button 
                          key="tki"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/assessments/tki/results?id=${tkiAssessment.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Your Conflict Style Results
                        </Button>
                      );
                    } else {
                      buttons.push(
                        <Button 
                          key="tki"
                          onClick={() => router.push('/dashboard/assessments/tki')}
                        >
                          {t('nextSteps.takeTKI')}
                        </Button>
                      );
                    }

                    // Wellness Button
                    if (isWellnessCompleted && wellnessAssessment) {
                      buttons.push(
                        <Button 
                          key="wellness"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/assessments/wellness/results?id=${wellnessAssessment.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Your Wellness Results
                        </Button>
                      );
                    } else {
                      buttons.push(
                        <Button
                          key="wellness"
                          variant="outline"
                          onClick={() => router.push('/dashboard/assessments/wellness')}
                        >
                          {t('nextSteps.tryWellness')}
                        </Button>
                      );
                    }

                    // 360 Feedback Button - only if not completed
                    if (!is360Completed) {
                      buttons.push(
                        <Button
                          key="360"
                          variant="outline"
                          onClick={() => router.push('/dashboard/assessments/360-feedback')}
                        >
                          Try 360° Feedback
                        </Button>
                      );
                    } else if (feedback360Assessment) {
                      buttons.push(
                        <Button 
                          key="360"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/assessments/360-feedback/results?id=${feedback360Assessment.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Your 360° Feedback Results
                        </Button>
                      );
                    }

                    return buttons;
                  })()}
                </div>
              </div>
            </Card>
          </MotionDiv>
        </div>
    </div>
  );
}
