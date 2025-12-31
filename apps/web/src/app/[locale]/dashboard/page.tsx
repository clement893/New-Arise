'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, Button, LoadingSkeleton, Grid, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { 
  Brain, 
  Target, 
  Users, 
  Heart,
  Info,
  ArrowRight
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton variant="custom" className="h-10 w-64 mb-8" />
        <LoadingSkeleton variant="card" className="h-48 mb-8" />
        <LoadingSkeleton variant="card" className="h-64 mb-8" />
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-64" />
        </Grid>
      </div>
    );
  }

  // Mock data - Replace with real data from API
  const progressData = {
    overall: 95,
    items: [
      { label: 'MBTI', percentage: 100, color: 'teal' },
      { label: 'TKI', percentage: 100, color: 'teal' },
      { label: '360° Feedback', percentage: 60, color: 'orange' },
      { label: 'Wellness', percentage: 0, color: 'gray' },
    ],
  };

  const evaluations = [
    {
      title: 'MBTI Personality',
      description: 'Understanding your natural preferences',
      status: 'completed',
      icon: Brain,
    },
    {
      title: 'TKI Conflict Style',
      description: 'Explore Your Conflict Management Approach',
      status: 'completed',
      icon: Target,
    },
    {
      title: '360° Feedback',
      description: 'Multi-Faceted Leadership Perspectives',
      status: 'in-progress',
      icon: Users,
    },
    {
      title: 'Wellness',
      description: 'Add the assessment',
      status: 'locked',
      icon: Heart,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            In progress
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = (status: string, _title: string) => {
    if (status === 'locked') {
      return (
        <Button variant="secondary" disabled className="w-full">
          Locked
        </Button>
      );
    }

    if (status === 'completed') {
      return (
        <Button variant="outline" className="w-full">
          View Results
        </Button>
      );
    }

    return (
      <Button variant="primary" className="w-full">
        Continue
      </Button>
    );
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'teal':
        return 'bg-arise-deep-teal';
      case 'orange':
        return 'bg-arise-gold';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10">
          {/* Welcome Header */}
          <MotionDiv variant="fade" duration="normal">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-arise-deep-teal mb-2">
                Welcome {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-gray-600">
                Continue your journey to authentic leadership
              </p>
            </div>
          </MotionDiv>

          {/* Feedback Banner */}
          <MotionDiv variant="slideUp" delay={100}>
            <Card className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-arise-deep-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="text-arise-deep-teal" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Add Your 360° Feedback Evaluators
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get comprehensive feedback by inviting colleagues to evaluate your leadership.
                    </p>
                  </div>
                </div>
                <Button variant="primary" className="whitespace-nowrap">
                  Add evaluators
                </Button>
              </div>
            </Card>
          </MotionDiv>

          {/* Progress Section */}
          <MotionDiv variant="slideUp" delay={200}>
            <Card className="mb-8 bg-arise-deep-teal/90 text-white border-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
                  <div className="text-6xl font-bold mb-2">{progressData.overall} %</div>
                  <p className="text-white/80 mb-1">
                    You are making good progress in your holistic leadership journey.
                  </p>
                  <p className="text-white font-semibold">Keep it up!</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 mb-6">
                {progressData.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm font-semibold">{item.percentage} %</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className={`${getProgressColor(item.color)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  variant="primary" 
                  className="bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90"
                >
                  Continue Learning
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10"
                >
                  View Reports
                </Button>
              </div>
            </Card>
          </MotionDiv>

          {/* Evaluations Section */}
          <MotionDiv variant="slideUp" delay={300}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your evaluations</h2>
              <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
                {evaluations.map((evaluation, index) => {
                  const Icon = evaluation.icon;
                  return (
                    <Card 
                      key={index} 
                      className={`${evaluation.status === 'locked' ? 'opacity-60' : ''}`}
                    >
                      <Stack gap="normal">
                        {/* Icon and Status */}
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="text-arise-deep-teal" size={24} />
                          </div>
                          {evaluation.status === 'in-progress' && (
                            <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
                              External link
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {evaluation.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {evaluation.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        {getStatusBadge(evaluation.status)}

                        {/* Action Button */}
                        <div className="mt-auto">
                          {getActionButton(evaluation.status, evaluation.title)}
                        </div>
                      </Stack>
                    </Card>
                  );
                })}
              </Grid>
            </div>
          </MotionDiv>

          {/* Coaching Section */}
          <MotionDiv variant="slideUp" delay={400}>
            <Card className="bg-arise-deep-teal/90 text-white border-0 relative overflow-hidden">
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 50px,
                    rgba(255, 255, 255, 0.1) 50px,
                    rgba(255, 255, 255, 0.1) 51px
                  )`
                }}
              />

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to accelerate your growth?
                </h2>
                <p className="text-white/90 mb-6 max-w-2xl">
                  Connect with expert ARISE coaches who specialize in leadership development. 
                  Schedule your FREE coaching session to debrief your results and build a 
                  personalized development plan.
                </p>
                <Button 
                  variant="primary" 
                  className="bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90 flex items-center gap-2"
                >
                  Explore coaching options
                  <ArrowRight size={20} />
                </Button>
              </div>
            </Card>
          </MotionDiv>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
