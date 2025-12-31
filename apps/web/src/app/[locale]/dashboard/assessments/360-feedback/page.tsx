'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MotionDiv from '@/components/motion/MotionDiv';
import { useFeedback360Store } from '@/stores/feedback360Store';
import {
  feedback360Questions,
  feedback360Capabilities,
  feedback360Scale,
} from '@/data/feedback360Questions';
import Button from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

export default function Feedback360Page() {
  const router = useRouter();
  const {
    assessmentId,
    currentQuestion,
    answers,
    isLoading,
    error,
    startAssessment,
    setAnswer,
    nextQuestion,
    previousQuestion,
    submitAssessment,
    getProgress,
  } = useFeedback360Store();

  const [screen, setScreen] = useState<'intro' | 'questions' | 'complete'>('intro');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const question = feedback360Questions[currentQuestion];
  const progress = getProgress();

  useEffect(() => {
    // Load existing answer for current question
    if (question && answers[question.id]) {
      setSelectedValue(answers[question.id] || null);
    } else {
      setSelectedValue(null);
    }
  }, [currentQuestion, question, answers]);

  const handleStart = async () => {
    try {
      if (!assessmentId) {
        await startAssessment();
      }
      setScreen('questions');
    } catch (err) {
      console.error('Failed to start assessment:', err);
    }
  };

  const handleSelectValue = async (value: number) => {
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
      console.error('Failed to submit assessment:', err);
    }
  };

  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-arise-teal p-8">
        <div className="mx-auto max-w-4xl">
          <MotionDiv
            variant="slideUp"
            duration="normal"
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              360° Feedback Assessment
            </h1>
            <p className="mb-6 text-gray-600">
              The 360° feedback process provides a complete view of your leadership by combining your self-reflection with feedback from colleagues, leaders, direct reports and external stakeholders.
            </p>

            <div className="mb-8 rounded-lg bg-blue-50 p-6">
              <h2 className="mb-3 text-xl font-semibold text-blue-900">
                Self-Assessment Guidelines
              </h2>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>
                  <strong>Reflective:</strong> Take time to carefully consider your actions, decisions, and the impact you have had on others in the last twelve months.
                </li>
                <li>
                  <strong>Honest:</strong> Acknowledge both your strengths and the areas where you can grow; authentic self-insight creates the most value.
                </li>
                <li>
                  <strong>Balanced:</strong> Focus on real behaviors and outcomes, not just intentions or isolated moments.
                </li>
                <li>
                  <strong>Developmental:</strong> Approach this as an opportunity to learn more about yourself and set a foundation for continued growth.
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
                      <h3 className="font-semibold text-gray-900">
                        {capability.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {capability.description}
                      </p>
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

            {error && (
              <p className="mt-4 text-center text-sm text-red-600">{error}</p>
            )}
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
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              Self-Assessment Complete!
            </h1>
            <p className="mb-8 text-gray-600">
              Thank you for completing your self-assessment. Your responses have been saved.
            </p>

            <div className="mb-8 rounded-lg bg-blue-50 p-6">
              <p className="text-sm text-blue-800">
                <strong>Next Step:</strong> Invite colleagues to provide their feedback on your leadership. Their perspectives will be combined with your self-assessment to create a comprehensive 360° view.
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

            {error && (
              <p className="mt-4 text-center text-sm text-red-600">{error}</p>
            )}
          </MotionDiv>
        </div>
      </div>
    );
  }

  // Questions screen
  return (
    <div className="min-h-screen bg-arise-teal p-8">
      <div className="mx-auto max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-white">
            <span>Question {currentQuestion + 1} of 30</span>
            <span>{progress}% Complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-arise-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <MotionDiv
          key={currentQuestion}
          variant="slideRight"
          duration="normal"
          className="rounded-lg bg-white p-8 shadow-lg"
        >
          {/* Capability Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-arise-teal/10 px-4 py-2 text-sm font-medium text-arise-teal">
              {feedback360Capabilities.find((c) => c.id === question.capability)?.icon}
              {feedback360Capabilities.find((c) => c.id === question.capability)?.title}
            </span>
          </div>

          {/* Question */}
          <h2 className="mb-8 text-2xl font-semibold text-gray-900">
            {question.text}
          </h2>

          {/* Scale */}
          <div className="mb-8 space-y-3">
            {feedback360Scale.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectValue(option.value)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedValue === option.value
                    ? 'border-arise-teal bg-arise-teal/10'
                    : 'border-gray-200 hover:border-arise-teal/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span className="text-2xl font-bold text-arise-teal">
                    {option.value}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={selectedValue === null}
              className="bg-arise-gold hover:bg-arise-gold/90"
            >
              {currentQuestion === 29 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
