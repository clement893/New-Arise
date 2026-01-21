'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AssessmentType, getAssessmentResults } from '@/lib/api/assessments';

// Import result content components
import WellnessResultContent from './results/WellnessResultContent';
import TKIResultContent from './results/TKIResultContent';
import MBTIResultContent from './results/MBTIResultContent';
import ThreeSixtyResultContent from './results/ThreeSixtyResultContent';

interface AssessmentResultAccordionProps {
  assessmentId: number;
  assessmentType: AssessmentType;
  isOpen: boolean;
}

export default function AssessmentResultAccordion({
  assessmentId,
  assessmentType,
  isOpen,
}: AssessmentResultAccordionProps) {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load results when accordion opens
  useEffect(() => {
    if (isOpen && !results && !isLoading) {
      loadResults();
    }
  }, [isOpen, assessmentId]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAssessmentResults(assessmentId);
      setResults(data);
    } catch (err: any) {
      console.error('Failed to load assessment results:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResultContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-arise-deep-teal" />
          <span className="ml-3 text-gray-600">Loading results...</span>
        </div>
      );
    }

    if (error || !results) {
      return null;
    }

    // Render appropriate content based on assessment type
    switch (assessmentType) {
      case 'WELLNESS':
        return <WellnessResultContent results={results} />;
      case 'TKI':
        return <TKIResultContent results={results} />;
      case 'MBTI':
        return <MBTIResultContent results={results} />;
      case 'THREE_SIXTY_SELF':
        return <ThreeSixtyResultContent results={results} assessmentId={assessmentId} />;
      default:
        return (
          <div className="py-8 text-center text-gray-600">
            Result display not available for this assessment type.
          </div>
        );
    }
  };

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4">
          {renderResultContent()}
        </div>
      </div>
    </div>
  );
}
