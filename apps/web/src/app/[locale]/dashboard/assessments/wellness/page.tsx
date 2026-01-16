'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Card, Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { useWellnessStore } from '@/stores/wellnessStore';
import { wellnessQuestions, wellnessPillars, scaleOptions } from '@/data/wellnessQuestionsReal';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { getMyAssessments, submitAssessment as submitAssessmentApi, getAssessmentResults } from '@/lib/api/assessments';
import { determineAssessmentStatus } from '@/lib/utils/assessmentStatus';
import { formatError } from '@/lib/utils/formatError';
import { wellnessPillarIcons, DefaultIcon } from '@/lib/utils/assessmentIcons';

function WellnessAssessmentContent() {
  const router = useRouter();
  const {
    answers,
    currentQuestionIndex,
    isCompleted,
    setAnswer,
    nextQuestion,
    previousQuestion,
    completeAssessment,
    getProgress,
    startAssessment,
    loadExistingAnswers,
    isLoading,
  } = useWellnessStore();

  const [showIntro, setShowIntro] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  // Safety check: ensure wellnessQuestions is loaded and currentQuestionIndex is valid
  // Wrap in try-catch to prevent errors from breaking the component
  let currentQuestion = null;
  let progress = 0;
  let isLastQuestion = false;
  let currentAnswer: number | undefined = undefined;
  
  try {
    if (wellnessQuestions && Array.isArray(wellnessQuestions) && wellnessQuestions.length > 0) {
      if (currentQuestionIndex >= 0 && currentQuestionIndex < wellnessQuestions.length) {
        currentQuestion = wellnessQuestions[currentQuestionIndex];
      }
      const progressResult = getProgress();
      // Ensure progress is a number, not an object
      progress = typeof progressResult === 'number' && !isNaN(progressResult) ? progressResult : 0;
      isLastQuestion = currentQuestionIndex === wellnessQuestions.length - 1;
      if (currentQuestion && currentQuestion.id) {
        const answerValue = answers[currentQuestion.id];
        // Ensure currentAnswer is a number or undefined, not an object
        if (answerValue !== undefined && answerValue !== null) {
          const numValue = typeof answerValue === 'number' ? answerValue : Number(answerValue);
          currentAnswer = !isNaN(numValue) ? numValue : undefined;
        } else {
          currentAnswer = undefined;
        }
      }
    }
  } catch (error) {
    // Convert error to string to prevent React error #130
    const errorMessage = formatError(error);
    console.error('[Wellness] Error accessing question data:', errorMessage);
    // Fallback values - component will show error state
  }

  // Check for existing assessment on mount
  useEffect(() => {
    const checkExistingAssessment = async () => {
      try {
        setIsCheckingExisting(true);
        
        const assessments = await getMyAssessments();
        const wellnessAssessment = assessments.find(
          a => a.assessment_type === 'WELLNESS'
        );
        
        if (wellnessAssessment && wellnessAssessment.id) {
          // Use determineAssessmentStatus to check if assessment is truly completed
          const status = determineAssessmentStatus(wellnessAssessment, 'WELLNESS');
          
          // Reset store isCompleted state if assessment is not actually completed
          // This handles cases where store has stale completion state
          if (status !== 'completed') {
            useWellnessStore.setState({ isCompleted: false });
          }
          
          // Only redirect to results if assessment is completed AND results exist
          if (status === 'completed') {
            try {
              // Try to load results to verify they exist
              await getAssessmentResults(wellnessAssessment.id);
              // Results exist, safe to redirect
              useWellnessStore.setState({
                assessmentId: wellnessAssessment.id,
                isCompleted: true,
                currentStep: 'congratulations',
              });
              router.push(`/dashboard/assessments/results?id=${wellnessAssessment.id}`);
              return;
            } catch (err: any) {
              // Results don't exist yet, check if we need to submit
              if (err?.response?.status === 404) {
                // Assessment is completed but results don't exist
                // Check if we need to submit it
                const hasAllAnswers = wellnessAssessment.answer_count !== undefined && 
                                     wellnessAssessment.total_questions !== undefined &&
                                     wellnessAssessment.total_questions > 0 &&
                                     wellnessAssessment.answer_count >= wellnessAssessment.total_questions;
                
                if (hasAllAnswers && wellnessAssessment.status !== 'COMPLETED') {
                  // Try to submit the assessment
                  try {
                    await submitAssessmentApi(wellnessAssessment.id);
                    // Wait a bit for results to be calculated, then redirect
                    setTimeout(() => {
                      router.push(`/dashboard/assessments/results?id=${wellnessAssessment.id}`);
                    }, 1000);
                    return;
                  } catch (submitErr: any) {
                    // If already completed, try to redirect anyway
                    if (submitErr?.response?.status === 400 && submitErr?.response?.data?.detail?.includes('already been completed')) {
                      setTimeout(() => {
                        router.push(`/dashboard/assessments/results?id=${wellnessAssessment.id}`);
                      }, 1000);
                      return;
                    }
                    const submitErrMessage = formatError(submitErr);
                    console.error('Failed to submit assessment:', submitErrMessage);
                  }
                }
                // Results don't exist and can't submit, continue with assessment
              } else {
                const checkErrMessage = formatError(err);
                console.error('Failed to check results:', checkErrMessage);
              }
            }
          }
          
          // Only load existing answers if assessment is NOT completed
          // This prevents errors when coming back from results page
          if (status !== 'completed') {
            // Reset isCompleted to false if assessment is not actually completed
            // This handles stale state from previous sessions
            useWellnessStore.setState({ isCompleted: false });
            
            // Load existing answers and navigate to last unanswered question
            const { assessmentId: currentAssessmentId, currentStep: currentStepState } = useWellnessStore.getState();
            
            console.log(`[Wellness] Found existing assessment ${wellnessAssessment.id}, currentAssessmentId: ${currentAssessmentId}, currentStep: ${currentStepState}`);
            
            // Always load existing answers to ensure we're at the correct question
            // This will merge local and backend answers and set currentQuestionIndex correctly
            try {
              await loadExistingAnswers(wellnessAssessment.id);
              
              // After loading, check if we should show intro or questions
              const { currentStep: updatedStep } = useWellnessStore.getState();
              if (updatedStep === 'questions') {
                // We have an in-progress assessment, skip intro and show questions
                setShowIntro(false);
              }
            } catch (loadErr) {
              const loadErrMessage = formatError(loadErr);
              console.error('[Wellness] Failed to load existing answers:', loadErrMessage);
              // If loading fails, show intro as fallback
              setShowIntro(true);
            }
          } else {
            // Assessment is completed, show intro (user can view results from here)
            // Make sure isCompleted is set correctly
            useWellnessStore.setState({ isCompleted: true });
            setShowIntro(true);
          }
        } else {
          // No existing assessment, reset any stale completion state and show intro
          useWellnessStore.setState({ isCompleted: false });
          setShowIntro(true);
        }
      } catch (err) {
        const checkErrMessage = formatError(err);
        console.error('Failed to check existing assessments:', checkErrMessage);
        // On error, show intro as safe fallback
        setShowIntro(true);
      } finally {
        setIsCheckingExisting(false);
      }
    };

    checkExistingAssessment();
  }, [router]); // Removed loadExistingAnswers from dependencies to prevent re-runs

  useEffect(() => {
    // Don't check isCompleted until we've finished checking for existing assessments
    // This prevents showing completion screen prematurely when store has stale state
    if (isCheckingExisting) {
      return;
    }

    if (isCompleted) {
      // Get assessmentId from store and verify results exist before redirecting
      const { assessmentId } = useWellnessStore.getState();
      if (assessmentId) {
        // Verify results exist before redirecting
        getAssessmentResults(assessmentId)
          .then(() => {
            // Results exist, safe to redirect
            router.push(`/dashboard/assessments/results?id=${assessmentId}`);
          })
          .catch((err: unknown) => {
            // Results don't exist yet (404 or other error), show completion screen instead
            // Don't log the full error object to prevent React error #130
            const errorMessage = err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { status?: number } }).response?.status === 404
                ? 'Results not yet available (404)'
                : 'Results not yet available'
              : err instanceof Error ? err.message : 'Results not yet available';
            console.log('Results not yet available, showing completion screen:', errorMessage);
            setShowCompletion(true);
          });
      } else {
        // No assessmentId but isCompleted is true - this is stale state, reset it
        console.warn('[Wellness] isCompleted is true but no assessmentId - resetting stale state');
        useWellnessStore.setState({ isCompleted: false });
        setShowIntro(true);
      }
    }
  }, [isCompleted, isCheckingExisting, router]);
  
  // Reset completion state when component unmounts or route changes
  // This prevents issues when navigating back from results page
  useEffect(() => {
    return () => {
      // Don't reset on unmount - let the store persist
      // Only reset if explicitly navigating away
    };
  }, []);

  const handleAnswerSelect = async (value: number) => {
    try {
      if (!currentQuestion || !currentQuestion.id) {
        console.error('[Wellness] Cannot save answer: currentQuestion is invalid', 
          currentQuestion ? `currentQuestion.id: ${currentQuestion.id}` : 'currentQuestion is null'
        );
        alert('Error: Invalid question. Please refresh the page.');
        return;
      }
      const { assessmentId } = useWellnessStore.getState();
      if (!assessmentId) {
        console.error('[Wellness] Cannot save answer: assessmentId is null');
        alert('Error: The assessment has not been started. Please start again.');
        return;
      }
      await setAnswer(currentQuestion.id, value);
    } catch (error) {
      const errorMessage = formatError(error);
      console.error('[Wellness] Error in handleAnswerSelect:', errorMessage);
      alert('Error saving the answer. Please try again.');
    }
  };

  const handleNext = async () => {
    try {
      if (isLastQuestion) {
        await completeAssessment();
        // Completion will trigger automatic redirect via useEffect
      } else {
        nextQuestion();
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error('[Wellness] Error in handleNext:', errorMessage);
      alert('Error navigating. Please try again.');
    }
  };

  const handleBack = () => {
    try {
      if (currentQuestionIndex === 0) {
        setShowIntro(true);
      } else {
        previousQuestion();
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error('[Wellness] Error in handleBack:', errorMessage);
      // Fallback: just show intro
      setShowIntro(true);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard/assessments');
  };

  // Show loading while checking for existing assessment
  if (isCheckingExisting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <MotionDiv variant="fade" duration="normal">
          <Card className="max-w-md text-center">
            <p className="text-gray-600">Checking for existing assessment...</p>
          </Card>
        </MotionDiv>
      </div>
    );
  }

  // Introduction Screen
  if (showIntro) {
    return (
      <div className="relative">
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/dashboard-bg.jpg)',
          }}
        />
        <div className="relative z-10 p-8 flex items-center justify-center min-h-screen">
            <MotionDiv variant="fade" duration="normal">
              <Card className="max-w-3xl">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-arise-deep-teal mb-4">
                    Wellness Assessment
                  </h1>
                  <p className="text-gray-600 text-lg">
                    This assessment will help you understand your overall well-being across six key pillars
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {wellnessPillars.map((category) => (
                    <div 
                      key={category.id}
                      className="bg-arise-deep-teal/5 rounded-lg p-6 text-center hover:bg-arise-deep-teal/10 transition-colors"
                    >
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={async () => {
                      try {
                        // Reset any stale completion state before starting
                        useWellnessStore.setState({ isCompleted: false });
                        setShowCompletion(false);
                        await startAssessment();
                        // Verify assessmentId was set
                        const { assessmentId: newAssessmentId, isCompleted: newIsCompleted } = useWellnessStore.getState();
                        if (!newAssessmentId) {
                          console.error('[Wellness] startAssessment did not set assessmentId');
                          alert('Error: Unable to start the assessment. Please try again.');
                          return;
                        }
                        // Double-check that isCompleted is false after starting
                        if (newIsCompleted) {
                          console.warn('[Wellness] isCompleted is true after startAssessment - resetting');
                          useWellnessStore.setState({ isCompleted: false });
                        }
                        console.log(`[Wellness] Assessment started with ID: ${newAssessmentId}`);
                        setShowCompletion(false);
                        setShowIntro(false);
                      } catch (error) {
                        const errorMessage = formatError(error);
                        console.error('[Wellness] Failed to start assessment:', errorMessage);
                        alert('Error: Unable to start the assessment. Please try again.');
                      }
                    }}
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading ? 'Starting...' : 'Start Assessment'}
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          </div>
        </div>
    );
  }

  // Completion Screen
  if (showCompletion) {
    return (
      <div className="relative">
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/dashboard-bg.jpg)',
          }}
        />
        <div className="relative z-10 p-8 flex items-center justify-center min-h-screen">
            <MotionDiv variant="fade" duration="normal">
              <Card className="max-w-2xl text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <div className="mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#0F4C56' }}>
                    <CheckCircle className="text-white" size={48} />
                  </div>
                  <h1 className="text-4xl font-bold mb-4" style={{ color: '#0F4C56' }}>
                    Congratulations!
                  </h1>
                  <p className="text-gray-600 text-lg mb-2">
                    You've completed the Wellness Assessment
                  </p>
                  <p className="text-gray-500">
                    Your results are being processed and will be available in your dashboard shortly.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      const { assessmentId } = useWellnessStore.getState();
                      if (assessmentId) {
                        router.push(`/dashboard/assessments/results?id=${assessmentId}`);
                      }
                    }}
                    className="text-white"
                    style={{ backgroundColor: '#0F4C56' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0F4C56'}
                  >
                    View Results
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleFinish}
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    View All Assessments
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          </div>
        </div>
    );
  }

  // Question Screen
  // Safety check: ensure we have valid question data before rendering
  // Also check if assessment is completed - if so, don't show questions
  // Use the hook value instead of getState() to avoid stale closures
  if (isCompleted) {
    // Assessment is completed, redirect to results or show completion screen
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">This assessment has been completed.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => {
              const { assessmentId } = useWellnessStore.getState();
              if (assessmentId) {
                router.push(`/dashboard/assessments/results?id=${assessmentId}`);
              } else {
                router.push('/dashboard/assessments');
              }
            }}>View Results</Button>
            <Button 
              variant="primary" 
              onClick={() => router.push('/dashboard/assessments')} 
              className="flex items-center gap-4"
              style={{ backgroundColor: '#0F4C56', color: '#fff' }}
            >
              Back to Assessments
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!currentQuestion || !wellnessQuestions || wellnessQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6">
          <p className="text-gray-600 mb-4">Unable to load question data.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </Card>
      </div>
    );
  }
  
  // Safety check: ensure currentQuestionIndex is valid
  if (currentQuestionIndex < 0 || currentQuestionIndex >= wellnessQuestions.length) {
    // Convert to string to prevent React error #130
    const errorDetails = `currentQuestionIndex: ${currentQuestionIndex}, questionsLength: ${wellnessQuestions.length}`;
    console.error('[Wellness] Invalid currentQuestionIndex:', errorDetails);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6">
          <p className="text-gray-600 mb-4">Invalid question index. Resetting...</p>
          <Button onClick={() => {
            useWellnessStore.setState({ currentQuestionIndex: 0 });
            window.location.reload();
          }}>Reset Assessment</Button>
        </Card>
      </div>
    );
  }

  // Get current pillar info and icon
  const currentPillar = currentQuestion?.pillar 
    ? wellnessPillars.find(p => p.name === currentQuestion.pillar)
    : null;
  const PillarIcon = currentPillar 
    ? (wellnessPillarIcons[currentPillar.name] || DefaultIcon)
    : DefaultIcon;
  const answeredCount = Object.keys(answers).length;

  // Map scale labels to short format
  const scaleLabelMap: Record<number, string> = {
    1: 'Not at all',
    2: 'Rarely',
    3: 'Sometimes',
    4: 'Often',
    5: 'Always',
  };

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      <div className="relative z-10 p-8">
        {/* Question Card - Centered */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-4xl w-full">
            <MotionDiv variant="slideUp" duration="fast" key={currentQuestionIndex}>
              <Card className="p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <PillarIcon className="w-6 h-6" style={{ color: '#0F4C56' }} />
                    <span className="font-semibold text-gray-900">
                      {currentPillar?.name || 'Wellness Assessment'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Question {currentQuestionIndex + 1} / {wellnessQuestions.length}
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${typeof progress === 'number' ? progress : 0}%`, backgroundColor: '#0F4C56' }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {typeof progress === 'number' ? Math.round(progress) : 0}% completed
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)', color: '#0F4C56' }}>
                    {currentPillar?.name || 'Question'}
                  </div>
                </div>

                {/* Question Area */}
                <div className="mb-8 text-center">
                  <div className="mb-6">
                    <PillarIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#0F4C56' }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F4C56' }}>
                    {currentQuestion?.question || 'Question not available'}
                  </h2>
                </div>

                {/* Scale Options - Horizontal */}
                <div className="flex gap-3 mb-8">
                  {scaleOptions.map((option) => {
                    const isSelected = currentAnswer === option.value;
                    const shortLabel = scaleLabelMap[option.value] || option.label;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswerSelect(option.value)}
                        className={`
                          flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center
                          ${isSelected
                            ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {shortLabel} {option.value}/5
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </Button>
                  <span className="text-sm text-gray-600">
                    {answeredCount} / {wellnessQuestions.length} responses
                  </span>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className="flex items-center gap-2 text-white"
                    style={{ backgroundColor: '#0F4C56' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0F4C56'}
                  >
                    {isLastQuestion ? 'Complete' : 'Next'}
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </Card>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WellnessAssessmentPage() {
  return (
    <ErrorBoundary showDetails={true}>
      <WellnessAssessmentContent />
    </ErrorBoundary>
  );
}
