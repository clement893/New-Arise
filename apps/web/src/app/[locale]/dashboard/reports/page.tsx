'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card, Loading } from '@/components/ui';
import Button from '@/components/ui/Button';
import { FileText, Download, TrendingUp, Target, Users, Brain } from 'lucide-react';
import Image from 'next/image';
import { getMyAssessments, getAssessmentResults, get360Evaluators, getDevelopmentGoalsCount, Assessment as ApiAssessment, AssessmentType, AssessmentResult } from '@/lib/api/assessments';
import { generateAssessmentPDF, generateAllAssessmentsZip, generateCompleteLeadershipProfilePDF, downloadBlob } from '@/lib/utils/pdfGenerator';

interface AssessmentDisplay {
  id: number;
  name: string;
  type: AssessmentType;
  status: 'completed' | 'in-progress';
  completedDate: string;
  score: string;
  result: string;
  detailedResult?: AssessmentResult; // Store detailed result for insights
}

interface KeyInsight {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface DashboardStats {
  completedAssessments: number;
  averageScore: number;
  developmentGoals: number;
  evaluatorsCount: number;
}

function ResultsReportsContent() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [keyInsights, setKeyInsights] = useState<KeyInsight[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    completedAssessments: 0,
    averageScore: 0,
    developmentGoals: 0,
    evaluatorsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiAssessments = await getMyAssessments();
      
      // Filter only completed assessments
      const completedAssessments = apiAssessments.filter(
        (a: ApiAssessment) => a.status === 'COMPLETED'
      );

      // Load detailed results for each assessment to generate insights
      const transformedAssessments: AssessmentDisplay[] = await Promise.all(
        completedAssessments.map(async (assessment: ApiAssessment) => {
          const completedDate = assessment.completed_at 
            ? new Date(assessment.completed_at).toLocaleDateString('fr-FR')
            : 'N/A';
          
          // Try to load detailed result for insights
          let detailedResult: AssessmentResult | undefined;
          try {
            detailedResult = await getAssessmentResults(assessment.id);
          } catch (err) {
            // If result not available, continue without it
            console.warn(`Could not load detailed result for assessment ${assessment.id}:`, err);
          }
          
          // Extract score/result from score_summary or detailed result
          let score = 'N/A';
          let result = 'Completed';
          
          if (detailedResult?.scores) {
            const scores = detailedResult.scores;
            if (assessment.assessment_type === 'MBTI' && scores.mbti_type) {
              result = scores.mbti_type;
              score = scores.percentage ? `${Math.round(scores.percentage)}%` : '100%';
            } else if (assessment.assessment_type === 'TKI' && scores.mode_scores) {
              // Find dominant mode
              const modeEntries = Object.entries(scores.mode_scores);
              if (modeEntries.length > 0) {
                const dominant = modeEntries.sort(([, a], [, b]) => (b as number) - (a as number))[0];
                if (dominant) {
                  result = dominant[0];
                  score = '100%';
                }
              }
            } else if (assessment.assessment_type === 'WELLNESS' && scores.percentage) {
              score = `${Math.round(scores.percentage)}%`;
              result = 'Wellness Score';
            } else if (assessment.assessment_type === 'THREE_SIXTY_SELF' && scores.percentage) {
              score = `${Math.round(scores.percentage)}%`;
              result = '360° Feedback';
            } else if (scores.percentage !== undefined) {
              score = `${Math.round(scores.percentage)}%`;
            }
          } else if (assessment.score_summary) {
            const summary = assessment.score_summary;
            if (assessment.assessment_type === 'MBTI' && summary.profile) {
              result = summary.profile;
              score = '100%';
            } else if (assessment.assessment_type === 'TKI' && summary.dominant_mode) {
              result = summary.dominant_mode;
              score = '100%';
            } else if (assessment.assessment_type === 'WELLNESS' && summary.percentage) {
              score = `${Math.round(summary.percentage)}%`;
              result = 'Wellness Score';
            } else if (assessment.assessment_type === 'THREE_SIXTY_SELF' && summary.total_score) {
              score = `${Math.round(summary.total_score)}%`;
              result = '360° Feedback';
            } else if (summary.percentage) {
              score = `${Math.round(summary.percentage)}%`;
            }
          }

          return {
            id: assessment.id,
            name: getAssessmentName(assessment.assessment_type),
            type: assessment.assessment_type,
            status: 'completed',
            completedDate,
            score,
            result,
            detailedResult,
          };
        })
      );

      setAssessments(transformedAssessments);
      
      // Generate key insights from assessments
      const insights = generateKeyInsights(transformedAssessments);
      setKeyInsights(insights);
      
      // Load additional stats after assessments are set
      loadAdditionalStats(completedAssessments, transformedAssessments);
    } catch (err: any) {
      console.error('Failed to load assessments:', err);
      setError('Failed to load assessment results');
      // Fallback to empty array
      setAssessments([]);
      setKeyInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdditionalStats = async (completedAssessments: ApiAssessment[], transformedAssessments: AssessmentDisplay[]) => {
    try {
      // Count evaluators from 360 assessments
      let evaluatorsCount = 0;
      const threeSixtyAssessments = completedAssessments.filter(
        (a) => a.assessment_type === 'THREE_SIXTY_SELF'
      );
      
      for (const assessment of threeSixtyAssessments) {
        try {
          const evaluators = await get360Evaluators(assessment.id);
          evaluatorsCount += evaluators.evaluators?.length || 0;
        } catch (err) {
          console.warn(`Could not load evaluators for assessment ${assessment.id}:`, err);
        }
      }
      
      // Load development goals count
      let developmentGoalsCount = 0;
      try {
        const goalsData = await getDevelopmentGoalsCount();
        developmentGoalsCount = goalsData.count || 0;
      } catch (err) {
        console.warn('Could not load development goals count:', err);
      }
      
      // Calculate average score from transformed assessments
      const scores = transformedAssessments
        .map((a) => {
          const score = parseFloat(a.score.replace('%', ''));
          return isNaN(score) ? 0 : score;
        })
        .filter((s) => s > 0);
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;
      
      setStats({
        completedAssessments: completedAssessments.length,
        averageScore,
        developmentGoals: developmentGoalsCount,
        evaluatorsCount,
      });
    } catch (err) {
      console.error('Failed to load additional stats:', err);
    }
  };

  const generateKeyInsights = (assessments: AssessmentDisplay[]): KeyInsight[] => {
    const insights: KeyInsight[] = [];
    let insightId = 1;

    // MBTI Insight
    const mbti = assessments.find((a) => a.type === 'MBTI' && a.detailedResult);
    if (mbti && mbti.detailedResult?.scores?.mbti_type) {
      const mbtiType = mbti.detailedResult.scores.mbti_type;
      const description = mbti.detailedResult.insights?.personality_type 
        || `Your personality type is ${mbtiType}, which indicates a strategic approach to leadership and decision-making.`;
      
      insights.push({
        id: insightId++,
        title: 'Leadership Style',
        description,
        category: 'Personality',
      });
    }

    // TKI Insight
    const tki = assessments.find((a) => a.type === 'TKI' && a.detailedResult);
    if (tki && tki.detailedResult?.scores?.mode_scores) {
      const modeScores = tki.detailedResult.scores.mode_scores;
      const modeEntries = Object.entries(modeScores);
      if (modeEntries.length > 0) {
        const sorted = modeEntries.sort(([, a], [, b]) => (b as number) - (a as number));
        const dominantEntry = sorted[0];
        if (dominantEntry) {
          const dominantMode = dominantEntry[0];
          const modeNames: Record<string, string> = {
            competing: 'Competing',
            collaborating: 'Collaborating',
            compromising: 'Compromising',
            avoiding: 'Avoiding',
            accommodating: 'Accommodating',
          };
          const modeName = modeNames[dominantMode.toLowerCase()] || dominantMode;
          
          insights.push({
            id: insightId++,
            title: 'Conflict Resolution',
            description: `Your dominant conflict style is ${modeName}, which is highly effective for ${dominantMode === 'collaborating' ? 'team environments and complex problem-solving' : dominantMode === 'competing' ? 'decisive situations requiring quick action' : 'finding balanced solutions'}.`,
            category: 'TKI',
          });
        }
      }
    }

    // 360° Feedback Insight
    const threeSixty = assessments.find((a) => a.type === 'THREE_SIXTY_SELF' && a.detailedResult);
    if (threeSixty && threeSixty.detailedResult?.scores) {
      const scores = threeSixty.detailedResult.scores;
      if (scores.capability_scores && typeof scores.capability_scores === 'object') {
        const capabilities = Object.entries(scores.capability_scores);
        if (capabilities.length > 0) {
          const sorted = capabilities.sort(([, a], [, b]) => {
            const aScore = typeof a === 'number' ? a : (a as any).self_score || 0;
            const bScore = typeof b === 'number' ? b : (b as any).self_score || 0;
            return bScore - aScore;
          });
          const strongestEntry = sorted[0];
          if (strongestEntry) {
            const strongest = strongestEntry[0];
            
            insights.push({
              id: insightId++,
              title: 'Team Perception',
              description: `Your 360° feedback shows strong ${strongest.replace(/_/g, ' ')} capabilities, with clear vision and effective communication skills recognized by your colleagues.`,
              category: '360 Feedback',
            });
          }
        }
      } else if (scores.percentage) {
        insights.push({
          id: insightId++,
          title: 'Team Perception',
          description: `Your 360° feedback score is ${Math.round(scores.percentage)}%, indicating strong leadership capabilities recognized by your team.`,
          category: '360 Feedback',
        });
      }
    }

    // Wellness Insight
    const wellness = assessments.find((a) => a.type === 'WELLNESS' && a.detailedResult);
    if (wellness && wellness.detailedResult?.scores) {
      const scores = wellness.detailedResult.scores;
      if (scores.pillar_scores && typeof scores.pillar_scores === 'object') {
        const pillars = Object.entries(scores.pillar_scores);
        if (pillars.length > 0) {
          const sorted = pillars.sort(([, a], [, b]) => {
            const aScore = typeof a === 'number' ? a : (a as any).score || (a as any).percentage || 0;
            const bScore = typeof b === 'number' ? b : (b as any).score || (b as any).percentage || 0;
            return bScore - aScore;
          });
          const strongestEntry = sorted[0];
          const weakestEntry = sorted[sorted.length - 1];
          if (strongestEntry && weakestEntry) {
            const strongest = strongestEntry[0];
            const weakest = weakestEntry[0];
            
            insights.push({
              id: insightId++,
              title: 'Wellness Focus',
              description: `Your wellness score is ${wellness.score}. Your strongest pillar is ${strongest.replace(/_/g, ' ')}, while ${weakest.replace(/_/g, ' ')} could benefit from more attention for optimal performance.`,
              category: 'Wellness',
            });
          }
        }
      } else if (scores.percentage) {
        insights.push({
          id: insightId++,
          title: 'Wellness Focus',
          description: `Your wellness score is ${wellness.score}. Consider improving stress management and sleep quality for better overall performance.`,
          category: 'Wellness',
        });
      }
    }

    // Fill with default insights if we don't have enough
    if (insights.length < 4) {
      const defaultInsights = [
        {
          id: insightId++,
          title: 'Continue Your Journey',
          description: 'Complete additional assessments to unlock more personalized insights and recommendations.',
          category: 'General',
        },
      ];
      insights.push(...defaultInsights.slice(0, 4 - insights.length));
    }

    return insights.slice(0, 4); // Return max 4 insights
  };

  const getAssessmentName = (type: AssessmentType): string => {
    const names: Record<AssessmentType, string> = {
      MBTI: 'MBTI Personality',
      TKI: 'TKI Conflict Style',
      WELLNESS: 'Wellness Assessment',
      THREE_SIXTY_SELF: '360° Feedback',
    };
    return names[type] || type;
  };

  const handleViewDetails = (assessment: AssessmentDisplay) => {
    // Route to the appropriate results page based on assessment type
    if (assessment.type === 'TKI') {
      router.push(`/dashboard/assessments/tki/results?id=${assessment.id}`);
    } else if (assessment.type === 'THREE_SIXTY_SELF') {
      router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.id}`);
    } else if (assessment.type === 'WELLNESS') {
      router.push(`/dashboard/assessments/results?id=${assessment.id}`);
    } else if (assessment.type === 'MBTI') {
      router.push(`/dashboard/assessments/mbti/results?id=${assessment.id}`);
    } else {
      // Default to general results page
      router.push(`/dashboard/assessments/results?id=${assessment.id}`);
    }
  };

  const handleExportAll = async () => {
    try {
      if (assessments.length === 0) {
        alert('No assessments to export.');
        return;
      }

      setIsGeneratingPDF(true);
      
      // Generate ZIP with all PDFs
      const zipBlob = await generateAllAssessmentsZip(assessments);
      
      // Download the ZIP file
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlob(zipBlob, `ARISE_Assessments_${timestamp}.zip`);
    } catch (err) {
      console.error('Failed to export assessments:', err);
      alert('Failed to export assessments. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadProfile = async () => {
    try {
      if (assessments.length === 0) {
        alert('No assessments available to generate profile.');
        return;
      }

      setIsGeneratingPDF(true);

      // Generate comprehensive PDF
      const pdfBlob = await generateCompleteLeadershipProfilePDF(assessments);
      
      // Download the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlob(pdfBlob, `ARISE_Complete_Leadership_Profile_${timestamp}.pdf`);
    } catch (err) {
      console.error('Failed to download profile:', err);
      alert('Failed to download profile. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadAssessment = async (assessment: AssessmentDisplay) => {
    try {
      setIsGeneratingPDF(true);

      // Generate PDF for this assessment
      const pdfBlob = await generateAssessmentPDF(assessment);
      
      // Download the PDF
      const fileName = `${assessment.name.replace(/\s+/g, '_')}_${assessment.id}.pdf`;
      downloadBlob(pdfBlob, fileName);
    } catch (err) {
      console.error('Failed to download assessment:', err);
      alert('Failed to download assessment. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          Results & Reports
        </h1>
        <p className="text-white">
          View your assessment results and comprehensive leadership profile
        </p>
      </div>

      {/* Wrapper for content with background color block */}
      <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
        {/* Background color block behind all content */}
        <div 
          className="absolute"
          style={{ 
            backgroundColor: '#D5DEE0',
            top: '-20px',
            bottom: 0,
            left: '-15%',
            right: '-15%',
            width: 'calc(100% + 30%)',
            zIndex: 0,
            borderRadius: '16px',
          }}
        />
        
        {/* Content sections with relative positioning */}
        <div className="relative z-10 space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center bg-white">
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="text-arise-deep-teal" size={24} />
              </div>
              <p className="text-3xl font-bold text-arise-deep-teal mb-1">{stats.completedAssessments}</p>
              <p className="text-gray-700 text-sm">Assessments Completed</p>
            </Card>

            <Card className="p-6 text-center bg-white">
              <div className="w-12 h-12 bg-arise-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-arise-gold" size={24} />
              </div>
              <p className="text-3xl font-bold text-arise-gold mb-1">{stats.averageScore}%</p>
              <p className="text-gray-700 text-sm">Average Score</p>
            </Card>

            <Card className="p-6 text-center bg-white">
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="text-primary-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-primary-500 mb-1">{stats.developmentGoals}</p>
              <p className="text-gray-700 text-sm">Development Goals</p>
            </Card>

            <Card className="p-6 text-center bg-white">
              <div className="w-12 h-12 bg-success-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="text-success-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-success-500 mb-1">{stats.evaluatorsCount}</p>
              <p className="text-gray-700 text-sm">360° Evaluators</p>
            </Card>
          </div>

          {/* Assessment Results */}
          <Card className="p-6 text-white border-0" style={{ backgroundColor: '#10454D' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-arise-deep-teal" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Your Assessment Results
                  </h2>
                  <p className="text-white/90">
                    Comprehensive overview of your completed assessments
                  </p>
                </div>
              </div>
              <Button 
                variant="arise-primary"
                className="flex items-center gap-2"
                onClick={handleExportAll}
                disabled={isGeneratingPDF || assessments.length === 0}
              >
                <Download size={16} />
                {isGeneratingPDF ? 'Generating...' : 'Export All'}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loading />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-700">No completed assessments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <Card key={assessment.id} className="p-4 border border-gray-200 hover:border-arise-deep-teal/30 transition-colors bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                          <Brain className="text-arise-deep-teal" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {assessment.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <span>Completed: {assessment.completedDate}</span>
                            <span>•</span>
                            <span>Score: {assessment.score}</span>
                            <span>•</span>
                            <span className="font-semibold text-arise-deep-teal">{assessment.result}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="arise-primary"
                          size="sm"
                          onClick={() => handleViewDetails(assessment)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadAssessment(assessment)}
                          title={`Download ${assessment.name} report`}
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Key Insights */}
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                <Brain className="text-arise-deep-teal" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Key Insights
                </h2>
                <p className="text-gray-700">
                  Important findings from your assessments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyInsights.length > 0 ? (
                keyInsights.map((insight) => (
                <Card key={insight.id} className="p-4 border border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-arise-gold rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {insight.title}
                        </h3>
                        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                          {insight.category}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <p>Complete assessments to see your key insights</p>
                </div>
              )}
            </div>
          </Card>

          {/* Comprehensive Leadership Profile */}
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                <Target className="text-arise-deep-teal" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Comprehensive Leadership Profile
                </h2>
                <p className="text-gray-700">
                  All four assessments integrate seamlessly to create your comprehensive leadership profile
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MBTI Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                      <span className="text-purple-500 font-bold text-sm">M</span>
                    </div>
                    MBTI Personality
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Understanding your natural preferences and how you interact with the world
                  </p>
                </div>

                {/* TKI Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500/10 rounded flex items-center justify-center">
                      <span className="text-primary-500 font-bold text-sm">T</span>
                    </div>
                    TKI Conflict Management
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Explore your conflict management approach and how you handle disagreements
                  </p>
                </div>

                {/* 360 Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-success-500/10 rounded flex items-center justify-center">
                      <span className="text-success-500 font-bold text-sm">360</span>
                    </div>
                    360° Feedback
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Multi-faceted leadership perspectives from colleagues and team members
                  </p>
                </div>

                {/* Wellness Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-arise-gold/10 rounded flex items-center justify-center">
                      <span className="text-arise-gold font-bold text-sm">W</span>
                    </div>
                    Wellness Assessment
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Holistic view of your health and well-being across six key pillars
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  variant="arise-primary"
                  className="w-full"
                  onClick={handleDownloadProfile}
                  disabled={isGeneratingPDF || assessments.length === 0}
                >
                  {isGeneratingPDF ? 'Generating PDF...' : 'Download Complete Leadership Profile'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Ready to accelerate your growth? */}
          <Card className="text-white border-0 p-8 overflow-hidden" style={{ backgroundColor: '#2E2E2E' }}>
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
      </div>
    </div>
  );
}

export default function ResultsReportsPage() {
  return (
    <ErrorBoundary>
      <ResultsReportsContent />
    </ErrorBoundary>
  );
}
