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
                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900 text-lg mb-2">
                          {personalityData.capabilities.problemSolving.name}
                        </h3>
                        <p className="text-purple-800 text-sm leading-relaxed">
                          {personalityData.capabilities.problemSolving.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 3. Leadership Style */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">
                          {personalityData.capabilities.leadershipStyle.name}
                        </h3>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {personalityData.capabilities.leadershipStyle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 4. Team-Culture */}
                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900 text-lg mb-2">
                          {personalityData.capabilities.teamCulture.name}
                        </h3>
                        <p className="text-purple-800 text-sm leading-relaxed">
                          {personalityData.capabilities.teamCulture.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 5. Change */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">
                          {personalityData.capabilities.change.name}
                        </h3>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {personalityData.capabilities.change.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 6. Stress */}
                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900 text-lg mb-2">
                          {personalityData.capabilities.stress.name}
                        </h3>
                        <p className="text-purple-800 text-sm leading-relaxed">
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
