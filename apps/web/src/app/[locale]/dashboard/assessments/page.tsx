'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Grid, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Brain, Target, Users, Heart, Upload, CheckCircle, Lock } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  icon: any;
  externalLink?: string;
  requiresEvaluators?: boolean;
}

function AssessmentsContent() {
  const router = useRouter();
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);

  const assessments: Assessment[] = [
    {
      id: 'mbti',
      title: 'MBTI Personality',
      description: 'Understanding your natural preferences',
      status: 'completed',
      icon: Brain,
      externalLink: 'https://www.psychometrics.com/assessments/mbti/',
    },
    {
      id: 'tki',
      title: 'TKI Conflict Style',
      description: 'Explore your conflict management approach',
      status: 'completed',
      icon: Target,
      externalLink: 'https://www.psychometrics.com/assessments/tki/',
    },
    {
      id: '360-feedback',
      title: '360° Feedback',
      description: 'Multi-faceted leadership perspectives',
      status: 'in-progress',
      icon: Users,
      requiresEvaluators: true,
    },
    {
      id: 'wellness',
      title: 'Wellness',
      description: 'Your overall well-being',
      status: 'available',
      icon: Heart,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            Completed
          </div>
        );
      case 'in-progress':
        return (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            In progress
          </div>
        );
      case 'locked':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <Lock size={16} />
            Locked
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
            Available
          </div>
        );
    }
  };

  const getActionButton = (assessment: Assessment) => {
    switch (assessment.status) {
      case 'completed':
        if (assessment.externalLink) {
          return (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(assessment.externalLink, '_blank')}
            >
              <Upload size={16} />
              Upload my score
            </Button>
          );
        }
        return (
          <Button variant="outline" onClick={() => router.push(`/dashboard/results/${assessment.id}`)}>
            Review
          </Button>
        );
      case 'in-progress':
        return (
          <Button 
            variant="primary"
            onClick={() => {
              if (assessment.requiresEvaluators) {
                setShowEvaluatorModal(true);
              } else {
                router.push(`/dashboard/assessments/${assessment.id}`);
              }
            }}
          >
            Continue
          </Button>
        );
      case 'available':
        return (
          <Button 
            variant="primary"
            onClick={() => router.push(`/dashboard/assessments/${assessment.id}`)}
          >
            Add
          </Button>
        );
      default:
        return (
          <Button variant="secondary" disabled>
            Locked
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Background */}
        <div 
          className="fixed inset-0 ml-64 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/dashboard-bg.jpg)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8">
          <MotionDiv variant="fade" duration="normal">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-arise-deep-teal mb-2">
                Your assessments
              </h1>
              <p className="text-gray-600">
                Track and manage your leadership assessments
              </p>
            </div>
          </MotionDiv>

          <MotionDiv variant="slideUp" delay={100}>
            <Stack gap="normal">
              {assessments.map((assessment, index) => {
                const Icon = assessment.icon;
                return (
                  <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-arise-deep-teal" size={32} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {assessment.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {assessment.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(assessment.status)}
                        {assessment.externalLink && assessment.status !== 'completed' && (
                          <span className="px-3 py-1 border border-arise-deep-teal text-arise-deep-teal rounded-full text-xs font-medium">
                            External link
                          </span>
                        )}
                        {getActionButton(assessment)}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* 360 Feedback Evaluators Section */}
              <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-arise-gold/20 rounded-full flex items-center justify-center">
                      <Users className="text-arise-gold" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Add your evaluators before starting this assessment
                      </h3>
                      <p className="text-sm text-gray-600">
                        Invite colleagues to provide 360° feedback on your leadership
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="primary"
                    className="bg-arise-gold text-white hover:bg-arise-gold/90"
                    onClick={() => setShowEvaluatorModal(true)}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            </Stack>
          </MotionDiv>
        </div>
      </div>

      {/* Evaluator Modal - Placeholder */}
      {showEvaluatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add Evaluators
            </h2>
            <p className="text-gray-600 mb-6">
              This feature will allow you to invite colleagues to evaluate your leadership.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowEvaluatorModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => setShowEvaluatorModal(false)}
              >
                Coming Soon
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <ErrorBoundary>
      <AssessmentsContent />
    </ErrorBoundary>
  );
}
