'use client';

/**
 * Public Evaluator Assessment Page
 * Allows external evaluators to complete 360° feedback assessments
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { feedback360Questions } from '@/data/feedback360Questions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface AssessmentInfo {
  evaluator_name: string;
  participant_name: string;
  assessment_type: string;
  expires_at: string;
}

interface Answer {
  question_id: string;
  score: number;
}

export default function EvaluatorAssessmentPage() {
  const params = useParams();
  const token = params.token as string;

  const [assessmentInfo, setAssessmentInfo] = useState<AssessmentInfo | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadAssessmentInfo();
  }, [token]);

  useEffect(() => {
    // Load existing answer for current question
    const currentQuestion = feedback360Questions[currentQuestionIndex];
    if (currentQuestion) {
      const existingAnswer = answers.find(a => a.question_id === currentQuestion.id);
      if (existingAnswer) {
        setSelectedScore(existingAnswer.score);
      } else {
        setSelectedScore(null);
      }
    }
  }, [currentQuestionIndex, answers.length]); // Use answers.length instead of answers to ensure re-render

  const loadAssessmentInfo = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/evaluators/by-token/${token}`);
      setAssessmentInfo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScore = async (score: number) => {
    const currentQuestion = feedback360Questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    setSelectedScore(score);

    try {
      setIsSaving(true);
      
      await axios.post(`${API_BASE_URL}/evaluators/by-token/${token}/answer`, {
        question_id: currentQuestion.id,
        answer_value: JSON.stringify({
          capability: currentQuestion.capability,
          score: score,
        }),
      });

      // Update local state - create new array to ensure React detects the change
      const existingAnswerIndex = answers.findIndex(a => a.question_id === currentQuestion.id);
      let newAnswers: Answer[];
      
      if (existingAnswerIndex >= 0) {
        newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = { question_id: currentQuestion.id, score };
      } else {
        newAnswers = [...answers, { question_id: currentQuestion.id, score }];
      }

      setAnswers(newAnswers);
      // Also update selectedScore immediately to ensure highlight works
      setSelectedScore(score);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save answer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (selectedScore !== null && currentQuestionIndex < feedback360Questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Convert answers to the format expected by the backend
      const answersPayload = answers.map(answer => ({
        question_id: answer.question_id,
        answer_value: answer.score.toString()
      }));
      
      // Submit all answers at once
      await axios.post(
        `${API_BASE_URL}/api/v1/assessments/360-evaluator/${token}/submit`,
        answersPayload
      );
      
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit assessment');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error && !assessmentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 text-sm">
              This link may have expired or is invalid. Please contact the person who invited you.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-4">
              Your feedback has been submitted successfully. {assessmentInfo?.participant_name} will receive your anonymous responses.
            </p>
            <p className="text-sm text-gray-500">
              You can now close this window.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = feedback360Questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / feedback360Questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === feedback360Questions.length - 1;
  const canSubmit = answers.length === feedback360Questions.length;

  const daysUntilExpiry = assessmentInfo 
    ? Math.ceil((new Date(assessmentInfo.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">Question not found</p>
            <p className="text-gray-600 text-sm">
              The requested question could not be found.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <MotionDiv variant="slideUp" duration="normal" className="mb-8">
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                360° Feedback for {assessmentInfo?.participant_name}
              </h1>
              <p className="text-gray-700 mb-3">
                Hello {assessmentInfo?.evaluator_name}, you've been invited to provide anonymous feedback.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Expires in {daysUntilExpiry} days</span>
              </div>
            </div>
          </Card>
        </MotionDiv>

        {/* Progress Bar */}
        <MotionDiv variant="slideUp" duration="normal" delay={100} className="mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of {feedback360Questions.length}
                </span>
                <span className="text-sm font-medium text-teal-600">
                  {progress.toFixed(0)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
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
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                  {currentQuestion.capability.replace('_', ' ').toUpperCase()}
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentQuestion.question}
                </h2>
                <p className="text-gray-600 text-sm">
                  Rate on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree)
                </p>
              </div>

              {/* Rating Scale */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleSelectScore(score)}
                    disabled={isSaving}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedScore === score
                        ? 'border-teal-600 bg-teal-50 shadow-md ring-2 ring-teal-200 ring-offset-2'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 bg-white'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${
                        selectedScore === score
                          ? 'border-teal-600 bg-teal-600 text-white shadow-lg scale-110'
                          : 'border-gray-300 text-gray-600 bg-white'
                      }`}>
                        {score}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${
                          selectedScore === score
                            ? 'text-teal-900 font-semibold'
                            : 'text-gray-900'
                        }`}>
                          {score === 1 && 'Strongly Disagree'}
                          {score === 2 && 'Disagree'}
                          {score === 3 && 'Neutral'}
                          {score === 4 && 'Agree'}
                          {score === 5 && 'Strongly Agree'}
                        </p>
                      </div>
                      {selectedScore === score && (
                        <div className="flex-shrink-0 animate-fade-in">
                          <Check className="w-6 h-6 text-teal-600" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </MotionDiv>

        {/* Error Message */}
        {error && assessmentInfo && (
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
            disabled={currentQuestionIndex === 0 || isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion && canSubmit ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedScore === null || isSaving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSaving ? 'Submitting...' : 'Submit Feedback'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedScore === null || isLastQuestion || isSaving}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </MotionDiv>
      </div>
    </div>
  );
}
