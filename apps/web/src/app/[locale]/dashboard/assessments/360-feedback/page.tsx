'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MotionDiv from '@/components/motion/MotionDiv';
import { useFeedback360Store } from '@/stores/feedback360Store';
import {
  feedback360Questions,
  feedback360Capabilities,
  feedback360Scale,
} from '@/data/feedback360Questions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { formatError } from '@/lib/utils/formatError';
import { feedback360CapabilityIcons, DefaultIcon } from '@/lib/utils/assessmentIcons';

export default function Feedback360Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    assessmentId,
    currentQuestion,
    answers,
    isLoading,
    error,
    setAnswer,
    loadExistingAnswers,
    nextQuestion,
    previousQuestion,
    submitAssessment,
    getProgress,
  } = useFeedback360Store();

  const [screen, setScreen] = useState<'intro' | 'questions' | 'complete'>('intro');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  // Safety check: ensure feedback360Questions is loaded and currentQuestion is valid
  const question = feedback360Questions && feedback360Questions.length > 0 && currentQuestion >= 0 && currentQuestion < feedback360Questions.length
    ? feedback360Questions[currentQuestion]
    : null;
  const progress = getProgress();

  // Get assessmentId from URL params (set when coming from /360-feedback/start)
  const urlAssessmentId = searchParams?.get('assessmentId') 
    ? parseInt(searchParams.get('assessmentId')!) 
    : null;

  // Use URL assessmentId if available, otherwise use store assessmentId
  const effectiveAssessmentId = urlAssessmentId || assessmentId;

  useEffect(() => {
    // If we have an assessmentId from URL but not in store, load existing answers
    if (urlAssessmentId) {
      if (urlAssessmentId !== assessmentId) {
        // Load existing answers and navigate to last question
        loadExistingAnswers(urlAssessmentId);
      } else if (assessmentId && Object.keys(answers).length === 0) {
        // Assessment ID matches but no answers loaded, load them
        loadExistingAnswers(assessmentId);
      }
    } else if (assessmentId && Object.keys(answers).length === 0) {
      // We have an assessmentId in store but no answers, load them
      loadExistingAnswers(assessmentId);
    }
  }, [urlAssessmentId, assessmentId, loadExistingAnswers]);

  useEffect(() => {
    // Load existing answer for current question
    if (question && answers[question.id]) {
      setSelectedValue(answers[question.id] || null);
    } else {
      setSelectedValue(null);
    }
  }, [currentQuestion, question, answers]);

  const handleStart = () => {
    // Assessment should already be created via /360/start endpoint
    // Just proceed to questions screen - no need to call startAssessment()
    if (!effectiveAssessmentId) {
      // Redirect to start page if no assessment ID found
      if (process.env.NODE_ENV === 'development') {
        console.error('No assessment ID found. Please start the 360° feedback from the start page.');
      }
      router.push('/dashboard/assessments/360-feedback/start');
      return;
    }
    setScreen('questions');
  };

  const handleSelectValue = async (value: number) => {
    if (!question) return;
    setSelectedValue(value);
    await setAnswer(question.id, value);
  };

  const handleNext = () => {
    if (currentQuestion < 29) {
      nextQuestion();
    } else {
      // Last question - show complete screen
      setScreen('complete');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      previousQuestion();
    }
  };

  const handleSubmit = async () => {
    try {
      await submitAssessment();
      router.push('/dashboard/assessments/360-feedback/results');
    } catch (err) {
      // Error is already handled by the store and displayed to user
      // Only log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to submit assessment:', err);
      }
    }
  };

  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-arise-teal p-8">
        <div className="mx-auto">
          <MotionDiv
            variant="slideUp"
            duration="normal"
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <h1 className="mb-4 text-3xl font-bold text-gray-900">360° Feedback Assessment</h1>
            <p className="mb-6 text-gray-600">
              The 360° feedback process provides a complete view of your leadership by combining
              your self-reflection with feedback from colleagues, leaders, direct reports and
              external stakeholders.
            </p>

            <div className="mb-8 rounded-lg bg-primary-50 p-6">
              <h2 className="mb-3 text-xl font-semibold text-primary-900">
                Self-Assessment Guidelines
              </h2>
              <ul className="space-y-2 text-sm text-primary-800">
                <li>
                  <strong>Reflective:</strong> Take time to carefully consider your actions,
                  decisions, and the impact you have had on others in the last twelve months.
                </li>
                <li>
                  <strong>Honest:</strong> Acknowledge both your strengths and the areas where you
                  can grow; authentic self-insight creates the most value.
                </li>
                <li>
                  <strong>Balanced:</strong> Focus on real behaviors and outcomes, not just
                  intentions or isolated moments.
                </li>
                <li>
                  <strong>Developmental:</strong> Approach this as an opportunity to learn more
                  about yourself and set a foundation for continued growth.
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                6 Leadership Capabilities
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {feedback360Capabilities.map((capability) => (
                  <div
                    key={capability.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
                  >
                    <span className="text-2xl">{capability.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{capability.title}</h3>
                      <p className="text-sm text-gray-600">{capability.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full bg-arise-gold hover:bg-arise-gold/90"
            >
              {isLoading ? 'Starting...' : 'Start Self-Assessment'}
            </Button>

            {error && <p className="mt-4 text-center text-sm text-red-600">{typeof error === 'string' ? error : formatError(error)}</p>}
          </MotionDiv>
        </div>
      </div>
    );
  }

  if (screen === 'complete') {
    return (
      <div className="min-h-screen bg-arise-teal p-8">
        <div className="mx-auto max-w-2xl">
          <MotionDiv
            variant="fade"
            duration="normal"
            className="rounded-lg bg-white p-8 text-center shadow-lg"
          >
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success-500" />
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Self-Assessment Complete!</h1>
            <p className="mb-8 text-gray-600">
              Thank you for completing your self-assessment. Your responses have been saved.
            </p>

            <div className="mb-8 rounded-lg bg-primary-50 p-6">
              <p className="text-sm text-primary-800">
                <strong>Next Step:</strong> Invite colleagues to provide their feedback on your
                leadership. Their perspectives will be combined with your self-assessment to create
                a comprehensive 360° view.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessments')}
                className="flex-1"
              >
                Back to Assessments
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-arise-gold hover:bg-arise-gold/90"
              >
                {isLoading ? 'Submitting...' : 'Submit & View Results'}
              </Button>
            </div>

            {error && <p className="mt-4 text-center text-sm text-red-600">{typeof error === 'string' ? error : formatError(error)}</p>}
          </MotionDiv>
        </div>
      </div>
    );
  }

  // Questions screen
  // Safety check: ensure we have valid question data
  if (!question || !feedback360Questions || feedback360Questions.length === 0) {
    return (
      <div className="min-h-screen bg-arise-teal p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <p className="text-gray-600 mb-4">Unable to load question data.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Safety check: ensure currentQuestion is valid
  if (currentQuestion < 0 || currentQuestion >= feedback360Questions.length) {
    // Convert to string to prevent React error #130
    const errorDetails = `currentQuestion: ${currentQuestion}, questionsLength: ${feedback360Questions.length}`;
    console.error('[360°] Invalid currentQuestion:', errorDetails);
    return (
      <div className="min-h-screen bg-arise-teal p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <p className="text-gray-600 mb-4">Invalid question index. Resetting...</p>
            <Button onClick={() => {
              useFeedback360Store.setState({ currentQuestion: 0 });
              window.location.reload();
            }} className="mt-4">
              Reset Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentCapability = feedback360Capabilities.find((c) => c.id === question.capability);
  const CapabilityIcon = currentCapability 
    ? (feedback360CapabilityIcons[currentCapability.id] || DefaultIcon)
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
      <div className="relative z-10 p-8" style={{ backgroundColor: '#D5DEE0' }}>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-7xl w-full" style={{ marginLeft: '1.25%' }}>
            <MotionDiv key={currentQuestion} variant="slideUp" duration="fast">
              <Card className="p-8" style={{ backgroundColor: '#D5DEE0', borderRadius: '24px' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <CapabilityIcon className="w-6 h-6" style={{ color: '#0F4C56' }} />
                    <span className="font-semibold text-gray-900">
                      {currentCapability?.title || '360° Feedback'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Question {currentQuestion + 1} / {feedback360Questions.length}
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
                    {currentCapability?.title || 'Leadership'}
                  </div>
                </div>

                {/* Question Area */}
                <div className="mb-8 text-center">
                  <div className="mb-6">
                    <CapabilityIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#0F4C56' }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F4C56' }}>
                    {question.question}
                  </h2>
                </div>

                {/* Scale Options - Horizontal */}
                <div className="flex gap-3 mb-8">
                  {feedback360Scale.map((option) => {
                    const isSelected = selectedValue === option.value;
                    const shortLabel = scaleLabelMap[option.value] || option.label;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelectValue(option.value)}
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
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2"
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </Button>
                  <span className="text-sm text-gray-600">
                    {answeredCount} / {feedback360Questions.length} responses
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={selectedValue === null}
                    className="flex items-center gap-2 text-white"
                    style={{ backgroundColor: '#0F4C56' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0F4C56'}
                  >
                    {currentQuestion === 29 ? 'Finish' : 'Next'}
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
