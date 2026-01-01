'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { FileText, Download, TrendingUp, Target, Users, Brain } from 'lucide-react';
import Image from 'next/image';

function ResultsReportsContent() {
  const router = useRouter();
  // Mock data for assessment results
  const assessments = [
    {
      id: 1,
      name: 'MBTI Personality',
      type: 'MBTI',
      status: 'completed',
      completedDate: '2024-01-15',
      score: '100%',
      result: 'INTJ',
    },
    {
      id: 2,
      name: 'TKI Conflict Style',
      type: 'TKI',
      status: 'completed',
      completedDate: '2024-01-20',
      score: '100%',
      result: 'Collaborating',
    },
    {
      id: 3,
      name: '360° Feedback',
      type: '360',
      status: 'completed',
      completedDate: '2024-01-25',
      score: '85%',
      result: 'Strong Leadership',
    },
    {
      id: 4,
      name: 'Wellness Assessment',
      type: 'WELLNESS',
      status: 'completed',
      completedDate: '2024-01-30',
      score: '78%',
      result: 'Good Balance',
    },
  ];

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Results & Reports
        </h1>
        <p className="text-white/80">
          View your assessment results and comprehensive leadership profile
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="text-arise-deep-teal" size={24} />
          </div>
          <p className="text-3xl font-bold text-arise-deep-teal mb-1">4</p>
          <p className="text-gray-600 text-sm">Assessments Completed</p>
        </Card>

        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-arise-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-arise-gold" size={24} />
          </div>
          <p className="text-3xl font-bold text-arise-gold mb-1">88%</p>
          <p className="text-gray-600 text-sm">Average Score</p>
        </Card>

        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-500 mb-1">12</p>
          <p className="text-gray-600 text-sm">Development Goals</p>
        </Card>

        <Card className="p-6 text-center bg-white">
          <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-500 mb-1">8</p>
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
          {assessments.map((assessment) => (
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
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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
                <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-sm">T</span>
                </div>
                TKI Conflict Management
              </h3>
              <p className="text-gray-600 text-sm">
                Explore your conflict management approach and how you handle disagreements
              </p>
            </div>

            {/* 360 Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                  <span className="text-green-500 font-bold text-sm">360</span>
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
      <Card className="bg-arise-deep-teal text-white p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3">
              Ready to accelerate your growth?
            </h2>
            <p className="text-white/90 mb-4">
              Connect with expert ARISE coaches who specialize in leadership development. 
              Schedule your FREE coaching session to debrief your results and build a personalized development plan.
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
      </Card>
    </div>
  );
}

export default function ResultsReportsPage() {
  return (
    <ErrorBoundary>
      <ResultsReportsContent />
    </ErrorBoundary>
  );
}
