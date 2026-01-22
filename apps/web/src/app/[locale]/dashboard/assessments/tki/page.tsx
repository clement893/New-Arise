'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTKIStore } from '@/stores/tkiStore';
import { tkiQuestions, tkiModes } from '@/data/tkiQuestions';
import { getMyAssessments } from '@/lib/api/assessments';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { formatError } from '@/lib/utils/formatError';
import { Target, ArrowLeft, ArrowRight } from 'lucide-react';

export default function TKIAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlAssessmentId = searchParams.get('assessmentId');
  const {
    assessmentId,
    currentQuestion,
    answers,
    isLoading,
    error,
    isCompleted,
    startAssessment,
    loadExistingAnswers,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitAssessment,
  } = useTKIStore();

  // Use assessmentId from URL if available, otherwise use store
  const effectiveAssessmentId = urlAssessmentId ? parseInt(urlAssessmentId, 10) : assessmentId;
  const [showIntro, setShowIntro] = useState(!effectiveAssessmentId);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Reset isCompleted if assessmentId changes (e.g., loading a different assessment)
  useEffect(() => {
    if (effectiveAssessmentId && effectiveAssessmentId !== assessmentId) {
      // Loading a different assessment, reset completion status
      useTKIStore.setState({ isCompleted: false });
    }
  }, [effectiveAssessmentId, assessmentId]);

  // Safety check: ensure tkiQuestions is loaded and currentQuestion is valid
  const currentQuestionData = tkiQuestions && tkiQuestions.length > 0 && currentQuestion >= 0 && currentQuestion < tkiQuestions.length
    ? tkiQuestions[currentQuestion]
    : null;
  // Calculate progress based on answered questions, not current question position (like wellness assessment)
  const progress = tkiQuestions && tkiQuestions.length > 0
    ? Math.round((Object.keys(answers).length / tkiQuestions.length) * 100)
    : 0;
  const isLastQuestion = tkiQuestions && tkiQuestions.length > 0
    ? currentQuestion === tkiQuestions.length - 1
    : false;

  // Check for existing assessment and load answers on mount
  useEffect(() => {
    const checkExistingAssessment = async () => {
      // Priority: URL param > store > API lookup
      if (urlAssessmentId) {
        const id = parseInt(urlAssessmentId, 10);
        if (!isNaN(id)) {
          try {
            // Assessment ID from URL, load existing answers but always show intro first
            await loadExistingAnswers(id);
            // Always show intro first, user can click "Start Assessment" to continue
            setShowIntro(true);
          } catch (err) {
            // If assessment not found, show intro
            const error = err as { message?: string; response?: { status?: number } };
            if (error?.response?.status === 404 || error?.message?.includes('not found')) {
              setShowIntro(true);
              // Clean up URL parameter
              const newParams = new URLSearchParams(searchParams.toString());
              newParams.delete('assessmentId');
              router.replace(`/dashboard/assessments/tki${newParams.toString() ? '?' + newParams.toString() : ''}`, { scroll: false });
            } else {
              // Other errors, still show intro but log error
              console.error('Failed to load assessment:', err);
              setShowIntro(true);
            }
          }
          return;
        }
      }
      
      if (assessmentId) {
        try {
          // Assessment ID exists in store, load existing answers but always show intro first
          await loadExistingAnswers(assessmentId);
          // Always show intro first, user can click "Start Assessment" to continue
          setShowIntro(true);
        } catch (err) {
          // If assessment not found, show intro
          const error = err as { message?: string; response?: { status?: number } };
          if (error?.response?.status === 404 || error?.message?.includes('not found')) {
            setShowIntro(true);
          } else {
            console.error('Failed to load assessment:', err);
            setShowIntro(true);
          }
        }
      } else {
        // Check if there's an existing assessment
        try {
          const assessments = await getMyAssessments();
          const tkiAssessment = assessments.find(
            a => a.assessment_type === 'TKI' && 
            (a.status === 'IN_PROGRESS' || a.status === 'in_progress' || a.status === 'NOT_STARTED' || a.status === 'not_started')
          );
          
          if (tkiAssessment && tkiAssessment.id) {
            try {
              // Load existing answers but always show intro first
              await loadExistingAnswers(tkiAssessment.id);
              // Always show intro first, user can click "Start Assessment" to continue
              setShowIntro(true);
            } catch (err) {
              // If assessment not found, show intro
              const error = err as { message?: string; response?: { status?: number } };
              if (error?.response?.status === 404 || error?.message?.includes('not found')) {
                setShowIntro(true);
              } else {
                console.error('Failed to load assessment:', err);
                setShowIntro(true);
              }
            }
          } else {
            setShowIntro(true);
          }
        } catch (err) {
          // Convert error to string to prevent React error #130
          const errorMessage = formatError(err);
          console.error('Failed to check existing assessments:', errorMessage);
          setShowIntro(true);
        }
      }
    };

    checkExistingAssessment();
  }, [urlAssessmentId, assessmentId, loadExistingAnswers, router, searchParams]); // Re-run when URL param or store changes

  useEffect(() => {
    if (currentQuestionData && answers[currentQuestionData.id]) {
      setSelectedAnswer(answers[currentQuestionData.id] || null);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestion, answers, currentQuestionData]);

  const handleStart = async () => {
    try {
      // Check if there's an existing assessment
      const assessments = await getMyAssessments();
      const tkiAssessment = assessments.find(
        a => a.assessment_type === 'TKI' && 
        (a.status === 'IN_PROGRESS' || a.status === 'in_progress' || a.status === 'NOT_STARTED' || a.status === 'not_started')
      );
      
      if (tkiAssessment && tkiAssessment.id) {
        // Load existing assessment and go to questions
        await loadExistingAnswers(tkiAssessment.id);
        setShowIntro(false);
      } else {
        // No existing assessment, create a new one
        await startAssessment();
        setShowIntro(false);
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error('[TKI] Failed to start assessment:', errorMessage);
      alert('Error: Unable to start the assessment. Please try again.');
    }
  };

  const handleSelectAnswer = async (answer: 'A' | 'B') => {
    if (!currentQuestionData || !effectiveAssessmentId) return;
    setSelectedAnswer(answer);
    try {
      await answerQuestion(currentQuestionData.id, answer);
      // Answer saved successfully
    } catch (err) {
      // Error is already handled by the store
      console.error('Failed to save answer:', err);
      // Show user-friendly error
      alert('Failed to save your answer. Please try again. Your progress is being saved automatically.');
    }
  };

  // Auto-save current answer periodically to prevent data loss (every 2 minutes)
  useEffect(() => {
    if (!effectiveAssessmentId || !currentQuestionData || !selectedAnswer) return;
    
    const autosaveInterval = setInterval(() => {
      if (currentQuestionData && selectedAnswer && effectiveAssessmentId) {
        // Check if answer is already saved
        const currentAnswer = answers[currentQuestionData.id];
        if (currentAnswer !== selectedAnswer) {
          // Answer changed but not saved, save it
          answerQuestion(currentQuestionData.id, selectedAnswer).catch(err => {
            console.warn('Autosave failed:', err);
          });
        }
      }
    }, 120000); // 2 minutes

    return () => clearInterval(autosaveInterval);
  }, [effectiveAssessmentId, currentQuestionData, selectedAnswer, answers, answerQuestion]);

  const handleNext = () => {
    if (isLastQuestion && selectedAnswer) {
      // Submit assessment
      submitAssessment();
    } else {
      nextQuestion();
    }
  };

  const handleBack = () => {
    previousQuestion();
  };

  // Only show completion screen if assessment is actually completed AND we're not loading
  // Check effectiveAssessmentId to ensure we're showing completion for the right assessment
  if (isCompleted && !isLoading && effectiveAssessmentId && effectiveAssessmentId === assessmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal via-arise-teal-dark to-arise-teal flex items-center justify-center p-4">
        <MotionDiv variant="fade" duration="normal" className="max-w-2xl w-full">
          <Card className="p-8 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#0F4C56' }}>
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F4C56' }}>Congratulations!</h1>
              <p className="text-gray-600">You've completed the ARISE Conflict Style Assessment</p>
            </div>

            <div className="mb-6 p-4 bg-arise-beige rounded-lg">
              <p className="text-sm text-gray-700">
                Your conflict management style profile is being calculated. Click below to view your
                detailed results.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push(`/dashboard/assessments/tki/results?id=${effectiveAssessmentId || assessmentId}`)}
                className="text-white"
                style={{ backgroundColor: '#0F4C56' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0F4C56'}
              >
                View Results
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/assessments')} 
                variant="primary"
                style={{ backgroundColor: '#0F4C56', color: '#fff' }}
                className="flex items-center gap-4"
              >
                Back to Assessments
              </Button>
            </div>
          </Card>
        </MotionDiv>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-arise-teal p-8">
        <div className="mx-auto max-w-4xl">
          <MotionDiv
            variant="slideUp"
            duration="normal"
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <h1 className="mb-4 text-3xl font-bold text-gray-900 text-center">
              ARISE Conflict Style Assessment
            </h1>
            
            {/* Introductory Text */}
            <div className="mb-8 text-gray-700 leading-relaxed">
              <p className="mb-4">
                Each conflict management style reflects a different balance between <strong>Assertiveness</strong>—standing up for your own needs—and <strong>Cooperation</strong>—considering and supporting the needs of the other person. This section will help you assess your conflict management tendencies and determine which of the five styles you are most likely to use depending on the occasion or situation.
              </p>
            </div>

            {/* Five Conflict Management Styles */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Five Conflict Management Styles
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tkiModes.map((mode) => (
                  <div
                    key={mode.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
                  >
                    <span className="text-2xl">{mode.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mode.title}</h3>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to complete section */}
            <div className="mb-8 rounded-lg bg-primary-50 p-6">
              <h3 className="mb-3 text-xl font-semibold text-primary-900">
                How to complete this section
              </h3>
              <ul className="space-y-2 text-sm text-primary-800">
                <li>
                  • 30 questions, for each you will be shown 2 statements, you need to select the statement that best describes you
                </li>
                <li>
                  • There are no right or wrong answers
                </li>
              </ul>
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full bg-arise-gold hover:bg-arise-gold/90 text-white"
            >
              {isLoading ? 'Starting...' : 'Start Assessment'}
            </Button>

            {error && (
              <p className="mt-4 text-center text-sm text-red-600">
                {typeof error === 'string' ? error : formatError(error)}
              </p>
            )}
          </MotionDiv>
        </div>
      </div>
    );
  }

  // Early return if no question data
  if (!currentQuestionData || !tkiQuestions || tkiQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal via-arise-teal-dark to-arise-teal flex items-center justify-center p-4">
        <Card className="bg-white p-8 text-center">
          <p className="text-gray-600 mb-4">Unable to load question data.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-arise-gold hover:bg-arise-gold-dark text-white"
          >
            Refresh Page
          </Button>
        </Card>
      </div>
    );
  }
  
  // Safety check: ensure currentQuestion is valid
  if (currentQuestion < 0 || currentQuestion >= tkiQuestions.length) {
    // Convert to string to prevent React error #130
    const errorDetails = `currentQuestion: ${currentQuestion}, questionsLength: ${tkiQuestions.length}`;
    console.error('[TKI] Invalid currentQuestion:', errorDetails);
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal via-arise-teal-dark to-arise-teal flex items-center justify-center p-4">
        <Card className="bg-white p-8 text-center">
          <p className="text-gray-600 mb-4">Invalid question index. Resetting...</p>
          <Button
            onClick={() => {
              useTKIStore.setState({ currentQuestion: 0 });
              window.location.reload();
            }}
            className="bg-arise-gold hover:bg-arise-gold-dark text-white"
          >
            Reset Assessment
          </Button>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-4xl w-full">
            <MotionDiv key={currentQuestion} variant="slideUp" duration="fast">
              <Card className="p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6" style={{ color: '#0F4C56' }} />
                    <span className="font-semibold text-gray-900">
                      ARISE Conflict Style
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Question {currentQuestion + 1} / {tkiQuestions.length}
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, backgroundColor: '#0F4C56' }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(progress)}% completed
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)', color: '#0F4C56' }}>
                    Conflict Style
                  </div>
                </div>

                {/* Question Area */}
                <div className="mb-8 text-center">
                  <div className="mb-6">
                    <Target className="w-16 h-16 mx-auto mb-4" style={{ color: '#0F4C56' }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F4C56' }}>
                    When dealing with conflict, which statement best describes you?
                  </h2>
                </div>

                {/* Options A/B */}
                <div className="space-y-4 mb-8">
                  {/* Option A */}
                  <button
                    onClick={() => handleSelectAnswer('A')}
                    disabled={isLoading}
                    className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedAnswer === 'A'
                        ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-all ${
                          selectedAnswer === 'A' ? 'border-white bg-white text-gray-800 shadow-lg' : 'border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        <span className="font-bold">A</span>
                      </div>
                      <p className={`leading-relaxed transition-colors ${
                        selectedAnswer === 'A'
                          ? 'text-white font-semibold'
                          : 'text-gray-800'
                      }`}>
                        {currentQuestionData.optionA}
                      </p>
                    </div>
                  </button>

                  {/* Option B */}
                  <button
                    onClick={() => handleSelectAnswer('B')}
                    disabled={isLoading}
                    className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedAnswer === 'B'
                        ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-all ${
                          selectedAnswer === 'B' ? 'border-white bg-white text-gray-800 shadow-lg' : 'border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        <span className="font-bold">B</span>
                      </div>
                      <p className={`leading-relaxed transition-colors ${
                        selectedAnswer === 'B'
                          ? 'text-white font-semibold'
                          : 'text-gray-800'
                      }`}>
                        {currentQuestionData.optionB}
                      </p>
                    </div>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {typeof error === 'string' ? error : formatError(error)}
                  </div>
                )}

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleBack}
                    disabled={currentQuestion === 0 || isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </Button>
                  <span className="text-sm text-gray-600">
                    {answeredCount} / {tkiQuestions.length} responses
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer || isLoading}
                    className="flex items-center gap-2 text-white"
                    style={{ backgroundColor: '#0F4C56' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F4C56'}
                  >
                    {isLoading ? 'Saving...' : isLastQuestion ? 'Submit' : 'Next'}
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
