'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card } from '@/components/ui';
import { Award } from 'lucide-react';

function ReputationPlanContent() {
  return (
    <div className="space-y-8">
      <div className="mb-8 pb-6">
        <h1 className="text-4xl font-bold text-arise-deep-teal mb-2">
          Reputation Plan
        </h1>
        <p className="text-gray-600">
          Manage and track your professional reputation
        </p>
      </div>

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
            <Award className="text-arise-deep-teal" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Reputation Plan
            </h2>
            <p className="text-gray-600">
              Build and maintain your professional reputation
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700">
            This page will display your reputation plan features and progress.
            Content coming soon.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function ReputationPlanPage() {
  return (
    <ErrorBoundary>
      <ReputationPlanContent />
    </ErrorBoundary>
  );
}
