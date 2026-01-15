'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useRouter } from '@/i18n/routing';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Target, BookOpen, Video, FileText, Users, TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import Image from 'next/image';

function DevelopmentPlanContent() {
  const router = useRouter();
  // Mock data for development goals
  const goals = [
    {
      id: 1,
      title: 'Improve Conflict Management',
      description: 'Develop skills in collaborative problem-solving',
      progress: 60,
      status: 'in_progress',
      dueDate: '2024-03-15',
    },
    {
      id: 2,
      title: 'Enhance Emotional Intelligence',
      description: 'Build self-awareness and empathy',
      progress: 30,
      status: 'in_progress',
      dueDate: '2024-04-01',
    },
    {
      id: 3,
      title: 'Leadership Communication',
      description: 'Master effective team communication',
      progress: 0,
      status: 'not_started',
      dueDate: '2024-05-01',
    },
  ];

  // Mock data for recommended resources
  const resources = [
    {
      id: 1,
      type: 'article',
      title: 'The Five Conflict Management Styles',
      description: 'Understanding different approaches to conflict resolution',
      duration: '10 min read',
      icon: FileText,
    },
    {
      id: 2,
      type: 'video',
      title: 'Emotional Intelligence in Leadership',
      description: 'Learn how to develop and apply EQ in your leadership role',
      duration: '25 min',
      icon: Video,
    },
    {
      id: 3,
      type: 'course',
      title: 'Effective Communication for Leaders',
      description: 'Master the art of clear and inspiring communication',
      duration: '2 hours',
      icon: BookOpen,
    },
    {
      id: 4,
      type: 'workshop',
      title: 'Team Building Workshop',
      description: 'Interactive session on building high-performing teams',
      duration: '3 hours',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          Development <span style={{ color: '#D8B868' }}>Plan</span>
        </h1>
        <p className="text-white">
          Track your personal and professional development journey
        </p>
      </div>

      {/* Your Development Goals */}
      <Card className="bg-white">
        <div className="flex items-center justify-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
              <Target className="text-arise-deep-teal" size={24} style={{ color: '#0F4C56' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Development Goals
              </h2>
              <p className="text-gray-700">
                Track your progress towards your leadership goals
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="border border-gray-200 hover:border-arise-deep-teal/30 transition-colors bg-white" padding={false}>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:gap-0 gap-4 items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {goal.status === 'in_progress' ? (
                    <Circle className="text-arise-gold mt-1" size={20} />
                  ) : (
                    <CheckCircle2 className="text-gray-400 mt-1" size={20} />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {goal.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-3">
                      {goal.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Progress</span>
                        <span className="font-semibold text-arise-deep-teal">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-arise-gold rounded-full h-2 transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                  <div className="text-right sm:ml-4 ml-0">
                    <p className="text-sm text-gray-600">Due date</p>
                    <p className="text-sm font-semibold text-gray-900">{goal.dueDate}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Recommended Resources */}
      <Card className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
            <BookOpen className="text-arise-deep-teal" size={24} style={{ color: '#0F4C56' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended Resources
            </h2>
            <p className="text-gray-700">
              Curated content to support your development goals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card key={resource.id} className="border border-gray-200 hover:border-arise-deep-teal/30 transition-colors bg-white cursor-pointer" padding={false} onClick={() => router.push(`/dashboard/development-plan/resources/${resource.id}`)}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
                    <Icon className="text-arise-deep-teal" size={20} style={{ color: '#0F4C56' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{resource.duration}</span>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        style={{ backgroundColor: '#0F454D', borderColor: '#0F454D', color: '#FFFFFF' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.currentTarget.style.backgroundColor = 'rgba(15, 69, 77, 0.9)';
                          e.currentTarget.style.borderColor = 'rgba(15, 69, 77, 0.9)';
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.currentTarget.style.backgroundColor = '#0F454D';
                          e.currentTarget.style.borderColor = '#0F454D';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/development-plan/resources/${resource.id}`);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Your Progress */}
      <Card className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
            <TrendingUp className="text-arise-deep-teal" size={24} style={{ color: '#0F4C56' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Progress
            </h2>
            <p className="text-gray-700">
              Overview of your development journey
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-arise-deep-teal mb-2">3</p>
            <p className="text-gray-700">Active Goals</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-arise-gold mb-2">45%</p>
            <p className="text-gray-700">Average Progress</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-success-600 mb-2">8</p>
            <p className="text-gray-700">Resources Completed</p>
          </div>
        </div>
      </Card>

      {/* Ready to accelerate your growth? */}
      <Card className="text-white border-0 overflow-hidden" padding={false} style={{ backgroundColor: '#2E2E2E', padding: '2rem calc(7.5% + 2rem)' }}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-3">
              Ready to accelerate your growth?
            </h2>
            <p className="text-white/90 mb-4 break-words">
              Connect with expert ARISE coaches who specialize in leadership development. 
              Schedule your FREE coaching session to debrief your results and build a personalized development plan.
            </p>
            <Button 
              variant="arise-primary"
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

export default function DevelopmentPlanPage() {
  return (
    <ErrorBoundary>
      <DevelopmentPlanContent />
    </ErrorBoundary>
  );
}
