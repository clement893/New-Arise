'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { assessmentsApi, AssessmentResult, PillarScore } from '@/lib/api/assessments';
import { wellnessPillars } from '@/data/wellnessQuestionsReal';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';
import WellnessRadarChart from '@/components/assessments/charts/WellnessRadarChart';

function AssessmentResultsContent() {
  const t = useTranslations('dashboard.assessments.results');
  const tWellness = useTranslations('dashboard.assessments.wellness.results');
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ensure assessmentId is always a string or null, never an object
  const assessmentId = searchParams ? searchParams.get('id') : null;
  
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentId) {
      loadResults(parseInt(assessmentId));
    } else {
      setError(t('errors.noId'));
      setIsLoading(false);
    }
  }, [assessmentId]);

  const loadResults = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, verify the assessment exists and get its details
      const { getMyAssessments } = await import('@/lib/api/assessments');
      const assessments = await getMyAssessments();
      const assessment = assessments.find(a => a.id === id);
      
      if (!assessment) {
        setError(t('errors.notFound'));
        setIsLoading(false);
        return;
      }
      
      // Check if assessment is completed
      if (assessment.status !== 'completed' && assessment.status !== 'COMPLETED') {
        // Check if all questions are answered
        const hasAllAnswers = assessment.answer_count !== undefined && 
                              assessment.total_questions !== undefined &&
                              assessment.total_questions > 0 &&
                              assessment.answer_count >= assessment.total_questions;
        
        if (!hasAllAnswers) {
          // Provide more helpful error message with progress info
          const progressInfo = assessment.answer_count !== undefined && assessment.total_questions !== undefined
            ? ` (${assessment.answer_count}/${assessment.total_questions} ${t('errors.questionsAnswered')})`
            : '';
          setError(`${t('errors.notCompletedYet')}${progressInfo}`);
          setIsLoading(false);
          // Redirect to assessment page immediately (no delay)
          if (assessment.assessment_type === 'WELLNESS') {
            router.push(`/dashboard/assessments/wellness?id=${id}`);
          } else if (assessment.assessment_type === 'TKI') {
            router.push(`/dashboard/assessments/tki?id=${id}`);
          } else if (assessment.assessment_type === 'THREE_SIXTY_SELF') {
            router.push(`/dashboard/assessments/360-feedback?assessmentId=${id}`);
          } else {
            router.push(`/dashboard/assessments`);
          }
          return;
        }
        
        // If all answers are provided but status is not completed, try to submit
        // This handles cases where user answered all questions but didn't submit
        try {
          console.log(`[Results] Assessment ${id} has all answers but status is "${assessment.status}", attempting to submit...`);
          const { submitAssessment } = await import('@/lib/api/assessments');
          await submitAssessment(id);
          // Wait a moment for results to be calculated
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Reload assessment to get updated status
          const updatedAssessments = await getMyAssessments();
          const updatedAssessment = updatedAssessments.find(a => a.id === id);
          if (updatedAssessment?.status === 'COMPLETED' || updatedAssessment?.status === 'completed') {
            // Assessment is now completed, continue to load results
            console.log(`[Results] Assessment ${id} successfully submitted, loading results...`);
          } else {
            // Submission didn't complete the assessment, show error
            throw new Error(t('errors.failedToComplete'));
          }
        } catch (submitError: unknown) {
          // Convert error to string to prevent React error #130
          const errorMessage = formatError(submitError);
          console.error(`[Results] Failed to submit assessment ${id}:`, errorMessage);
          const errorDetail = errorMessage;
          
          setError(t('errors.unableToComplete', { detail: errorDetail || t('errors.ensureAllQuestions') }));
          setIsLoading(false);
          // Redirect to assessment page
          if (assessment.assessment_type === 'WELLNESS') {
            router.push(`/dashboard/assessments/wellness?id=${id}`);
          } else if (assessment.assessment_type === 'TKI') {
            router.push(`/dashboard/assessments/tki?id=${id}`);
          } else if (assessment.assessment_type === 'THREE_SIXTY_SELF') {
            router.push(`/dashboard/assessments/360-feedback?assessmentId=${id}`);
          } else {
            router.push(`/dashboard/assessments`);
          }
          return;
        }
      }
      
      // Try to load results
      const data = await assessmentsApi.getResults(id);
      setResults(data);
    } catch (err: unknown) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('[Results] Failed to load results:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arise-deep-teal mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    // Ensure error is always a string before using includes
    const errorString = typeof error === 'string' ? error : formatError(error || t('errors.noResults'));
    const isNotCompleted = errorString.includes('not completed') || errorString.includes('not found') || errorString.includes('non complétée') || errorString.includes('non trouvée');
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isNotCompleted ? t('errors.notCompleted.title') : t('errors.errorTitle')}
          </h2>
          <p className="text-gray-600 mb-6">{errorString || t('errors.noResults')}</p>
          <div className="flex flex-col gap-3">
            {isNotCompleted && assessmentId && (
              <Button 
                onClick={() => router.push(`/dashboard/assessments/wellness?id=${assessmentId}`)}
                variant="primary"
              >
                {t('errors.notCompleted.continueButton')}
              </Button>
            )}
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

  const { scores } = results;
  
  // CRITICAL: Ensure all numeric values are actually numbers, not objects
  // This prevents React error #130 (objects not valid as React child)
  const rawPercentage = scores?.percentage;
  const safePercentage = typeof rawPercentage === 'number' 
    ? rawPercentage 
    : typeof rawPercentage === 'string' 
    ? parseFloat(rawPercentage) 
    : typeof rawPercentage === 'object' && rawPercentage !== null && 'value' in rawPercentage
    ? (typeof (rawPercentage as { value: unknown }).value === 'number' ? (rawPercentage as { value: number }).value : 0)
    : 0;
  
  const rawTotalScore = scores?.total_score;
  const safeTotalScore = typeof rawTotalScore === 'number'
    ? rawTotalScore
    : typeof rawTotalScore === 'string'
    ? parseInt(rawTotalScore, 10)
    : typeof rawTotalScore === 'object' && rawTotalScore !== null && 'value' in rawTotalScore
    ? (typeof (rawTotalScore as { value: unknown }).value === 'number' ? (rawTotalScore as { value: number }).value : 0)
    : 0;
  
  const rawMaxScore = scores?.max_score;
  const safeMaxScore = typeof rawMaxScore === 'number'
    ? rawMaxScore
    : typeof rawMaxScore === 'string'
    ? parseInt(rawMaxScore, 10)
    : typeof rawMaxScore === 'object' && rawMaxScore !== null && 'value' in rawMaxScore
    ? (typeof (rawMaxScore as { value: unknown }).value === 'number' ? (rawMaxScore as { value: number }).value : 150)
    : 150;
  
  const pillar_scores = scores?.pillar_scores || {};

  // Debug: Log if we detect objects
  if (typeof scores?.percentage === 'object' || typeof scores?.total_score === 'object' || typeof scores?.max_score === 'object') {
    console.error('[Results] ⚠️ OBJECT DETECTED in scores!', {
      percentage: scores?.percentage,
      percentageType: typeof scores?.percentage,
      total_score: scores?.total_score,
      total_scoreType: typeof scores?.total_score,
      max_score: scores?.max_score,
      max_scoreType: typeof scores?.max_score,
    });
  }

  return (
    <>
      <div className="relative">
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/dashboard-bg.jpg)',
          }}
        />
        <div className="relative z-10 p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 pb-4 md:pb-6">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-3 md:mb-4 flex items-center gap-2 md:gap-4 text-sm md:text-base"
              style={{ backgroundColor: '#0F4C56', color: '#fff' }}
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              {t('backToAssessments')}
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
              {t('title')}
            </h1>
            <p className="text-sm md:text-base text-white">
              {t('subtitle')}
            </p>
          </div>

          {/* Overall Score Card */}
          <MotionDiv variant="slideUp" duration="normal">
            <Card className="mb-6 md:mb-8 bg-gradient-to-br from-arise-deep-teal to-arise-deep-teal/80 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                {/* Left side - Overall Score */}
                <div className="flex flex-col items-center justify-center text-center py-4 lg:py-0">
                  <div className="flex items-center justify-center mb-3 lg:mb-4">
                    <TrendingUp size={40} className="mr-3 lg:mr-4 lg:w-12 lg:h-12" />
                    <div className="text-5xl lg:text-7xl font-bold">{isNaN(safePercentage) ? 0 : safePercentage.toFixed(0)}%</div>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2">{t('overallScore.title')}</h2>
                  <p className="text-white/90 text-base lg:text-lg">
                    {t('overallScore.points', { score: isNaN(safeTotalScore) ? 0 : safeTotalScore, max: isNaN(safeMaxScore) ? 150 : safeMaxScore })}
                  </p>
                </div>

                {/* Right side - Wellness Radar */}
                <div className="flex flex-col items-center justify-center pb-4 lg:pb-0">
                  <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-4 text-center">ARISE Wellness Radar</h3>
                  <div className="bg-white rounded-lg p-1 lg:p-2 w-full overflow-visible">
                    <WellnessRadarChart 
                      scores={(() => {
                        // Transform pillar_scores to simple number map
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
                        // Get translated pillar names
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
          </MotionDiv>

          {/* Pillar Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {wellnessPillars.map((pillar, index) => {
              const rawPillarData = pillar_scores?.[pillar.id];
              const isPillarScoreObject = (data: number | PillarScore | undefined): data is PillarScore => {
                return typeof data === 'object' && data !== null && 'score' in data;
              };
              
              // CRITICAL: Ensure pillarScore is always a number, never an object
              let pillarScore: number = 0;
              if (isPillarScoreObject(rawPillarData)) {
                // It's a PillarScore object, extract the score
                const scoreValue = rawPillarData.score;
                pillarScore = typeof scoreValue === 'number' ? scoreValue : (typeof scoreValue === 'string' ? parseFloat(scoreValue) : 0);
              } else if (typeof rawPillarData === 'number') {
                pillarScore = rawPillarData;
              } else if (typeof rawPillarData === 'string') {
                pillarScore = parseFloat(rawPillarData) || 0;
              } else if (typeof rawPillarData === 'object' && rawPillarData !== null) {
                // Try to extract a number from the object
                console.error('[Results] ⚠️ pillarData IS AN OBJECT!', { pillarId: pillar.id, pillarData: rawPillarData });
                if ('value' in rawPillarData && typeof (rawPillarData as { value: unknown }).value === 'number') {
                  pillarScore = (rawPillarData as { value: number }).value;
                } else if ('score' in rawPillarData && typeof (rawPillarData as { score: unknown }).score === 'number') {
                  pillarScore = (rawPillarData as { score: number }).score;
                }
              }
              
              const pillarData = rawPillarData;
              
              // Ensure pillarPercentage is always a number
              let pillarPercentage: number = 0;
              if (isPillarScoreObject(pillarData)) {
                const percentageValue = pillarData.percentage;
                pillarPercentage = typeof percentageValue === 'number' ? percentageValue : (typeof percentageValue === 'string' ? parseFloat(percentageValue) : (pillarScore / 25) * 100);
              } else {
                pillarPercentage = (pillarScore / 25) * 100; // Each pillar max is 25
              }
              
              // Ensure values are valid numbers
              pillarScore = isNaN(pillarScore) ? 0 : pillarScore;
              pillarPercentage = isNaN(pillarPercentage) ? 0 : Math.max(0, Math.min(100, pillarPercentage));
              
              return (
                <MotionDiv 
                  key={pillar.id}
                  variant="slideUp"
                  duration="normal"
                  delay={index * 0.1}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start mb-3 md:mb-4">
                      <div className="text-3xl md:text-4xl mr-3 md:mr-4 flex-shrink-0">{pillar.icon}</div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 break-words overflow-wrap-anywhere">
                          {(() => {
                            // Translate pillar name - convert snake_case to camelCase
                            const pillarKey = pillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                            try {
                              const translated = tWellness(`pillars.${pillarKey}`);
                              if (translated && !translated.includes('pillars.')) {
                                return translated;
                              }
                            } catch (e) {
                              // Fallback
                            }
                            return pillar.name;
                          })()}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 break-words overflow-wrap-anywhere whitespace-pre-wrap">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-2 md:mb-3">
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-gray-600">{t('pillarScore.label')}</span>
                        <span 
                          className="relative font-bold text-arise-deep-teal cursor-help group"
                        >
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 md:px-3 py-1 md:py-2 bg-white text-black text-xs md:text-sm font-medium rounded-lg shadow-lg border border-gray-200 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            {pillar.name}
                          </span>
                          {pillarScore} / 25
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                        <div
                          className="bg-arise-gold rounded-full h-2 md:h-3 transition-all duration-500"
                          style={{ width: `${pillarPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Performance Level */}
                    <div className="text-center">
                      <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold ${
                        pillarPercentage >= 80 ? 'bg-success-100 text-success-800' :
                        pillarPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pillarPercentage >= 80 ? t('performance.excellent') :
                         pillarPercentage >= 60 ? t('performance.good') :
                         t('performance.needsAttention')}
                      </span>
                    </div>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>

          {/* Key Insights Section */}
          <MotionDiv variant="fade" duration="normal">
            <Card className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                {t('insights.title')}
              </h2>
              <div className="space-y-4">
                {/* Use backend insights if available, otherwise generate from scores */}
                {results.insights && typeof results.insights === 'object' && Object.keys(results.insights).length > 0 ? (
                  // Display backend insights
                  <div className="space-y-4">
                    {results.insights.strengths && (
                      <div className="p-4 bg-success-50 rounded-lg break-words overflow-hidden">
                        <h3 className="font-bold text-success-900 mb-2">{t('insights.strengths.title')}</h3>
                        {Array.isArray(results.insights.strengths) ? (
                          <ul className="list-disc list-inside space-y-1 text-success-800">
                            {results.insights.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="break-words">{strength}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-success-800 break-words whitespace-pre-wrap">{String(results.insights.strengths)}</p>
                        )}
                      </div>
                    )}
                    {results.insights.growth_areas && (
                      <div className="p-4 bg-yellow-50 rounded-lg break-words overflow-hidden">
                        <h3 className="font-bold text-yellow-900 mb-2">{t('insights.growth.title')}</h3>
                        {Array.isArray(results.insights.growth_areas) ? (
                          <ul className="list-disc list-inside space-y-1 text-yellow-800">
                            {results.insights.growth_areas.map((area: string, idx: number) => (
                              <li key={idx} className="break-words">{area}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-yellow-800 break-words whitespace-pre-wrap">{String(results.insights.growth_areas)}</p>
                        )}
                      </div>
                    )}
                    {results.insights.summary && (
                      <div className="p-4 bg-blue-50 rounded-lg break-words overflow-hidden">
                        <h3 className="font-bold text-blue-900 mb-2">Summary</h3>
                        <p className="text-blue-800 break-words whitespace-pre-wrap">{String(results.insights.summary)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Fallback: Generate insights from scores
                  <div className="space-y-4">
                    <div className="p-4 bg-success-50 rounded-lg break-words overflow-hidden">
                      <h3 className="font-bold text-success-900 mb-2">{t('insights.strengths.title')}</h3>
                      <p className="text-success-800 break-words whitespace-pre-wrap">
                        {t('insights.strengths.description', { 
                          pillar: (() => {
                            const getPillarScore = (data: number | PillarScore | undefined): number => {
                              if (typeof data === 'number') return data;
                              if (typeof data === 'object' && data !== null && 'score' in data) {
                                const scoreValue = data.score;
                                return typeof scoreValue === 'number' ? scoreValue : (typeof scoreValue === 'string' ? parseFloat(scoreValue) : 0);
                              }
                              return 0;
                            };
                            const strongestPillar = wellnessPillars.find(p => {
                              const data = pillar_scores?.[p.id];
                              const score = getPillarScore(data);
                              const allScores = Object.values(pillar_scores || {}).map(d => getPillarScore(d));
                              return allScores.length > 0 && !isNaN(score) && score === Math.max(...allScores.filter(s => !isNaN(s)));
                            });
                            if (strongestPillar) {
                              const pillarKey = strongestPillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                              try {
                                const translated = tWellness(`pillars.${pillarKey}`);
                                if (translated && !translated.includes('pillars.')) {
                                  return translated;
                                }
                              } catch (e) {
                                // Fallback
                              }
                              return strongestPillar.name;
                            }
                            return 'N/A';
                          })()
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg break-words overflow-hidden">
                      <h3 className="font-bold text-yellow-900 mb-2">{t('insights.growth.title')}</h3>
                      <p className="text-yellow-800 break-words whitespace-pre-wrap">
                        {t('insights.growth.description', { 
                          pillar: (() => {
                            const getPillarScore = (data: number | PillarScore | undefined): number => {
                              if (typeof data === 'number') return data;
                              if (typeof data === 'object' && data !== null && 'score' in data) {
                                const scoreValue = data.score;
                                return typeof scoreValue === 'number' ? scoreValue : (typeof scoreValue === 'string' ? parseFloat(scoreValue) : 0);
                              }
                              return 0;
                            };
                            const weakestPillar = wellnessPillars.find(p => {
                              const data = pillar_scores?.[p.id];
                              const score = getPillarScore(data);
                              const allScores = Object.values(pillar_scores || {}).map(d => getPillarScore(d));
                              return allScores.length > 0 && !isNaN(score) && score === Math.min(...allScores.filter(s => !isNaN(s)));
                            });
                            if (weakestPillar) {
                              const pillarKey = weakestPillar.id.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                              try {
                                const translated = tWellness(`pillars.${pillarKey}`);
                                if (translated && !translated.includes('pillars.')) {
                                  return translated;
                                }
                              } catch (e) {
                                // Fallback
                              }
                              return weakestPillar.name;
                            }
                            return 'N/A';
                          })()
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </>
  );
}

export default function AssessmentResultsPage() {
  return (
    <ErrorBoundary showDetails={false}>
      <AssessmentResultsContent />
    </ErrorBoundary>
  );
}
