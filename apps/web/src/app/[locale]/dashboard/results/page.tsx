'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card, Loading } from '@/components/ui';
import Button from '@/components/ui/Button';
import { FileText, Download, TrendingUp, Target, Users, Brain } from 'lucide-react';
import Image from 'next/image';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType } from '@/lib/api/assessments';

interface AssessmentDisplay {
  id: number;
  name: string;
  type: AssessmentType;
  status: 'completed' | 'in-progress';
  completedDate: string;
  score: string;
  result: string;
}

function ResultsReportsContent() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiAssessments = await getMyAssessments();
      
      // Filter only completed assessments
      const completedAssessments = apiAssessments.filter(
        (a: ApiAssessment) => a.status === 'COMPLETED'
      );

      // Transform to display format
      const transformedAssessments: AssessmentDisplay[] = completedAssessments.map((assessment: ApiAssessment) => {
        const completedDate = assessment.completed_at 
          ? new Date(assessment.completed_at).toLocaleDateString('en-US')
          : 'N/A';
        
        // Extract score/result from score_summary based on type
        let score = 'N/A';
        let result = 'Completed';
        
        if (assessment.score_summary) {
          const summary = assessment.score_summary;
          if (assessment.assessment_type === 'MBTI' && summary.profile) {
            result = summary.profile;
            score = '100%';
          } else if (assessment.assessment_type === 'TKI' && summary.dominant_mode) {
            result = summary.dominant_mode;
            score = '100%';
          } else if (assessment.assessment_type === 'WELLNESS' && summary.percentage) {
            score = `${Math.round(summary.percentage)}%`;
            result = 'Wellness Score';
          } else if (assessment.assessment_type === 'THREE_SIXTY_SELF' && summary.total_score) {
            score = `${Math.round(summary.total_score)}%`;
            result = '360° Feedback';
          } else if (summary.percentage) {
            score = `${Math.round(summary.percentage)}%`;
          }
        }

        return {
          id: assessment.id,
          name: getAssessmentName(assessment.assessment_type),
          type: assessment.assessment_type,
          status: 'completed',
          completedDate,
          score,
          result,
        };
      });

      setAssessments(transformedAssessments);
    } catch (err: any) {
      console.error('Failed to load assessments:', err);
      setError('Failed to load assessment results');
      // Fallback to empty array
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssessmentName = (type: AssessmentType): string => {
    const names: Record<AssessmentType, string> = {
      MBTI: 'MBTI Personality',
      TKI: 'ARISE Conflict Style',
      WELLNESS: 'Wellness Assessment',
      THREE_SIXTY_SELF: '360° Feedback',
    };
    return names[type] || type;
  };

  const handleViewDetails = (assessment: AssessmentDisplay) => {
    // Route to the appropriate results page based on assessment type
    if (assessment.type === 'TKI') {
      router.push(`/dashboard/assessments/tki/results?id=${assessment.id}`);
    } else if (assessment.type === 'THREE_SIXTY_SELF') {
      router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.id}`);
    } else if (assessment.type === 'WELLNESS') {
      router.push(`/dashboard/assessments/results?id=${assessment.id}`);
    } else if (assessment.type === 'MBTI') {
      // MBTI might not have a results page yet, redirect to assessments
      router.push('/dashboard/assessments');
    } else {
      // Default to general results page
      router.push(`/dashboard/assessments/results?id=${assessment.id}`);
    }
  };

  // Mock data for key insights
  const insights = [
    {
      id: 1,
      title: 'Leadership Style',
      description: 'Your INTJ personality type indicates a strategic and analytical approach to leadership.',
      category: 'Personality',
    },
    {
      id: 2,
      title: 'Conflict Resolution',
      description: 'You prefer collaborative problem-solving, which is highly effective in team environments.',
      category: 'TKI',
    },
    {
      id: 3,
      title: 'Team Perception',
      description: 'Your 360° feedback shows strong communication skills and clear vision.',
      category: '360 Feedback',
    },
    {
      id: 4,
      title: 'Wellness Focus',
      description: 'Consider improving your stress management and sleep quality for better performance.',
      category: 'Wellness',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Results & Reports
          </h1>
          <p className="text-gray-600">
            View your assessment results and comprehensive leadership profile
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Results & Reports
        </h1>
        <p className="text-gray-600">
          View your assessment results and comprehensive leadership profile
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="text-arise-deep-teal" size={24} />
          </div>
          <p className="text-3xl font-bold text-arise-deep-teal mb-1">{assessments.length}</p>
          <p className="text-gray-600 text-sm">Assessments Completed</p>
        </Card>

        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-arise-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-arise-gold" size={24} />
          </div>
          <p className="text-3xl font-bold text-arise-gold mb-1">
            {assessments.length > 0
              ? Math.round(
                  assessments.reduce((sum, a) => {
                    const scoreNum = parseFloat(a.score.replace('%', ''));
                    return sum + (isNaN(scoreNum) ? 0 : scoreNum);
                  }, 0) / assessments.length
                )
              : 0}%
          </p>
          <p className="text-gray-600 text-sm">Average Score</p>
        </Card>

        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="text-primary-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-primary-500 mb-1">12</p>
          <p className="text-gray-600 text-sm">Development Goals</p>
        </Card>

        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-success-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="text-success-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-success-500 mb-1">8</p>
          <p className="text-gray-600 text-sm">360° Evaluators</p>
        </Card>
      </div>

      {/* Assessment Results */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
              <FileText className="text-arise-deep-teal" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Assessment Results
              </h2>
              <p className="text-gray-600">
                Comprehensive overview of your completed assessments
              </p>
            </div>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={16} />
            Export All
          </Button>
        </div>

        <div className="space-y-4">
          {assessments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Aucun assessment complété pour le moment.</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => router.push('/dashboard/assessments')}
              >
                Commencer un assessment
              </Button>
            </Card>
          ) : (
            assessments.map((assessment) => (
              <Card key={assessment.id} className="p-4 border border-gray-200 hover:border-arise-deep-teal/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                      <Brain className="text-arise-deep-teal" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {assessment.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Completed: {assessment.completedDate}</span>
                        <span>•</span>
                        <span>Score: {assessment.score}</span>
                        <span>•</span>
                        <span className="font-semibold text-arise-deep-teal">{assessment.result}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleViewDetails(assessment)}
                    >
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
            <Brain className="text-arise-deep-teal" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Key Insights
            </h2>
            <p className="text-gray-600">
              Important findings from your assessments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="p-4 border border-gray-200 bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-arise-gold rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Comprehensive Leadership Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
            <Target className="text-arise-deep-teal" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Comprehensive Leadership Profile
            </h2>
            <p className="text-gray-600">
              All four assessments integrate seamlessly to create your comprehensive leadership profile
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MBTI Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                  <span className="text-purple-500 font-bold text-sm">M</span>
                </div>
                MBTI Personality
              </h3>
              <p className="text-gray-600 text-sm">
                Understanding your natural preferences and how you interact with the world
              </p>
            </div>

            {/* TKI Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500/10 rounded flex items-center justify-center">
                  <span className="text-primary-500 font-bold text-sm">T</span>
                </div>
                ARISE Conflict Management
              </h3>
              <p className="text-gray-600 text-sm">
                Explore your conflict management approach and how you handle disagreements
              </p>
            </div>

            {/* 360 Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-success-500/10 rounded flex items-center justify-center">
                  <span className="text-success-500 font-bold text-sm">360</span>
                </div>
                360° Feedback
              </h3>
              <p className="text-gray-600 text-sm">
                Multi-faceted leadership perspectives from colleagues and team members
              </p>
            </div>

            {/* Wellness Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-arise-gold/10 rounded flex items-center justify-center">
                  <span className="text-arise-gold font-bold text-sm">W</span>
                </div>
                Wellness Assessment
              </h3>
              <p className="text-gray-600 text-sm">
                Holistic view of your health and well-being across six key pillars
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button variant="primary" className="w-full bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white">
              Download Complete Leadership Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Ready to accelerate your growth? */}
      <div className="bg-arise-deep-teal text-white p-8 rounded-lg border border-arise-deep-teal shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Ready to accelerate your growth?
            </h2>
            <p className="text-white/90 mb-4">
              Connect with expert ARISE coaches who specialize in leadership development. 
              Schedule your FREE coaching session to debrief your results and build a personalized personal growth plan.
            </p>
            <Button 
              variant="secondary" 
              className="bg-arise-gold hover:bg-arise-gold/90 text-white"
              onClick={() => router.push('/dashboard/coaching-options')}
            >
              Explore coaching options →
            </Button>
          </div>
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src="/images/leader-4.jpg"
              alt="Coaching session"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ErrorBoundary>
      <ResultsReportsContent />
    </ErrorBoundary>
  );
}
