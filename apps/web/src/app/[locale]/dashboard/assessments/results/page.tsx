'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { assessmentsApi, AssessmentResult, PillarScore } from '@/lib/api/assessments';
import { wellnessPillars } from '@/data/wellnessQuestionsReal';
import { ArrowLeft, Download, Share2, TrendingUp } from 'lucide-react';

function AssessmentResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentId) {
      loadResults(parseInt(assessmentId));
    } else {
      setError('No assessment ID provided');
      setIsLoading(false);
    }
  }, [assessmentId]);

  const loadResults = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await assessmentsApi.getResults(id);
      setResults(data);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arise-deep-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Results not found'}</p>
          <Button onClick={() => router.push('/dashboard/assessments')}>
            Back to Assessments
          </Button>
        </Card>
      </div>
    );
  }

  const { scores } = results;
  const { total_score, max_score, percentage, pillar_scores } = scores;

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      <div className="relative z-10 p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/assessments')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Assessments
            </Button>
            <h1 className="text-4xl font-bold text-arise-deep-teal mb-2">
              Wellness Assessment Results
            </h1>
            <p className="text-gray-600">
              Your comprehensive wellness profile across six key pillars
            </p>
          </div>

          {/* Overall Score Card */}
          <MotionDiv variant="slideUp" duration="normal">
            <Card className="mb-8 bg-gradient-to-br from-arise-deep-teal to-arise-deep-teal/80 text-white">
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp size={48} className="mr-4" />
                  <div className="text-7xl font-bold">{percentage.toFixed(0)}%</div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Overall Wellness Score</h2>
                <p className="text-white/90 text-lg">
                  {total_score} out of {max_score} points
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button variant="outline" className="bg-white text-arise-deep-teal hover:bg-gray-100">
                    <Download className="mr-2" size={16} />
                    Download Report
                  </Button>
                  <Button variant="outline" className="bg-white text-arise-deep-teal hover:bg-gray-100">
                    <Share2 className="mr-2" size={16} />
                    Share Results
                  </Button>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Pillar Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {wellnessPillars.map((pillar, index) => {
              const pillarData = pillar_scores?.[pillar.id];
              const isPillarScoreObject = (data: number | PillarScore | undefined): data is PillarScore => {
                return typeof data === 'object' && data !== null && 'score' in data;
              };
              const pillarScore = isPillarScoreObject(pillarData) ? pillarData.score : (typeof pillarData === 'number' ? pillarData : 0);
              const pillarPercentage = isPillarScoreObject(pillarData) ? pillarData.percentage : (pillarScore / 25) * 100; // Each pillar max is 25
              
              return (
                <MotionDiv 
                  key={pillar.id}
                  variant="slideUp"
                  duration="normal"
                  delay={index * 0.1}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start mb-4">
                      <div className="text-4xl mr-4">{pillar.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {pillar.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Score</span>
                        <span className="font-bold text-arise-deep-teal">
                          {pillarScore} / 25
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-arise-gold rounded-full h-3 transition-all duration-500"
                          style={{ width: `${pillarPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Performance Level */}
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        pillarPercentage >= 80 ? 'bg-green-100 text-green-800' :
                        pillarPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pillarPercentage >= 80 ? 'Excellent' :
                         pillarPercentage >= 60 ? 'Good' :
                         'Needs Attention'}
                      </span>
                    </div>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>

          {/* Insights Section */}
          <MotionDiv variant="fade" duration="normal">
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Key Insights
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-2">Strengths</h3>
                  <p className="text-green-800">
                    Your strongest pillar is {wellnessPillars.find(p => {
                      const data = pillar_scores?.[p.id];
                      const isPillarScoreObject = (d: number | PillarScore | undefined): d is PillarScore => {
                        return typeof d === 'object' && d !== null && 'score' in d;
                      };
                      const score = isPillarScoreObject(data) ? data.score : (typeof data === 'number' ? data : 0);
                      const allScores = Object.values(pillar_scores || {}).map(d => isPillarScoreObject(d) ? d.score : (typeof d === 'number' ? d : 0));
                      return score === Math.max(...allScores);
                    })?.name || 'N/A'}.
                    Keep up the excellent work in this area!
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-bold text-yellow-900 mb-2">Areas for Growth</h3>
                  <p className="text-yellow-800">
                    Consider focusing on {wellnessPillars.find(p => {
                      const data = pillar_scores?.[p.id];
                      const isPillarScoreObject = (d: number | PillarScore | undefined): d is PillarScore => {
                        return typeof d === 'object' && d !== null && 'score' in d;
                      };
                      const score = isPillarScoreObject(data) ? data.score : (typeof data === 'number' ? data : 0);
                      const allScores = Object.values(pillar_scores || {}).map(d => isPillarScoreObject(d) ? d.score : (typeof d === 'number' ? d : 0));
                      return score === Math.min(...allScores);
                    })?.name || 'N/A'} 
                    to achieve a more balanced wellness profile.
                  </p>
                </div>
              </div>
            </Card>
          </MotionDiv>

          {/* Next Steps */}
          <MotionDiv variant="fade" duration="normal">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Next Steps
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700">
                    Review your results with a wellness coach to create a personalized action plan
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700">
                    Complete the TKI and 360° Feedback assessments for a complete leadership profile
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-arise-gold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700">
                    Retake this assessment in 3 months to track your progress
                  </p>
                </li>
              </ul>
              <div className="mt-6 flex gap-4">
                <Button 
                  variant="primary"
                  onClick={() => router.push('/dashboard/assessments')}
                >
                  Continue to Other Assessments
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </MotionDiv>
        </div>
      </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <ErrorBoundary>
      <AssessmentResultsContent />
    </ErrorBoundary>
  );
}
