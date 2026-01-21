'use client';

import { Card } from '@/components/ui';
import { AssessmentResult } from '@/lib/api/assessments';

interface TKIResultContentProps {
  results: AssessmentResult;
  assessmentId: number;
}

export default function TKIResultContent({ results, assessmentId }: TKIResultContentProps) {
  // TODO: Implement full TKI results display similar to the actual results page
  return (
    <div className="space-y-6">
      <Card className="bg-arise-deep-teal text-white">
        <h2 className="text-2xl font-bold mb-4">TKI Assessment Results</h2>
        <p className="text-white/90">Detailed TKI results will be displayed here.</p>
        <pre className="mt-4 p-4 bg-white/10 rounded text-sm overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
