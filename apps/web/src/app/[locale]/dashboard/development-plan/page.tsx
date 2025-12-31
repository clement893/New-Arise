'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card } from '@/components/ui';
import { TrendingUp } from 'lucide-react';

function DevelopmentPlanContent() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-arise-deep-teal mb-2">
          Development Plan
        </h1>
        <p className="text-gray-600">
          Track your personal and professional development journey
        </p>
      </div>

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-arise-deep-teal" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Development Plan
            </h2>
            <p className="text-gray-600">
              Create and follow your personalized development roadmap
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700">
            This page will display your development plan, goals, and progress tracking.
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
