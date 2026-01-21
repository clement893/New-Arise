'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card } from '@/components/ui';
import { Target } from 'lucide-react';

function DevelopmentPlanContent() {
  return (
    <div className="space-y-8">
      <div className="mb-8 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          Development Plan
        </h1>
        <p className="text-white">
          Track your personal and professional development goals
        </p>
      </div>

      <Card className="bg-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
            <Target className="text-arise-deep-teal" size={32} style={{ color: '#0F4C56' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Development Plan
            </h2>
            <p className="text-gray-700">
              Set and achieve your professional development goals
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700">
            This page will display your personalized development plan, goals, and resources.
            Content coming soon.
          </p>
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
