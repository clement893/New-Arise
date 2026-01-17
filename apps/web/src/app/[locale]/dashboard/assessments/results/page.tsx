'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { assessmentsApi, AssessmentResult, PillarScore, getAssessmentAnswers } from '@/lib/api/assessments';
import { wellnessPillars, wellnessQuestions, wellnessScale } from '@/data/wellnessQuestionsReal';
import { ArrowLeft, Download, TrendingUp, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatError } from '@/lib/utils/formatError';
import { useToast } from '@/components/ui';

function AssessmentResultsContent() {
  const t = useTranslations('dashboard.assessments.results');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ensure assessmentId is always a string or null, never an object
  const assessmentId = searchParams ? searchParams.get('id') : null;
  
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useToast();

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

  const handleDownloadPDF = async () => {
    if (!results || !assessmentId) return;

    try {
      setIsDownloading(true);
      
      // Fetch assessment answers for detailed breakdown
      const answers = await getAssessmentAnswers(parseInt(assessmentId));
      
      const { scores } = results;
      
      // CRITICAL: Ensure all numeric values are actually numbers for PDF export
      const safeTotalScore = typeof scores?.total_score === 'number' ? scores.total_score : (typeof scores?.total_score === 'string' ? parseInt(scores.total_score, 10) : 0);
      const safeMaxScore = typeof scores?.max_score === 'number' ? scores.max_score : (typeof scores?.max_score === 'string' ? parseInt(scores.max_score, 10) : 150);
      const safePercentage = typeof scores?.percentage === 'number' ? scores.percentage : (typeof scores?.percentage === 'string' ? parseFloat(scores.percentage) : 0);
      const pillar_scores = scores?.pillar_scores || {};

      // Prepare summary data - pillars with scores
      const summaryRows: Array<Record<string, string>> = [];

      // Add pillar scores (these will be in the Question column)
      if (pillar_scores) {
        Object.entries(pillar_scores).forEach(([pillarId, pillarData]) => {
          const pillar = wellnessPillars.find(p => p.id === pillarId);
          const isPillarScoreObject = (data: number | PillarScore | undefined): data is PillarScore => {
            return typeof data === 'object' && data !== null && 'score' in data;
          };
          const pillarScore = isPillarScoreObject(pillarData) ? pillarData.score : (typeof pillarData === 'number' ? pillarData : 0);
          const pillarPercentage = isPillarScoreObject(pillarData) ? pillarData.percentage : (pillarScore / 25) * 100;
          
          summaryRows.push({
            [t('pdf.columns.question')]: pillar?.name || pillarId,
            [t('pdf.columns.answer')]: '',
            [t('pdf.columns.score')]: `${pillarScore} / 25 (${pillarPercentage.toFixed(1)}%)`,
          });
        });
      }

      // Prepare detailed question-by-question data grouped by pillar
      const questionsByPillar: Record<string, typeof wellnessQuestions> = {};
      wellnessQuestions.forEach(q => {
        if (!questionsByPillar[q.pillar]) {
          questionsByPillar[q.pillar] = [];
        }
        const pillarQuestions = questionsByPillar[q.pillar];
        if (pillarQuestions) {
          pillarQuestions.push(q);
        }
      });

      // Create detailed data rows with questions and answers
      const detailedRows: Array<Record<string, string>> = [];

      // Add questions grouped by pillar
      Object.entries(questionsByPillar).forEach(([, pillarQuestions]) => {
        // Add questions for this pillar
        pillarQuestions.forEach((question) => {
          const answerValue = answers[question.id] || '0';
          const answerNum = parseInt(answerValue, 10) || 0;
          const answerLabel = wellnessScale.find(s => s.value === answerNum)?.label || t('pdf.notAnswered');
          
          // Truncate long questions to fit in PDF (max 80 characters)
          const truncatedQuestion = question.question.length > 80 
            ? question.question.substring(0, 77) + '...'
            : question.question;
          
          detailedRows.push({
            [t('pdf.columns.question')]: truncatedQuestion,
            [t('pdf.columns.answer')]: answerLabel,
            [t('pdf.columns.score')]: `${answerNum}/5`,
          });
        });
      });

      // Combine summary (pillars) and detailed (questions) data
      const exportData = [
        ...summaryRows,
        ...detailedRows,
      ];

      // Prepare title with overall score
      const overallScoreText = `${isNaN(safeTotalScore) ? 0 : safeTotalScore} / ${isNaN(safeMaxScore) ? 150 : safeMaxScore} (${isNaN(safePercentage) ? 0 : safePercentage.toFixed(1)}%)`;
      const reportTitle = `${t('report.title')} - ${new Date().toLocaleDateString(locale)}\n${t('report.overallScore')}: ${overallScoreText}`;

      // Call the export API with simplified headers
      const response = await apiClient.post(
        '/v1/exports/export',
        {
          format: 'pdf',
          data: exportData,
          headers: [t('pdf.columns.question'), t('pdf.columns.answer'), t('pdf.columns.score')],
          title: reportTitle,
        },
        {
          responseType: 'blob',
        }
      );

      // Handle blob response
      let blob: Blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        blob = new Blob([response.data], { type: 'application/pdf' });
      } else {
        // Convert to blob if it's a string or other format
        blob = new Blob([response.data], { type: 'application/pdf' });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wellness-assessment-report-${assessmentId || 'results'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast({
        message: t('toast.downloadSuccess'),
        type: 'success',
      });
    } catch (err: unknown) {
      // Convert error to string to prevent React error #130
      const errorMessage = formatError(err);
      console.error('Error downloading PDF:', errorMessage);
      showToast({
        message: t('toast.downloadFailed'),
        type: 'error',
      });
    } finally {
      setIsDownloading(false);
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
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="mb-8 pb-6">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-4 flex items-center gap-4"
              style={{ backgroundColor: '#0F4C56', color: '#fff' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToAssessments')}
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-white">
              {t('subtitle')}
            </p>
          </div>

          {/* Overall Score Card */}
          <MotionDiv variant="slideUp" duration="normal">
            <Card className="mb-8 bg-gradient-to-br from-arise-deep-teal to-arise-deep-teal/80 text-white">
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp size={48} className="mr-4" />
                  <div className="text-7xl font-bold">{isNaN(safePercentage) ? 0 : safePercentage.toFixed(0)}%</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('overallScore.title')}</h2>
                <p className="text-white/90 text-lg">
                  {t('overallScore.points', { score: isNaN(safeTotalScore) ? 0 : safeTotalScore, max: isNaN(safeMaxScore) ? 150 : safeMaxScore })}
                </p>
                <div className="mt-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    className="bg-white text-arise-deep-teal hover:bg-gray-100"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {t('downloadReport')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Pillar Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                    <div className="flex items-start mb-4">
                      <div className="text-4xl mr-4 flex-shrink-0">{pillar.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 break-words">
                          {(() => {
                            // Translate pillar name
                            const pillarKey = pillar.id.replace(/_/g, '');
                            try {
                              const translated = t(`dashboard.assessments.wellness.results.pillars.${pillarKey}`);
                              if (translated && translated !== `dashboard.assessments.wellness.results.pillars.${pillarKey}`) {
                                return translated;
                              }
                            } catch (e) {
                              // Fallback
                            }
                            return pillar.name;
                          })()}
                        </h3>
                        <p className="text-sm text-gray-600 break-words">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('pillarScore.label')}</span>
                        <span className="font-bold text-arise-deep-teal">
                          {pillarScore} / 25
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-arise-gold rounded-full h-3 transition-all duration-500"
                          style={{ width: `${pillarPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Performance Level */}
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
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
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('insights.title')}
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-success-50 rounded-lg break-words">
                  <h3 className="font-bold text-success-900 mb-2">{t('insights.strengths.title')}</h3>
                  <p className="text-success-800 break-words">
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
                          // Translate pillar name
                          const pillarKey = strongestPillar.id.replace(/_/g, '');
                          try {
                            const translated = t(`dashboard.assessments.wellness.results.pillars.${pillarKey}`);
                            if (translated && translated !== `dashboard.assessments.wellness.results.pillars.${pillarKey}`) {
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
                <div className="p-4 bg-yellow-50 rounded-lg break-words">
                  <h3 className="font-bold text-yellow-900 mb-2">{t('insights.growth.title')}</h3>
                  <p className="text-yellow-800 break-words">
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
                          // Translate pillar name
                          const pillarKey = weakestPillar.id.replace(/_/g, '');
                          try {
                            const translated = t(`dashboard.assessments.wellness.results.pillars.${pillarKey}`);
                            if (translated && translated !== `dashboard.assessments.wellness.results.pillars.${pillarKey}`) {
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
            </Card>
          </MotionDiv>

          {/* Next Steps */}
          <MotionDiv variant="fade" duration="normal">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 break-words">
                {t('nextSteps.title')}
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start break-words">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700 break-words">
                    {t('nextSteps.step1')}
                  </p>
                </li>
                <li className="flex items-start break-words">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700 break-words">
                    {t('nextSteps.step2')}
                  </p>
                </li>
                <li className="flex items-start break-words">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700 break-words">
                    {t('nextSteps.step3')}
                  </p>
                </li>
                {t('nextSteps.step4') && (
                  <li className="flex items-start break-words">
                    <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <p className="text-gray-700 break-words">
                      {t('nextSteps.step4')}
                    </p>
                  </li>
                )}
              </ul>
              <div className="mt-6 flex gap-4 flex-wrap">
                <Button 
                  variant="primary"
                  onClick={() => router.push('/dashboard/assessments')}
                >
                  {t('nextSteps.continueButton')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  {t('nextSteps.backToDashboard')}
                </Button>
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
