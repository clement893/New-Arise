'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { useWellnessStore } from '@/stores/wellnessStore';
import { wellnessQuestions, wellnessPillars, scaleOptions } from '@/data/wellnessQuestionsReal';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { getMyAssessments, submitAssessment as submitAssessmentApi, getAssessmentResults } from '@/lib/api/assessments';
import { determineAssessmentStatus } from '@/lib/utils/assessmentStatus';
import { wellnessQuestions } from '@/data/wellnessQuestionsReal';

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
    isLoading,
  } = useWellnessStore();

  const [showIntro, setShowIntro] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  const currentQuestion = wellnessQuestions[currentQuestionIndex];
  const progress = getProgress();
  const isLastQuestion = currentQuestionIndex === wellnessQuestions.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

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
                    console.error('Failed to submit assessment:', submitErr);
                  }
                }
                // Results don't exist and can't submit, continue with assessment
              } else {
                console.error('Failed to check results:', err);
              }
            }
          }
          
          // Load existing answers and navigate to last unanswered question
          await loadExistingAnswers(wellnessAssessment.id);
        }
      } catch (err) {
        console.error('Failed to check existing assessments:', err);
      } finally {
        setIsCheckingExisting(false);
      }
    };

    checkExistingAssessment();
  }, [router]);

  useEffect(() => {
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
          .catch(() => {
            // Results don't exist yet, show completion screen instead
            console.log('Results not yet available, showing completion screen');
            setShowCompletion(true);
          });
      } else {
        // Fallback: show completion screen if no assessmentId
        setShowCompletion(true);
      }
    }
  }, [isCompleted, router]);

  const handleAnswerSelect = (value: number) => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, value);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await completeAssessment();
      // Completion will trigger automatic redirect via useEffect
    } else {
      nextQuestion();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      setShowIntro(true);
    } else {
      previousQuestion();
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
                      await startAssessment();
                      setShowIntro(false);
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
              <Card className="max-w-2xl text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={48} />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
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
                  >
                    View Results
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleFinish}
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
  return (
    <div className="relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      <div className="relative z-10 p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Question {currentQuestionIndex + 1} of {wellnessQuestions.length}
              </span>
              <span className="text-sm font-medium text-white">
                {progress}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-arise-deep-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card - Centered */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-4xl w-full">
              <MotionDiv variant="slideUp" duration="fast" key={currentQuestionIndex}>
                <Card className="mb-6">
                  <div className="mb-8">
                    <div className="inline-block px-3 py-1 bg-arise-deep-teal/10 text-arise-deep-teal rounded-full text-sm font-medium mb-4">
                      {wellnessPillars.find(p => p.name === currentQuestion?.pillar)?.name}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentQuestion?.question}
                    </h2>
                  </div>

                  {/* Scale Options */}
                  <div className="grid grid-cols-5 gap-4">
                  {scaleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerSelect(option.value)}
                      className={`
                        p-6 rounded-lg border-2 transition-all duration-200 relative
                        ${currentAnswer === option.value
                          ? 'border-arise-deep-teal bg-arise-deep-teal text-white shadow-lg ring-2 ring-arise-deep-teal/30 ring-offset-2 scale-110'
                          : 'border-gray-200 bg-white hover:border-arise-deep-teal/50 hover:bg-arise-deep-teal/5'
                        }
                      `}
                    >
                      {currentAnswer === option.value && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className={`text-3xl font-bold mb-2 ${currentAnswer === option.value ? 'text-white' : 'text-gray-900'}`}>
                        {option.value}
                      </div>
                      <div className={`text-sm font-medium ${currentAnswer === option.value ? 'text-white' : 'text-gray-600'}`}>
                        {option.label}
                      </div>
                    </button>
                  ))}
                  </div>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className="flex items-center gap-2"
                  >
                    {isLastQuestion ? 'Complete' : 'Next'}
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </MotionDiv>
            </div>
          </div>
        </div>
    </div>
  );
}

export default function WellnessAssessmentPage() {
  return (
    <ErrorBoundary>
      <WellnessAssessmentContent />
    </ErrorBoundary>
  );
}
