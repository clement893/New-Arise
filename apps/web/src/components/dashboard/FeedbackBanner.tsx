'use client';

import { Info } from 'lucide-react';

export function FeedbackBanner() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-arise-deep-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Info className="text-arise-deep-teal" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Add Your 360° Feedback Contributors
          </h3>
          <p className="text-sm text-gray-600">
            Get comprehensive feedback by inviting colleagues to evaluate your leadership.
          </p>
        </div>
      </div>
      <button className="px-6 py-2 bg-arise-deep-teal text-white rounded-lg font-medium hover:bg-arise-deep-teal/90 transition-colors whitespace-nowrap">
        Add contributors
      </button>
    </div>
  );
}
