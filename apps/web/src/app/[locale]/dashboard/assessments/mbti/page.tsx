'use client';

/**
 * MBTI Assessment Questionnaire Page
 * 40 questions to determine personality type
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMBTIStore } from '@/stores/mbtiStore';
import { mbtiQuestions } from '@/data/mbtiQuestions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sidebar } from '@/components/dashboard/Sidebar';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function MBTIAssessmentPage() {
  const router = useRouter();
  const {
    assessmentId,
    currentQuestionIndex,
    answers,
    isLoading,
    error,
    startMBTIAssessment,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitMBTI,
  } = useMBTIStore();

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      startMBTIAssessment();
    }
  }, [assessmentId, startMBTIAssessment]);

  useEffect(() => {
    // Load existing answer for current question
    const currentQuestion = mbtiQuestions[currentQuestionIndex];
    if (currentQuestion) {
      const existingAnswer = answers.find((a) => a.questionId === currentQuestion.id);
      if (existingAnswer) {
        // Determine which option was selected
        if (existingAnswer.preference === currentQuestion.optionA.preference) {
          setSelectedOption('A');
        } else {
          setSelectedOption('B');
        }
      } else {
        setSelectedOption(null);
      }
    }
  }, [currentQuestionIndex, answers]);

  const handleSelectOption = async (option: 'A' | 'B') => {
    const currentQuestion = mbtiQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error('Current question not found');
      return;
    }
    const preference =
      option === 'A' ? currentQuestion.optionA.preference : currentQuestion.optionB.preference;

    setSelectedOption(option);

    try {
      await answerQuestion(currentQuestion.id, preference);
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleNext = () => {
    if (selectedOption) {
      if (currentQuestionIndex < mbtiQuestions.length - 1) {
        nextQuestion();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleSubmit = async () => {
    try {
      await submitMBTI();
      router.push(`/dashboard/assessments/mbti/results?id=${assessmentId}`);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    }
  };

  if (!assessmentId || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = mbtiQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Question not found</p>
          </div>
        </div>
      </div>
    );
  }
  const progress = ((currentQuestionIndex + 1) / mbtiQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === mbtiQuestions.length - 1;
  const canSubmit = answers.length === mbtiQuestions.length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <MotionDiv variant="slideUp" duration="normal" className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">MBTI Personality Assessment</h1>
            <p className="text-gray-600">Discover your personality type across 4 dimensions</p>
          </MotionDiv>

          {/* Progress Bar */}
          <MotionDiv variant="slideUp" duration="normal" delay={100} className="mb-8">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of {mbtiQuestions.length}
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    {progress.toFixed(0)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Question Card */}
          <MotionDiv
            key={currentQuestionIndex}
            variant="slideUp"
            duration="fast"
            className="mb-8"
          >
            <Card>
              <div className="p-8">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                    {currentQuestion.dimension === 'EI' && 'Energy Source'}
                    {currentQuestion.dimension === 'SN' && 'Information Gathering'}
                    {currentQuestion.dimension === 'TF' && 'Decision Making'}
                    {currentQuestion.dimension === 'JP' && 'Lifestyle'}
                  </span>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Option A */}
                  <button
                    onClick={() => handleSelectOption('A')}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                      selectedOption === 'A'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === 'A'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedOption === 'A' && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{currentQuestion.optionA.text}</p>
                      </div>
                    </div>
                  </button>

                  {/* Option B */}
                  <button
                    onClick={() => handleSelectOption('B')}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                      selectedOption === 'B'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === 'B'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedOption === 'B' && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{currentQuestion.optionB.text}</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Error Message */}
          {error && (
            <MotionDiv variant="slideUp" duration="normal" className="mb-8">
              <Card className="bg-red-50 border-red-200">
                <div className="p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              </Card>
            </MotionDiv>
          )}

          {/* Navigation */}
          <MotionDiv variant="slideUp" duration="normal" delay={200} className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {isLastQuestion && canSubmit ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Submitting...' : 'Submit Assessment'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!selectedOption || isLastQuestion}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}
