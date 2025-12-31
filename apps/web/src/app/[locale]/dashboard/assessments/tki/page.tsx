'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTKIStore } from '@/stores/tkiStore';
import { tkiQuestions, tkiModes } from '@/data/tkiQuestions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

export default function TKIAssessmentPage() {
  const router = useRouter();
  const {
    assessmentId,
    currentQuestion,
    answers,
    isLoading,
    error,
    isCompleted,
    startAssessment,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitAssessment,
  } = useTKIStore();

  const [showIntro, setShowIntro] = useState(!assessmentId);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentQuestionData = tkiQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / tkiQuestions.length) * 100;
  const isLastQuestion = currentQuestion === tkiQuestions.length - 1;

  useEffect(() => {
    if (currentQuestionData && answers[currentQuestionData.id]) {
      setSelectedAnswer(answers[currentQuestionData.id]);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestion, answers, currentQuestionData]);

  const handleStart = async () => {
    await startAssessment();
    setShowIntro(false);
  };

  const handleSelectAnswer = async (answer: 'A' | 'B') => {
    setSelectedAnswer(answer);
    await answerQuestion(currentQuestionData.id, answer);
  };

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

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal via-arise-teal-dark to-arise-teal flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-white p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-arise-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-arise-teal mb-2">Congratulations!</h1>
              <p className="text-gray-600">
                You've completed the TKI Conflict Style Assessment
              </p>
            </div>

            <div className="mb-6 p-4 bg-arise-beige rounded-lg">
              <p className="text-sm text-gray-700">
                Your conflict management style profile is being calculated. Click below to view your detailed results.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push(`/dashboard/assessments/tki/results?id=${assessmentId}`)}
                className="bg-arise-gold hover:bg-arise-gold-dark text-white"
              >
                View Results
              </Button>
              <Button
                onClick={() => router.push('/dashboard/assessments')}
                variant="outline"
              >
                Back to Assessments
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arise-teal via-arise-teal-dark to-arise-teal flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          <Card className="bg-white p-8">
            <h1 className="text-3xl font-bold text-arise-teal mb-4 text-center">
              TKI Conflict Style Assessment
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Explore your conflict management approach
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-arise-teal mb-4">Five Conflict Management Modes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tkiModes.map((mode) => (
                  <div key={mode.id} className="p-4 bg-arise-beige rounded-lg">
                    <div className="text-3xl mb-2">{mode.icon}</div>
                    <h3 className="font-semibold text-arise-teal mb-1">{mode.title}</h3>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-arise-teal/10 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-arise-teal mb-2">How it works:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 30 questions with two options each</li>
                <li>• Choose the statement that best describes your typical behavior</li>
                <li>• There are no right or wrong answers</li>
                <li>• Takes approximately 10-15 minutes</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleStart}
                disabled={isLoading}
                className="bg-arise-gold hover:bg-arise-gold-dark text-white px-8 py-3"
              >
                {isLoading ? 'Starting...' : 'Start Assessment'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-arise-teal via-arise-teal-dark to-arise-teal flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Question {currentQuestion + 1} of {tkiQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-arise-gold h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-arise-teal mb-4">
                When dealing with conflict, which statement best describes you?
              </h2>
            </div>

            <div className="space-y-4 mb-8">
              {/* Option A */}
              <button
                onClick={() => handleSelectAnswer('A')}
                disabled={isLoading}
                className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                  selectedAnswer === 'A'
                    ? 'border-arise-gold bg-arise-gold/10'
                    : 'border-gray-200 hover:border-arise-teal hover:bg-arise-teal/5'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                    selectedAnswer === 'A' ? 'border-arise-gold bg-arise-gold' : 'border-gray-300'
                  }`}>
                    <span className={`font-bold ${selectedAnswer === 'A' ? 'text-white' : 'text-gray-400'}`}>
                      A
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{currentQuestionData.optionA}</p>
                </div>
              </button>

              {/* Option B */}
              <button
                onClick={() => handleSelectAnswer('B')}
                disabled={isLoading}
                className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                  selectedAnswer === 'B'
                    ? 'border-arise-gold bg-arise-gold/10'
                    : 'border-gray-200 hover:border-arise-teal hover:bg-arise-teal/5'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                    selectedAnswer === 'B' ? 'border-arise-gold bg-arise-gold' : 'border-gray-300'
                  }`}>
                    <span className={`font-bold ${selectedAnswer === 'B' ? 'text-white' : 'text-gray-400'}`}>
                      B
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{currentQuestionData.optionB}</p>
                </div>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handleBack}
                disabled={currentQuestion === 0 || isLoading}
                variant="outline"
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || isLoading}
                className="bg-arise-gold hover:bg-arise-gold-dark text-white"
              >
                {isLoading ? 'Saving...' : isLastQuestion ? 'Submit' : 'Next'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
