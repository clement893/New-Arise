'use client';

/**
 * Public Evaluator Assessment Page
 * Allows external evaluators to complete 360° feedback assessments
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { feedback360Questions, feedback360Capabilities } from '@/data/feedback360Questions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import axios from 'axios';
import { feedback360CapabilityIcons, DefaultIcon } from '@/lib/utils/assessmentIcons';

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

  // Get capability info and icon
  const currentCapability = feedback360Capabilities?.find((c) => c.id === currentQuestion?.capability);
  const CapabilityIcon = currentCapability 
    ? (feedback360CapabilityIcons[currentCapability.id] || DefaultIcon)
    : DefaultIcon;

  // Map scale labels to short format
  const scaleLabelMap: Record<number, string> = {
    1: 'Not at all',
    2: 'Rarely',
    3: 'Sometimes',
    4: 'Often',
    5: 'Always',
  };

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
    <div className="relative min-h-screen bg-gray-50">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      <div className="relative z-10 p-8">
        {/* Info Header */}
        <MotionDiv variant="slideUp" duration="normal" className="mb-6">
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                360° Feedback for {assessmentInfo?.participant_name}
              </h1>
              <p className="text-sm text-gray-700 mb-2">
                Hello {assessmentInfo?.evaluator_name}, you've been invited to provide anonymous feedback.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>Expires in {daysUntilExpiry} days</span>
              </div>
            </div>
          </Card>
        </MotionDiv>

        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="max-w-4xl w-full">
            <MotionDiv
              key={currentQuestionIndex}
              variant="slideUp"
              duration="fast"
            >
              <Card className="p-8 bg-white/95">
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
                      Question {currentQuestionIndex + 1} / {feedback360Questions.length}
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
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Scale Options - Horizontal */}
                <div className="flex gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = selectedScore === score;
                    const shortLabel = scaleLabelMap[score] || 
                      (score === 1 ? 'Strongly Disagree' :
                       score === 2 ? 'Disagree' :
                       score === 3 ? 'Neutral' :
                       score === 4 ? 'Agree' : 'Strongly Agree');
                    return (
                      <button
                        key={score}
                        onClick={() => handleSelectScore(score)}
                        disabled={isSaving}
                        className={`
                          flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center
                          ${isSelected
                            ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                          }
                          ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {shortLabel} {score}/5
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Error Message */}
                {error && assessmentInfo && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || isSaving}
                    className="flex items-center gap-2"
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </Button>
                  <span className="text-sm text-gray-600">
                    {answers.length} / {feedback360Questions.length} responses
                  </span>
                  {isLastQuestion && canSubmit ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedScore === null || isSaving}
                      className="flex items-center gap-2 text-white"
                      style={{ backgroundColor: '#0F4C56' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F4C56'}
                    >
                      {isSaving ? 'Submitting...' : 'Submit Feedback'}
                      <Check size={20} />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={selectedScore === null || isLastQuestion || isSaving}
                      className="flex items-center gap-2 text-white"
                      style={{ backgroundColor: '#0F4C56' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F4C56'}
                    >
                      Next
                      <ArrowRight size={20} />
                    </Button>
                  )}
                </div>
              </Card>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
}
