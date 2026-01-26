'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card, Loading } from '@/components/ui';
import Button from '@/components/ui/Button';
import { FileText, Download, TrendingUp, Target, Users, Brain, Eye } from 'lucide-react';
import Image from 'next/image';
import { getMyAssessments, getAssessmentResults, get360Evaluators, getDevelopmentGoalsCount, deleteAllMyAssessments, resetAssessment, Assessment as ApiAssessment, AssessmentType, AssessmentResult } from '@/lib/api/assessments';
import { generateAssessmentPDF, generateAllAssessmentsZip, generateCompleteLeadershipProfilePDF, downloadBlob } from '@/lib/utils/pdfGenerator';
import { checkMySuperAdminStatus } from '@/lib/api/admin';
import { Trash2, AlertTriangle } from 'lucide-react';
import AssessmentResultAccordion from '@/components/reports/AssessmentResultAccordion';

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

interface DashboardStats {
  completedAssessments: number;
  averageScore: number;
  developmentGoals: number;
  evaluatorsCount: number;
}

function ResultsReportsContent() {
  const t = useTranslations('dashboard.reports');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    completedAssessments: 0,
    averageScore: 0,
    developmentGoals: 0,
    evaluatorsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedAssessmentIds, setExpandedAssessmentIds] = useState<Set<number>>(new Set());
  const [showResetAssessmentModal, setShowResetAssessmentModal] = useState(false);
  const [assessmentToReset, setAssessmentToReset] = useState<AssessmentDisplay | null>(null);
  const [resetTitleInput, setResetTitleInput] = useState('');
  const [resetTitleError, setResetTitleError] = useState<string | null>(null);
  const [isResettingAssessment, setIsResettingAssessment] = useState(false);
  const assessmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [executiveSummary, setExecutiveSummary] = useState<{
    leadershipDescription: string | null;
    selfAwarenessDescription: string | null;
  }>({
    leadershipDescription: null,
    selfAwarenessDescription: null,
  });

  useEffect(() => {
    loadAssessments();
    checkSuperAdminStatus();
  }, []);

  // Auto-open accordion based on URL parameters
  useEffect(() => {
    if (assessments.length === 0 || isLoading) return;
    
    const openParam = searchParams.get('open');
    const idParam = searchParams.get('id');
    
    if (openParam === 'tki') {
      // Find TKI assessment - by ID if provided, otherwise the latest TKI
      let tkiAssessment: AssessmentDisplay | undefined;
      if (idParam) {
        const assessmentId = parseInt(idParam, 10);
        tkiAssessment = assessments.find(a => a.id === assessmentId && a.type === 'TKI');
      } else {
        tkiAssessment = assessments.find(a => a.type === 'TKI');
      }
      
      if (tkiAssessment && !expandedAssessmentIds.has(tkiAssessment.id)) {
        // Open the accordion
        setExpandedAssessmentIds(prev => new Set([...prev, tkiAssessment!.id]));
        
        // Scroll to the assessment after a short delay to ensure it's rendered
        setTimeout(() => {
          const element = assessmentRefs.current.get(tkiAssessment!.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Remove URL parameters after opening
            router.replace('/dashboard/reports', { scroll: false });
          }
        }, 300);
      }
    } else if (openParam === '360') {
      // Find 360° Feedback assessment - by ID if provided, otherwise the latest 360
      let feedback360Assessment: AssessmentDisplay | undefined;
      if (idParam) {
        const assessmentId = parseInt(idParam, 10);
        feedback360Assessment = assessments.find(a => a.id === assessmentId && a.type === 'THREE_SIXTY_SELF');
      } else {
        feedback360Assessment = assessments.find(a => a.type === 'THREE_SIXTY_SELF');
      }
      
      if (feedback360Assessment && !expandedAssessmentIds.has(feedback360Assessment.id)) {
        // Open the accordion
        setExpandedAssessmentIds(prev => new Set([...prev, feedback360Assessment!.id]));
        
        // Scroll to the assessment after a short delay to ensure it's rendered
        setTimeout(() => {
          const element = assessmentRefs.current.get(feedback360Assessment!.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Remove URL parameters after opening
            router.replace('/dashboard/reports', { scroll: false });
          }
        }, 300);
      }
    }
  }, [assessments, isLoading, searchParams, expandedAssessmentIds, router]);

  const checkSuperAdminStatus = async () => {
    try {
      const status = await checkMySuperAdminStatus();
      setIsSuperAdmin(status.is_superadmin || false);
    } catch (err) {
      console.error('Failed to check superadmin status:', err);
      setIsSuperAdmin(false);
    }
  };

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiAssessments = await getMyAssessments();
      
      // Safety check: if apiAssessments is not an array, return early
      if (!Array.isArray(apiAssessments)) {
        console.error('[Reports Page] apiAssessments is not an array:', apiAssessments);
        setAssessments([]);
        setIsLoading(false);
        return;
      }
      
      // Debug: log all assessments to see their structure
      console.log('[Reports Page] All assessments:', apiAssessments.map(a => ({
        id: a.id,
        type: a.assessment_type,
        status: a.status,
        is_contributor_assessment: a.is_contributor_assessment,
        user_being_evaluated: a.user_being_evaluated,
        has_user_being_evaluated: !!a.user_being_evaluated,
        user_being_evaluated_keys: a.user_being_evaluated ? Object.keys(a.user_being_evaluated) : []
      })));
      
      // Filter only completed assessments, excluding contributor assessments
      // Contributor assessments are now marked with is_contributor_assessment=true in the database
      const completedAssessments = apiAssessments.filter(
        (a: ApiAssessment) => {
          // Exclude contributor assessments (marked in database when created via token)
          if (a.is_contributor_assessment === true) {
            console.log('[Reports Page] Excluding contributor assessment:', {
              id: a.id,
              type: a.assessment_type,
              is_contributor_assessment: a.is_contributor_assessment
            });
            return false;
          }
          
          // Check if assessment is completed
          const status = (a.status || '').toUpperCase();
          // Include if status is completed (in any case), or if it has a score_summary (finalized with results)
          // or if it has completed_at set (indicating it was finalized)
          return status === 'COMPLETED' || !!a.score_summary || !!a.completed_at;
        }
      );
      
      console.log('[Reports Page] Filtered assessments (after excluding contributors):', completedAssessments.length, completedAssessments.map(a => ({ id: a.id, type: a.assessment_type })));

      // Sort by completed_at (most recent first), then by created_at, then by id as fallback
      const sortedAssessments = [...completedAssessments].sort((a, b) => {
        // First, try to sort by completed_at
        if (a.completed_at && b.completed_at) {
          const dateA = new Date(a.completed_at).getTime();
          const dateB = new Date(b.completed_at).getTime();
          if (dateB !== dateA) return dateB - dateA; // Most recent first
        } else if (a.completed_at && !b.completed_at) return -1;
        else if (!a.completed_at && b.completed_at) return 1;
        
        // If completed_at is same or missing, sort by created_at
        if (a.created_at && b.created_at) {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          if (dateB !== dateA) return dateB - dateA;
        } else if (a.created_at && !b.created_at) return -1;
        else if (!a.created_at && b.created_at) return 1;
        
        // Finally, sort by id (higher id = more recent)
        return (b.id || 0) - (a.id || 0);
      });

      if (sortedAssessments.length === 0) {
        setAssessments([]);
        setStats({
          completedAssessments: 0,
          averageScore: 0,
          developmentGoals: 0,
          evaluatorsCount: 0,
        });
        setIsLoading(false);
        return;
      }

      // Load detailed results for all completed assessments to generate insights
      // Double-check: exclude any contributor assessments (should already be filtered, but safety check)
      const assessmentsToTransform = sortedAssessments.filter((a: ApiAssessment) => {
        // Exclude contributor assessments (marked in database)
        if (a.is_contributor_assessment === true) {
          console.log('[Reports Page] Double-check: Excluding contributor assessment:', {
            id: a.id,
            type: a.assessment_type
          });
          return false;
        }
        return true;
      });
      
      console.log('[Reports Page] Assessments to transform (after double-check):', assessmentsToTransform.length);
      
      const transformedAssessments: AssessmentDisplay[] = await Promise.all(
        assessmentsToTransform.map(async (assessment: ApiAssessment) => {
          const completedDate = assessment.completed_at 
            ? new Date(assessment.completed_at).toLocaleDateString(locale)
            : 'N/A';
          
          // Try to load detailed result for insights
          let detailedResult: AssessmentResult | undefined;
          try {
            detailedResult = await getAssessmentResults(assessment.id);
          } catch (err: any) {
            // If result not available, continue without it
            // This is expected for some assessments that may not have detailed results yet
            // Only log if it's not a 404 (results not found) - those are expected
            const is404 = err?.response?.status === 404 || 
                         (typeof err === 'string' && err.includes('not found')) ||
                         (err?.message && err.message.includes('not found'));
            if (!is404) {
              // Only log unexpected errors
              console.warn(`Could not load detailed result for assessment ${assessment.id}:`, err);
            }
            // Note: Assessment will still be displayed, just without detailed insights
          }
          
          // Extract score/result from score_summary or detailed result
          let score = 'N/A';
          let result = t('assessments.completed');
          
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
                  const modeId = dominant[0].toLowerCase();
                  try {
                    result = t(`insights.tkiModes.${modeId}`);
                    if (result === `insights.tkiModes.${modeId}`) {
                      result = dominant[0]; // Fallback if translation not found
                    }
                  } catch (e) {
                    result = dominant[0]; // Fallback if translation fails
                  }
                  score = '100%';
                }
              }
            } else if (assessment.assessment_type === 'WELLNESS' && scores.percentage) {
              score = `${Math.round(scores.percentage)}%`;
              result = t('assessments.types.WELLNESS');
            } else if (assessment.assessment_type === 'THREE_SIXTY_SELF' && scores.percentage) {
              score = `${Math.round(scores.percentage)}%`;
              result = t('assessments.types.THREE_SIXTY_SELF');
            } else if (scores.percentage !== undefined) {
              score = `${Math.round(scores.percentage)}%`;
            }
          } else if (assessment.score_summary) {
            const summary = assessment.score_summary;
            if (assessment.assessment_type === 'MBTI' && summary.profile) {
              result = summary.profile;
              score = '100%';
            } else if (assessment.assessment_type === 'TKI' && summary.dominant_mode) {
              const modeId = (summary.dominant_mode as string).toLowerCase();
              try {
                result = t(`insights.tkiModes.${modeId}`);
                if (result === `insights.tkiModes.${modeId}`) {
                  result = summary.dominant_mode as string; // Fallback if translation not found
                }
              } catch (e) {
                result = summary.dominant_mode as string; // Fallback if translation fails
              }
              score = '100%';
            } else if (assessment.assessment_type === 'WELLNESS' && summary.percentage) {
              score = `${Math.round(summary.percentage)}%`;
              result = t('assessments.types.WELLNESS');
            } else if (assessment.assessment_type === 'THREE_SIXTY_SELF' && summary.total_score) {
              score = `${Math.round(summary.total_score)}%`;
              result = t('assessments.types.THREE_SIXTY_SELF');
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
      
      // Load executive summary data (pass both transformed and original for fallback)
      await loadExecutiveSummary(transformedAssessments, sortedAssessments);
      
      // Load additional stats after assessments are set
      // Use the latest assessment (first in sorted list) for evaluator count if it's a 360
      const latestAssessment = sortedAssessments[0];
      loadAdditionalStats(completedAssessments, transformedAssessments, latestAssessment);
    } catch (err: any) {
      console.error('Failed to load assessments:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || t('errors.loadFailed');
      setError(errorMessage);
      // Fallback to empty array
      setAssessments([]);
      setStats({
        completedAssessments: 0,
        averageScore: 0,
        developmentGoals: 0,
        evaluatorsCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdditionalStats = async (completedAssessments: ApiAssessment[], transformedAssessments: AssessmentDisplay[], latestAssessment?: ApiAssessment) => {
    try {
      // Count evaluators only from the latest assessment if it's a 360 assessment
      let evaluatorsCount = 0;
      if (latestAssessment && latestAssessment.assessment_type === 'THREE_SIXTY_SELF') {
        try {
          const evaluators = await get360Evaluators(latestAssessment.id);
          evaluatorsCount = evaluators.evaluators?.length || 0;
        } catch (err) {
          console.warn(`Could not load evaluators for assessment ${latestAssessment.id}:`, err);
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

  const getAssessmentName = (type: AssessmentType): string => {
    const names: Record<AssessmentType, string> = {
      MBTI: t('assessments.types.MBTI'),
      TKI: t('assessments.types.TKI'),
      WELLNESS: t('assessments.types.WELLNESS'),
      THREE_SIXTY_SELF: t('assessments.types.THREE_SIXTY_SELF'),
      THREE_SIXTY_EVALUATOR: t('assessments.types.THREE_SIXTY_EVALUATOR') || '360° Evaluator',
    };
    return names[type] || type;
  };

  const getScoreColor = (score: string): string | null => {
    // Extract percentage from score string (e.g., "85%" -> 85)
    const percentageMatch = score.match(/(\d+(?:\.\d+)?)/);
    if (!percentageMatch || !percentageMatch[1]) return null;
    
    const percentage = parseFloat(percentageMatch[1]);
    if (isNaN(percentage)) return null;

    // Determine color based on percentage ranges
    if (percentage < 60) {
      return '#FFC7CE'; // Red
    } else if (percentage >= 60 && percentage <= 74) {
      return '#FFEB9C'; // Yellow
    } else if (percentage >= 75 && percentage <= 85) {
      return '#92D050'; // Light Green
    } else if (percentage >= 86 && percentage <= 100) {
      return '#00B050'; // Dark Green
    }
    
    return null;
  };

  const hasScoreColor = (assessment: AssessmentDisplay): boolean => {
    // Only show color indicator for assessments with percentage scores
    // Wellness and 360° Feedback typically have percentage scores
    return assessment.type === 'WELLNESS' || assessment.type === 'THREE_SIXTY_SELF';
  };

  const handleViewDetails = (assessment: AssessmentDisplay) => {
    // Toggle accordion - allow multiple accordions to be open at once
    setExpandedAssessmentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assessment.id)) {
        newSet.delete(assessment.id);
      } else {
        newSet.add(assessment.id);
      }
      return newSet;
    });
  };

  const handleExportAll = async () => {
    try {
      if (assessments.length === 0) {
        alert(t('errors.noAssessmentsToExport'));
        return;
      }

      setIsGeneratingPDF(true);
      
      // Ensure all assessments have detailed results loaded before generating PDFs
      const assessmentsWithResults = await Promise.all(
        assessments.map(async (assessment) => {
          let detailedResult = assessment.detailedResult;
          if (!detailedResult) {
            try {
              detailedResult = await getAssessmentResults(assessment.id);
            } catch (err) {
              console.warn(`Could not load detailed results for assessment ${assessment.id}:`, err);
            }
          }
          return {
            ...assessment,
            detailedResult: detailedResult || assessment.detailedResult,
          };
        })
      );
      
      // Generate ZIP with all PDFs
      const zipBlob = await generateAllAssessmentsZip(assessmentsWithResults);
      
      // Download the ZIP file
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlob(zipBlob, `ARISE_Assessments_${timestamp}.zip`);
    } catch (err) {
      console.error('Failed to export assessments:', err);
      alert(t('errors.exportFailed'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadProfile = async () => {
    try {
      if (assessments.length === 0) {
        alert(t('errors.noAssessmentsForProfile'));
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
      alert(t('errors.downloadProfileFailed'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadAssessment = async (assessment: AssessmentDisplay) => {
    try {
      setIsGeneratingPDF(true);

      // Ensure we have detailed results - load if not available
      let detailedResult = assessment.detailedResult;
      if (!detailedResult) {
        try {
          detailedResult = await getAssessmentResults(assessment.id);
        } catch (err) {
          console.warn('Could not load detailed results for PDF:', err);
        }
      }

      // Create assessment object with detailed results for PDF generation
      const assessmentForPDF = {
        ...assessment,
        detailedResult: detailedResult || assessment.detailedResult,
      };

      // Generate PDF for this assessment
      const pdfBlob = await generateAssessmentPDF(assessmentForPDF);
      
      // Download the PDF
      const fileName = `${assessment.name.replace(/\s+/g, '_')}_${assessment.id}.pdf`;
      downloadBlob(pdfBlob, fileName);
    } catch (err) {
      console.error('Failed to download assessment:', err);
      alert(t('errors.downloadAssessmentFailed'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDeleteAllAssessments = async () => {
    if (!isSuperAdmin) {
      setError(t('errors.onlySuperAdmin'));
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      const result = await deleteAllMyAssessments();
      
      // Reload assessments after deletion
      await loadAssessments();
      
      setShowDeleteConfirm(false);
      alert(t('errors.deleteSuccess', { count: result.deleted_count }));
    } catch (err: any) {
      console.error('Failed to delete all assessments:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || t('errors.deleteFailed');
      setError(errorMessage);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetAssessmentClick = (assessment: AssessmentDisplay) => {
    setAssessmentToReset(assessment);
    setResetTitleInput('');
    setResetTitleError(null);
    setShowResetAssessmentModal(true);
  };

  const handleResetAssessmentConfirm = async () => {
    if (!assessmentToReset) return;

    // Validate that the input matches the assessment name exactly
    if (resetTitleInput.trim() !== assessmentToReset.name.trim()) {
      setResetTitleError(t('errors.titleMismatch') || 'The title does not match. Please enter the exact assessment title.');
      return;
    }

    try {
      setIsResettingAssessment(true);
      setResetTitleError(null);
      
      await resetAssessment(assessmentToReset.id);
      
      // Reload assessments after reset
      await loadAssessments();
      
      setShowResetAssessmentModal(false);
      setAssessmentToReset(null);
      setResetTitleInput('');
      alert(t('errors.assessmentReset') || 'Assessment reset successfully. You can now start it again from the assessments page.');
    } catch (err: any) {
      console.error('Failed to reset assessment:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || t('errors.resetFailed');
      setResetTitleError(errorMessage);
    } finally {
      setIsResettingAssessment(false);
    }
  };

  const handleResetAssessmentCancel = () => {
    setShowResetAssessmentModal(false);
    setAssessmentToReset(null);
    setResetTitleInput('');
    setResetTitleError(null);
  };

  // Helper function to get Leadership description based on MBTI + ARISE
  const getLeadershipDescription = (mbtiType: string | null, ariseMode: string | null): string | null => {
    if (!mbtiType || !ariseMode) return null;

    // Normalize inputs
    const mbti = mbtiType.toUpperCase();
    const arise = ariseMode.toLowerCase();

    // Map ARISE modes to match the user's data
    const ariseMap: Record<string, string> = {
      'competing': 'Competing',
      'collaborating': 'Collaborating',
      'compromising': 'Compromising',
      'accommodating': 'Accommodating',
      'avoiding': 'Avoidance',
    };

    const normalizedArise = ariseMap[arise] || arise.charAt(0).toUpperCase() + arise.slice(1);

    // Leadership descriptions mapping
    const leadershipMap: Record<string, Record<string, string>> = {
      'ENTJ': {
        'Competing': 'You are driven by a strong need for leadership, strategic control, and achieving measurable results. The competing TKI style aligns naturally with your decisive and goal-oriented nature. You thrive on challenges, clear logic, and efficiency — and you\'re not afraid to assert your ideas when you believe your solution is the most effective path forward. You view conflict as a test of logic and competence rather than emotion. For you, winning a disagreement is not about ego, but about ensuring the best, most rational plan prevails. However, your directness and confidence can sometimes come across as intimidating or dismissive to others, especially if they perceive your assertiveness as unwillingness to listen. When overused, this style can lead to tension or resistance from others who may feel unheard or undervalued. Yet when used skillfully and sparingly, your competing energy can inspire confidence, provide clarity, and move projects forward with precision and speed.',
        'Collaborating': 'You are driven by a need for leadership, long-range planning, and strategic execution. Collaboration appeals to you because it is a logical and results-oriented way to achieve superior outcomes while leveraging the strengths of others. For you, collaborating is an efficient way to gather diverse information and create a "win-win" solution that ensures a project is completed correctly and with broad buy-in. You are motivated to collaborate because it allows you to synthesize new information and achieve a more comprehensive outcome than you could alone. However, you may grow impatient with abstract or emotional discussions, preferring concrete steps and actionable plans instead.',
        'Compromising': 'You are driven by a need for leadership, long-range planning, and strategic execution. You see compromise as a pragmatic, but often less-than-ideal, solution. You may agree to a compromise not because it is optimal, but because you have calculated that the cost of continued conflict—in time, energy, and resources—outweighs the benefit of winning the argument. While practical, this can leave you intellectually unsatisfied if the solution deviates from what you believe is best.',
        'Accommodating': 'You are driven by a need for leadership, long-range planning, and strategic execution. Accommodation is rare for you and occurs only for highly pragmatic reasons, not for emotional harmony. You may accommodate if you calculate that the conflict is not worth your time, lack the authority to win, or see it as a quick way to move forward. This is a calculated decision rather than an emotional one. While effective for low-stakes issues, accommodating may leave you feeling intellectually dissatisfied or resentful if more optimal solutions are overlooked.',
        'Avoidance': 'Avoidance is rare for you. When you choose to avoid conflict, it is a deliberate, rational calculation—not an emotional reaction. You may avoid conflict if you determine it is a waste of time, the parties involved are too emotional or illogical, or there is no clear path to resolution. This is a strategic choice to conserve resources. While it can preserve mental energy, it can frustrate others who feel ignored or dismissed.',
      },
      'ENFJ': {
        'Competing': 'You are driven by a deep desire for social harmony and a need to inspire and guide others. Competing is a rare style for you, used only when a profound threat exists to the values or well-being of the people you care about. You do not compete for personal gain or power — you compete to defend what matters most to your community. When this happens, your usual accommodating nature gives way to fierce, unexpected assertiveness. You fight not to win a debate, but to ensure that a fundamental social or moral order is upheld. This intensity can be emotionally exhausting for you and surprising for those who rarely see this side of you.',
        'Collaborating': 'You are driven by a deep desire for social harmony and a need to inspire and guide others. Collaboration comes naturally to you because it allows you to bring people together and create solutions that strengthen relationships. You value a process that seeks a "win-win" outcome, and see collaboration as more than just solving a problem — it is a shared experience that reinforces human connection. You are motivated to collaborate because it lets you use your skills to facilitate mutual understanding and create solutions that benefit everyone. However, you may feel impatient if the process becomes too slow or overly abstract, losing sight of the human connection that matters most to you.',
        'Compromising': 'You are driven by a strong desire for social harmony and unity. Compromise comes naturally to you as a way to ease tension and help the group move forward. You willingly meet others halfway to maintain peace and ensure that no one feels they have lost. This style aligns with your preference for avoiding drawn-out confrontation. However, compromising on something deeply important to you can leave you feeling personally or intellectually unsatisfied, as if you sacrificed a "best-case" solution for a "good enough" one.',
        'Accommodating': 'You are driven by a powerful desire for social harmony and a deep sense of responsibility for the emotional well-being of others. Accommodation is natural for you because you prioritize peace and relationships over winning. You often yield to others\' needs to keep the group dynamic positive and inclusive. While this makes you a caring leader and mediator, it can also leave you feeling unheard or resentful if your own needs and convictions are consistently overlooked.',
        'Avoidance': 'You are driven by a deep desire for social harmony and a need to guide and support others. Avoidance is a common style for you because you see conflict as emotionally disruptive to group harmony. You may postpone, sidestep, or ignore issues in hopes they resolve themselves, preserving a positive atmosphere. While this may protect harmony temporarily, it can allow underlying issues to fester, potentially harming relationships you value.',
      },
      'ESFJ': {
        'Competing': 'You are driven by a deep desire for social harmony and a need to be part of a supportive community. Competing is a rare choice for you, reserved for situations where a profound threat exists to your community or a core value you hold. You do not compete for power or victory alone; you compete to defend what you believe is essential for the well-being of those you care about. When this happens, your usual accommodating nature gives way to fierce, unexpected assertiveness. You fight not to win the debate, but to ensure that a fundamental social or moral order is upheld. This intensity can be exhausting for you and surprising to others who don\'t often see this side of you.',
        'Collaborating': 'You are driven by a deep desire for social harmony and being part of a supportive community. Collaboration is a natural and effective style for you because it allows you to build rapport and ensure everyone feels valued. You see the collaborative process as a way to find "win-win" solutions that strengthen relationships and serve the group. For you, a successful collaboration is not just resolving a problem — it is creating a shared, positive experience that reinforces the bonds you value. However, you can become impatient if the process is too slow or overly focused on abstract details rather than people.',
        'Compromising': 'You are driven by a strong desire to maintain harmony and ensure a positive atmosphere. Compromise comes naturally to you as a practical way to resolve conflict and move forward. You are willing to meet others halfway to prevent prolonged confrontation and preserve peace. For you, compromise is often a means of keeping relationships intact. However, compromising on something deeply important can leave you feeling dissatisfied, as if you gave up something essential for a temporary truce.',
        'Accommodating': 'You are driven by a deep desire for social harmony and the emotional well-being of those around you. Accommodation comes naturally because it supports relationship preservation and group unity. You prioritize ensuring everyone feels good over "winning" an argument. While this makes you a caring, supportive presence, it can also leave you feeling unheard or taken advantage of if your needs are continually overlooked.',
        'Avoidance': 'You are driven by a deep desire for social harmony and belonging. Avoidance is a common style for you because you perceive conflict as a threat to unity and emotional well-being. You may sidestep issues to preserve a positive atmosphere, postponing or ignoring disagreements in hopes they resolve themselves. While this can protect harmony in the short term, it often allows unresolved issues to grow beneath the surface, potentially harming relationships over time.',
      },
      'ESTJ': {
        'Competing': 'You are driven by a need for order, efficiency, and a clear chain of command. You see conflict as a matter of right and wrong, and competing comes naturally because it allows you to ensure the most logical, rule-based, or efficient solution prevails. You are practical, decisive, and assertive, using facts, procedures, and authority to support your position. For you, winning is not about ego but about ensuring systems and projects work correctly. However, this approach can sometimes come across as rigid or insensitive to emotional needs.',
        'Collaborating': 'You are driven by a need for order, efficiency, and a clear chain of command. Collaboration appeals to you when it delivers clear, tangible benefits, because it is a results-oriented approach. You see collaboration as an efficient way to gather diverse perspectives and create superior "win-win" solutions that ensure projects are done right. For you, a successful collaboration means pooling resources and talent to achieve the best outcome. However, you can become impatient with abstract or overly emotional discussions and prefer clear, actionable plans.',
        'Compromising': 'You are driven by a need for order, efficiency, and clarity. You tend to view compromise as pragmatic but often less than ideal. Your goal is to find the most efficient, logical solution—not merely a "good enough" one. You may compromise when you calculate that continued conflict would cost more in time, energy, and resources than the benefit of winning. This can leave you feeling dissatisfied if the outcome deviates from what you know is optimal.',
        'Accommodating': 'You rarely accommodate out of a desire for emotional harmony. Instead, you do so for pragmatic and logical reasons, such as calculating that a conflict isn\'t worth the time or energy, lacking the authority or data to win, or wishing to move on to a more important task. This is a strategic choice rather than an emotional one. While it can be efficient, it may leave you feeling dissatisfied or resentful if you believe a better solution was possible.',
        'Avoidance': 'You are driven by a need for order, efficiency, and clarity. Avoidance is unusual for you and occurs only as a pragmatic calculation. You may avoid conflict if you perceive it as a waste of time, if emotions override logic, or if there is no clear, efficient path forward. You avoid not out of discomfort but as a strategic decision to conserve resources. While this can be efficient, it may frustrate others who feel ignored.',
      },
      'ENTP': {
        'Competing': 'You are primarily driven by a need for intellectual stimulation and logical challenge. Competing comes naturally to you because you see conflict as an engaging intellectual puzzle rather than a personal battle. You enjoy spirited debates and use logic, creativity, and knowledge to prove your point. For you, a conflict is an opportunity to test ideas and find the most efficient solution. However, your detached, blunt style may sometimes feel aggressive or dismissive to others, as you may value intellectual victory over emotional needs.',
        'Collaborating': 'You are driven by intellectual stimulation and creative problem-solving. Collaboration appeals to you because it allows you to combine perspectives to find innovative "win-win" solutions. You thrive on intellectual friction and enjoy the shared victory of creating something superior. For you, collaboration is a logical process of exploration. However, you can become impatient if the process lacks structure, moves too slowly, or is bogged down in emotion rather than logic.',
        'Compromising': 'You are driven by a need for intellectual stimulation and optimal solutions. You tend to see compromise as a flawed and inefficient process because you aim for the best, not "good enough." You may agree to compromise when you calculate that the cost of continued debate outweighs the value of pursuing a perfect solution. This can leave you feeling dissatisfied if the result feels intellectually incomplete.',
        'Accommodating': 'You are driven by intellectual curiosity and a need for efficiency. Accommodation is rare for you and is chosen only for pragmatic reasons. You may accommodate if a conflict lacks intellectual stimulation, if you lack the data to win, or if yielding allows you to move to a more worthwhile challenge. This decision is strategic rather than emotional, and while it can be efficient, it may leave you feeling bored or resentful if a better solution is overlooked.',
        'Avoidance': 'You are driven by intellectual stimulation and logical challenge. Avoidance is rare for you and occurs only when you deem a conflict to be a waste of time or lacking enough logical substance to engage with. You avoid not out of fear, but as a calculated decision to conserve mental energy. You might also delegate the issue if you believe it\'s better handled by someone else. While efficient, avoidance can frustrate others if they feel ignored or dismissed.',
      },
      'ENFP': {
        'Competing': 'You are known for your boundless enthusiasm and deep-seated values. Competing is rare and situational for you. You don\'t compete for power or winning\'s sake. Instead, a competitive stance usually emerges when your core values or deeply held principles are challenged. When someone you care about or a cause you believe in is threatened, your easygoing nature can give way to passionate, forceful defense. You fight not to "win" but to ensure a fundamental truth is upheld. This intensity can be emotionally exhausting for you and surprising to others.',
        'Collaborating': 'You are known for your boundless enthusiasm and your drive for harmony and authenticity. Collaboration comes naturally to you because it allows you to find creative, values-driven solutions that strengthen relationships. You are empathetic and skilled at ensuring everyone feels heard. For you, successful collaboration is not just about resolving a conflict—it\'s a shared, positive experience that reinforces connection. However, you may become impatient if the process is overly slow, bogged down in details, or lacks clear momentum.',
        'Compromising': 'You are known for your enthusiasm and your deep desire for social harmony. Compromising comes naturally because it allows you to diffuse tension and keep the group moving forward. You willingly meet others halfway, but if compromise touches a core value, it can leave you feeling dissatisfied—as if you have betrayed yourself for the sake of peace.',
        'Accommodating': 'You are known for your enthusiasm and strong drive for harmony. Accommodation is a natural preference for you because you value positive relationships and emotional well-being over "winning." You willingly yield to others\' needs to maintain peace, but this can leave your own needs unmet and build resentment if done habitually.',
        'Avoidance': 'You are known for your boundless enthusiasm and your drive for harmony. Avoidance is a common choice for you because conflict feels emotionally draining and disrupts positive interaction. You sidestep or postpone issues in the hope they will resolve, protecting harmony in the short term. However, unresolved issues can quietly undermine relationships over time.',
      },
      'ESFP': {
        'Competing': 'You are driven by a love of spontaneity, social interaction, and living in the moment. Competing is a rare and situational style for you. You don\'t compete for the sake of power, but when your core values—especially about the well-being of others or deeply held beliefs—are challenged, you respond with fierce, passionate assertiveness. This is driven by a desire to defend what you believe is right, not by a need to win. While powerful, this response can surprise others and leave you emotionally drained.',
        'Collaborating': 'You are driven by a deep desire for social connection and a lively, harmonious environment. Collaboration appeals to you because it allows you to work toward a "win-win" solution while strengthening relationships. You excel at reading emotional cues and using empathy to make others feel heard. For you, collaboration is most rewarding when it feels like a shared, positive experience. However, extended or emotionally intense discussions can drain you, as they conflict with your preference for action and spontaneity.',
        'Compromising': 'You are driven by a strong desire for social harmony and a positive atmosphere. Compromising is a natural style for you, as it allows conflicts to be resolved quickly so you can return to enjoyable interactions. You willingly give up something to diffuse tension, but this can sometimes leave you feeling dissatisfied if a core value is sacrificed for the sake of peace.',
        'Accommodating': 'You are naturally inclined toward accommodation, as maintaining harmony is a core value. You often yield to others\' needs to keep the peace and avoid conflict. This makes you an excellent friend and team member, but it also risks leaving your own needs unmet. When accommodating, your choice is usually driven by empathy and a desire for positive relationships rather than obligation.',
        'Avoidance': 'You are driven by a love of social engagement and a positive, fun atmosphere. Avoidance is a common style for you because conflict feels like an unnecessary disruption to harmony. You avoid it not out of fear, but because it is emotionally draining and contrary to your values. While this can preserve peace in the short term, it may leave issues unresolved, ultimately affecting the harmony you seek.',
      },
      'ESTP': {
        'Competing': 'You are driven by a need for immediate action and a competitive spirit, which makes competing a natural choice for you. You approach conflict as a challenge to be won and prefer to present your solution directly and decisively. You rely on facts and logic, believing the fastest way to resolve conflict is to implement your solution. This style is highly effective in high-stakes, time-sensitive situations but can be perceived as aggressive or insensitive.',
        'Collaborating': 'You are naturally inclined to collaborate when there is a tangible benefit to the process. Collaboration appeals to your practical nature because it delivers efficient results. You treat conflict as a project to be solved, valuing the pooling of resources and perspectives to find the best solution quickly. However, you may grow impatient with abstract or overly emotional discussions, preferring concrete steps and measurable outcomes.',
        'Compromising': 'You see compromise as a practical solution, even if it is not your preferred one. You will compromise when the cost of continued conflict outweighs the benefits of winning. For you, compromise is about speed and practicality, not perfection. While efficient, it can leave you intellectually dissatisfied if the solution is suboptimal.',
        'Accommodating': 'You rarely accommodate unless there is a clear practical advantage. When you do, it is a strategic decision—either because the issue isn\'t worth your time or you lack enough data or authority to win. Accommodation for you is a calculated retreat rather than an emotional choice. While efficient for low-stakes issues, it can leave you feeling frustrated if it compromises your standards.',
        'Avoidance': 'You generally avoid conflict only when it feels like an inefficient use of time or when the situation is too entangled in emotion or bureaucracy to resolve logically. Avoidance is a calculated choice for you, not fear-based. You might delegate the issue rather than engage directly, preserving your focus for tasks that matter most. While efficient, avoidance risks leaving issues unresolved and relationships strained.',
      },
      'INTP': {
        'Competing': 'Your problem-solving is driven by a desire for logical consistency and objective truth. Competing is rare for you unless you believe you have the most logically sound solution. You defend your position with facts and data, seeing any opposition as an obstacle to the correct outcome. This style is not about winning for its own sake but about defending what you see as intellectually valid. While powerful, competing can feel cold or overly aggressive to others and is emotionally exhausting for you.',
        'Collaborating': 'You naturally gravitate toward the collaborating style because it aligns with your desire for objective truth and optimal solutions. Collaboration is an intellectual exercise for you, an opportunity to combine multiple perspectives into a stronger, more complete solution. You approach conflict as a puzzle to solve rather than a personal struggle. This makes you a valuable partner in finding creative, fact-based resolutions. However, collaboration can be draining if emotional aspects are too intense or if others are unfocused.',
        'Compromising': 'You view compromise as a practical, sometimes necessary tool—though not your preferred one. You aim for the single most logical solution, and giving up part of it can feel like an intellectual loss. You may compromise when the cost of continuing conflict outweighs the benefit of winning. While this can be efficient, it can leave you feeling dissatisfied if the best possible outcome is sacrificed.',
        'Accommodating': 'Accommodating is unusual for you and typically occurs as a deliberate choice rather than a preference. You may accommodate when you see little value in continuing a dispute, when your own data is incomplete, or when stakes are low. This can preserve energy for more important conflicts, but may leave you feeling intellectually unsatisfied. You see accommodating not as surrender but as a pragmatic retreat.',
        'Avoidance': 'Avoidance is your most natural style because you value efficiency and logical clarity. You will withdraw from a conflict when it doesn\'t merit your time or when you see no rational way to "win." For you, conflict can feel like an unnecessary diversion from more important problems. While this preserves your energy, it can leave others feeling unheard and unresolved issues lingering.',
      },
      'INFP': {
        'Competing': 'Your problem-solving is driven by deeply held values and a desire for authenticity. Competing is rare for you, as you naturally avoid confrontation. You only adopt a competing style when a core belief or the well-being of someone you care about is at stake. This is not about "winning" in the usual sense, but about defending what matters to you. While powerful, competing can be emotionally draining and is often unsustainable.',
        'Collaborating': 'Your collaborating style aligns strongly with your desire for harmony and authenticity. It allows you to work toward win-win solutions that respect your values and those of others. You bring empathy and creativity to the process, striving to strengthen relationships while resolving conflict. However, collaboration can be emotionally taxing, and you may need to manage your energy carefully to avoid burnout.',
        'Compromising': 'Your compromising style reflects your desire for peace and willingness to meet others halfway. You use this style to maintain harmony without giving up everything that matters to you. However, compromising can leave you feeling inauthentic if it requires sacrificing core values. You view it as a temporary solution that keeps relationships moving forward, though it can cause internal dissatisfaction if not managed well.',
        'Accommodating': 'Your accommodating style reflects your deep desire to preserve peace and connection. You willingly yield your needs to prevent conflict, viewing this as a selfless act. This makes you a natural peacemaker, but it can also leave you feeling unheard or resentful over time. Your accommodating nature can strengthen relationships, but only when it is balanced with your own voice and needs.',
        'Avoidance': 'Avoidance is your most common style, as you naturally seek harmony and avoid emotionally draining confrontation. You may sidestep conflict to protect your emotional safety or preserve peace. While this can be effective short-term, it risks leaving issues unresolved and creating long-term resentment if your needs go unexpressed.',
      },
      'ISFP': {
        'Competing': 'Your problem-solving is guided by inner harmony, making competing a rare approach for you. You tend to avoid direct conflict, unless a core personal value is violated or you need to fiercely advocate for someone you care about. Competing in these cases is emotionally draining and goes against your natural preference for peace.',
        'Collaborating': 'Your collaborating style allows you to combine your empathy and value-driven nature with a structured process for solving conflict. Collaboration lets you work toward a win-win solution that preserves harmony while respecting your own values. You use your creativity to generate solutions, but deep collaboration can feel emotionally intense. You may need to manage your energy carefully when engaging in this style to avoid feeling overwhelmed.',
        'Compromising': 'Your compromising style reflects your desire to maintain harmony while finding a practical resolution. You are willing to meet others halfway to keep peace, but compromising can feel unsatisfying if it requires sacrificing core values. You view compromise as a temporary solution that allows the relationship to continue, though it\'s important to guard against feeling inauthentic or resentful.',
        'Accommodating': 'Your accommodating style is deeply rooted in your desire to maintain peace and harmony. You willingly yield your own needs to avoid conflict, seeing it as a selfless act that preserves relationships. This approach makes you a natural peacemaker, but it can also lead to feeling unheard or resentful if done excessively.',
        'Avoidance': 'You naturally avoid conflict to preserve harmony, making avoidance your most common style. You may withdraw when a situation feels emotionally overwhelming or when expressing your feelings seems difficult. Avoidance gives short-term relief but may leave needs unmet and cause resentment over time.',
      },
      'ISTP': {
        'Competing': 'Your problem-solving is rooted in logic, efficiency, and a hands-on approach. For you, conflict is a problem to solve, and competing is the most direct route. You use analytical skills to identify the most logical solution and argue for it forcefully — not from aggression, but from conviction that your solution is the most effective. You see opposition as an obstacle to efficiency and rely on logic and facts to win and move forward.',
        'Collaborating': 'Your collaborating style is a powerful extension of your logical, efficient, and hands-on problem-solving approach. You aim to create win-win solutions by synthesizing perspectives into a structured plan. You use analytical skills to understand all sides, not from emotion but from the belief that the most holistic solution is the most effective long-term. For you, collaboration is a highly efficient way to resolve complex problems and align everyone toward a solution.',
        'Compromising': 'Your compromising style reflects a pragmatic, tactical approach. You aim for the most efficient solution but recognize that compromise is often the fastest way to resolve an issue and keep moving. You analyze what is essential to your objective and strategically concede on non-critical points to reach resolution. For you, compromise is a calculated strategy to avoid prolonged, unresolved conflict.',
        'Accommodating': 'Your accommodating style is a deliberate, pragmatic choice rooted in logic and efficiency. You set aside your own needs to preserve a productive and harmonious environment. For you, accommodating is a systematic strategy to maintain control and avoid messy conflict. It is a calculated decision to sacrifice a short-term win for long-term stability.',
        'Avoidance': 'You prefer direct resolution, but avoidance can be a strategic choice when you see conflict as an inefficient or unnecessary drain on resources. You may walk away when you calculate that engagement isn\'t worth the effort. This can preserve productivity but may leave issues unresolved and others feeling unheard.',
      },
      'INTJ': {
        'Competing': 'Your problem-solving is rooted in logic, strategy, and a desire to efficiently achieve goals. For you, conflict is a problem to solve, and competing is the most direct approach. You use analytical skills to identify the most rational solution and argue for it forcefully — not out of aggression, but from conviction that your solution is best. You see opposition as an obstacle to efficiency and rely on logic and facts to win and move forward.',
        'Collaborating': 'Your collaborating style fits your strategic, logical nature. You aim to create win-win solutions by synthesizing different viewpoints into a structured plan. You use your analytical skills to understand all sides, not from emotion but from the belief that the most holistic solution is the most effective long-term. Collaboration for you is an efficient way to resolve complex problems and gain alignment.',
        'Compromising': 'Your compromising style shows a pragmatic, tactical side. While you aim for the most efficient solution, you understand compromise is sometimes the fastest path forward. You analyze what is essential to your goal and concede on non-critical points to resolve conflicts efficiently. For you, compromise is a calculated strategy to avoid prolonged disagreement and maintain progress.',
        'Accommodating': 'Your accommodating style is rooted in logic and strategy. You set aside your own needs when doing so preserves order and avoids unnecessary conflict. This is not an emotional choice but a strategic one — giving in for long-term stability. For you, accommodating is a calculated way to maintain control and harmony in the environment.',
        'Avoidance': 'You generally prefer to address conflict directly, but avoidance is a tool you use strategically to maintain control and efficiency. Avoidance may occur when you perceive conflict as an emotional distraction or when timing is critical. While this can preserve productivity, unresolved issues may build resentment.',
      },
      'INFJ': {
        'Competing': 'Your problem-solving is driven by deep empathy and a desire to create harmony, while your competing style focuses on winning. This is rarely about personal gain. You engage in competition when a core value or ethical principle is being violated. Your intuition about people\'s motivations drives you to argue for what you believe is right, not just for yourself but for the greater good. For you, competition is about principles, not personalities, and your conviction can make you assertive and steadfast.',
        'Collaborating': 'Your collaborating style matches your intuitive and empathetic nature. You seek win-win solutions that meet everyone\'s needs. You use deep insight to understand motivations and synthesize perspectives into holistic solutions. For you, collaboration builds harmony and strengthens relationships.',
        'Compromising': 'Your compromising style reveals a pragmatic side to your intuitive nature. You aim for harmony but understand that a perfect solution is not always possible. You use your intuition to assess what each party can give up and propose balanced compromises to restore peace. You see compromise as a way to protect relationships and move forward even when no one gets everything they want.',
        'Accommodating': 'Your accommodating style reflects your deep desire for harmony and attention to others\' emotional needs. You view yielding as a conscious choice to preserve peace and avoid conflict. You set aside your needs when necessary to ensure the group\'s well-being. This is a deliberate, empathetic strategy, not a lack of conviction.',
        'Avoidance': 'You are not usually prone to avoidance. You prefer to address conflict to restore harmony, using your intuition and empathy. However, you may withdraw temporarily when overwhelmed or when you feel misunderstood. For you, avoidance is a short-term tactic, not a default strategy.',
      },
      'ISFJ': {
        'Competing': 'Your problem-solving is centered on harmony and meeting others\' needs, yet your competing style focuses on winning. This usually stems from a deeply held value or principle. When you compete, it is not about power, but a conviction that a key value or rule is being violated. This is rare for you, as you normally avoid conflict, but your commitment to what is right can override your need for harmony. For you, competition is about defending a principle, not making it personal.',
        'Collaborating': 'Your collaborating style aligns well with your natural approach to problem-solving. You prioritize harmony and meeting needs, using empathy to understand everyone\'s perspective. You apply structure and organization to create win-win solutions that resolve issues and strengthen relationships.',
        'Compromising': 'Your compromising style fits naturally with your desire for harmony. You see conflict as a disruption to balance, and compromise allows you to restore peace efficiently. You willingly give up some needs to reach a middle ground, protecting relationships even when no one gets exactly what they want.',
        'Accommodating': 'Your accommodating style reflects your natural drive for harmony and meeting others\' needs. You see yielding as a way to preserve relationships and avoid conflict. For you, accommodation is a deliberate choice to prioritize group harmony over your own needs, ensuring peace and stability.',
        'Avoidance': 'You generally address conflict directly to restore peace, rather than avoid it. Avoidance is not your default style but may be used when conflict feels emotionally overwhelming or when you want to prevent hurting feelings. For you, avoidance is a temporary tactic to manage such situations.',
      },
      'ISTJ': {
        'Competing': 'For an ISTJ with a Competing conflict style, your methodical nature aligns with your approach to winning. You view conflict as a problem to solve efficiently using facts and principles, not as an emotional clash. You believe your evidence-based method is the best way to resolve issues. The "competing" approach comes from confidence in your solution, not personal aggression.',
        'Collaborating': 'Your natural methodical approach supports collaboration. You apply structured thinking to consider all sides, aiming for solutions that meet everyone\'s needs. You believe a holistic, well-structured solution is the most effective path to lasting resolution.',
        'Compromising': 'With a compromising style, you negotiate with logic and preparation. You are willing to step away from your ideal solution to find a balanced middle ground. You approach compromise pragmatically, aiming for progress rather than perfection.',
        'Accommodating': 'Your accommodating style shows willingness to yield to maintain harmony. You set aside personal principles when needed, seeing this as a practical way to avoid drawn-out conflicts. You value stability and view accommodation as a strategy to preserve it.',
        'Avoidance': 'You favor order and logic, addressing conflicts directly. You may avoid conflict only in specific situations — unclear procedures, emotional intensity, or trivial issues. For you, avoidance is a temporary tactic.',
      },
    };

    return leadershipMap[mbti]?.[normalizedArise] || null;
  };

  // Helper function to get Self-Awareness description based on 360 results
  const getSelfAwarenessDescription = async (assessmentId: number): Promise<string | null> => {
    try {
      const result = await getAssessmentResults(assessmentId);
      const scores = result.scores as any;
      const comparisonData = result.comparison_data as any;

      console.log('[Self-Awareness] Loading 360 results:', {
        hasCapabilityScores: !!scores.capability_scores,
        capabilityScoresType: typeof scores.capability_scores,
        isArray: Array.isArray(scores.capability_scores),
        hasComparisonData: !!comparisonData,
      });

      // Helper to check if value is PillarScore
      const isPillarScore = (value: any): boolean => {
        return typeof value === 'object' && value !== null && 'score' in value;
      };

      // Check if we have capability_scores
      if (scores.capability_scores) {
        let capabilityScores: any[] = [];
        
        // If it's already an array with gaps, use it directly
        if (Array.isArray(scores.capability_scores)) {
          capabilityScores = scores.capability_scores;
        } else if (typeof scores.capability_scores === 'object') {
          // Calculate others_avg_score from comparison_data
          let othersAvgScores: Record<string, number> = {};
          
          // First, try to get from comparison_data
          if (comparisonData && typeof comparisonData === 'object') {
            if (comparisonData.capability_scores && typeof comparisonData.capability_scores === 'object') {
              Object.entries(comparisonData.capability_scores).forEach(([capability, score]) => {
                const rawScoreValue = isPillarScore(score) ? (score as any).score : (typeof score === 'number' ? score : 0);
                const averageScore = rawScoreValue / 5;
                othersAvgScores[capability] = averageScore;
              });
            }
          }
          
          // Transform object to array and calculate gaps
          capabilityScores = Object.entries(scores.capability_scores).map(([capability, score]) => {
            const rawScoreValue = isPillarScore(score) ? (score as any).score : (typeof score === 'number' ? score : 0);
            // Convert sum (max 25) to average (max 5.0) by dividing by 5
            const averageScore = rawScoreValue / 5;
            
            // Get others_avg_score from comparison_data
            const othersAvgScore = othersAvgScores[capability] || 0;
            
            // Calculate gap (self_score - others_avg_score)
            const gap = averageScore - othersAvgScore;
            
            return {
              capability,
              self_score: averageScore,
              others_avg_score: othersAvgScore,
              gap: gap,
            };
          });
        }
        
        console.log('[Self-Awareness] Capability scores:', capabilityScores.length, capabilityScores.map(c => ({ capability: c.capability, gap: c.gap })));
        
        // Count red gaps (gap < -0.5 or gap > 0.5)
        const redGapCount = capabilityScores.filter((cap: any) => {
          const gap = cap.gap || 0;
          const roundedGap = Math.round(gap * 10) / 10;
          return !(roundedGap >= -0.5 && roundedGap <= 0.5);
        }).length;

        console.log('[Self-Awareness] Red gap count:', redGapCount, 'out of', capabilityScores.length);

        // Determine color based on red gap count
        if (redGapCount <= 2) {
          // Green
          return 'Continue leveraging strengths, use feedback as reinforcement for ongoing growth.';
        } else if (redGapCount <= 4) {
          // Yellow
          return 'Focus on areas of gap, engage in feedback discussions, and seek specific examples to calibrate perceptions.';
        } else {
          // Red
          return 'Deepen self-reflection, actively seek feedback, and explore perception differences to strengthen impact and alignment.';
        }
      } else {
        console.warn('[Self-Awareness] No capability_scores found in results');
      }
    } catch (err) {
      console.error('[Self-Awareness] Could not load 360 results for self-awareness:', err);
    }
    return null;
  };

  // Load executive summary data
  const loadExecutiveSummary = async (assessments: AssessmentDisplay[], apiAssessments?: ApiAssessment[]) => {
    try {
      console.log('[Executive Summary] Loading summary for assessments:', assessments.map(a => ({ type: a.type, hasDetailedResult: !!a.detailedResult })));
      
      // Find MBTI and TKI assessments - try with detailedResult first, otherwise try to load
      let mbtiAssessment = assessments.find(a => a.type === 'MBTI' && a.detailedResult);
      let tkiAssessment = assessments.find(a => a.type === 'TKI' && a.detailedResult);
      let threeSixtyAssessment = assessments.find(a => a.type === 'THREE_SIXTY_SELF' && a.detailedResult);

      // If not found with detailedResult, try to find and load them
      if (!mbtiAssessment) {
        const mbti = assessments.find(a => a.type === 'MBTI');
        if (mbti) {
          try {
            const result = await getAssessmentResults(mbti.id);
            mbtiAssessment = { ...mbti, detailedResult: result };
          } catch (err) {
            console.warn('[Executive Summary] Could not load MBTI results:', err);
          }
        }
      }

      if (!tkiAssessment) {
        const tki = assessments.find(a => a.type === 'TKI');
        if (tki) {
          try {
            const result = await getAssessmentResults(tki.id);
            tkiAssessment = { ...tki, detailedResult: result };
          } catch (err) {
            console.warn('[Executive Summary] Could not load TKI results:', err);
          }
        }
      }

      if (!threeSixtyAssessment) {
        const threeSixty = assessments.find(a => a.type === 'THREE_SIXTY_SELF');
        if (threeSixty) {
          try {
            const result = await getAssessmentResults(threeSixty.id);
            threeSixtyAssessment = { ...threeSixty, detailedResult: result };
          } catch (err) {
            console.warn('[Executive Summary] Could not load 360 results:', err);
          }
        }
      }

      let leadershipDescription: string | null = null;
      let selfAwarenessDescription: string | null = null;

      // Get Leadership description from MBTI + ARISE
      let mbtiType: string | null = null;
      let ariseMode: string | null = null;

      // Try to get MBTI type from detailedResult
      if (mbtiAssessment?.detailedResult?.scores?.mbti_type) {
        const rawMbtiType = mbtiAssessment.detailedResult.scores.mbti_type;
        // Extract only the 4 letters (remove -T, -A, or any suffix)
        mbtiType = rawMbtiType.substring(0, 4).toUpperCase();
      } else if (apiAssessments) {
        // Fallback to score_summary
        const mbtiApi = apiAssessments.find(a => a.assessment_type === 'MBTI');
        if (mbtiApi?.score_summary?.profile) {
          const rawMbtiType = mbtiApi.score_summary.profile;
          // Extract only the 4 letters (remove -T, -A, or any suffix)
          mbtiType = rawMbtiType.substring(0, 4).toUpperCase();
        }
      }

      // Try to get ARISE mode from detailedResult
      if (tkiAssessment?.detailedResult) {
        const tkiScores = tkiAssessment.detailedResult.scores as any;
        
        if (tkiScores.mode_scores) {
          const modeEntries = Object.entries(tkiScores.mode_scores);
          if (modeEntries.length > 0) {
            const sorted = modeEntries.sort(([, a], [, b]) => (b as number) - (a as number));
            ariseMode = sorted[0]?.[0] as string || null;
          }
        } else if (tkiScores.mode_counts) {
          const modeEntries = Object.entries(tkiScores.mode_counts);
          if (modeEntries.length > 0) {
            const sorted = modeEntries.sort(([, a], [, b]) => (b as number) - (a as number));
            ariseMode = sorted[0]?.[0] as string || null;
          }
        } else if (tkiScores.dominant_mode) {
          ariseMode = tkiScores.dominant_mode;
        }
      } else if (apiAssessments) {
        // Fallback to score_summary
        const tkiApi = apiAssessments.find(a => a.assessment_type === 'TKI');
        if (tkiApi?.score_summary?.dominant_mode) {
          ariseMode = tkiApi.score_summary.dominant_mode;
        }
      }

      console.log('[Executive Summary] MBTI type:', mbtiType, 'ARISE mode:', ariseMode);

      if (mbtiType && ariseMode) {
        leadershipDescription = getLeadershipDescription(mbtiType, ariseMode);
        console.log('[Executive Summary] Leadership description found:', !!leadershipDescription, 'Length:', leadershipDescription?.length || 0);
        if (!leadershipDescription) {
          console.warn('[Executive Summary] No description found for combination:', { mbtiType, ariseMode });
        }
      } else {
        console.warn('[Executive Summary] Missing MBTI type or ARISE mode:', { mbtiType, ariseMode });
      }

      // Get Self-Awareness description from 360 results
      if (threeSixtyAssessment) {
        selfAwarenessDescription = await getSelfAwarenessDescription(threeSixtyAssessment.id);
        console.log('[Executive Summary] Self-awareness description found:', !!selfAwarenessDescription);
      }

      console.log('[Executive Summary] Final summary:', {
        hasLeadership: !!leadershipDescription,
        hasSelfAwareness: !!selfAwarenessDescription
      });

      setExecutiveSummary({
        leadershipDescription,
        selfAwarenessDescription,
      });
    } catch (err) {
      console.error('[Executive Summary] Failed to load executive summary:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 text-left">
              {t('header.title')} <span style={{ color: '#D8B868' }}>{t('header.titleHighlight')}</span>
            </h1>
            <p className="text-white text-left">
              {t('header.description')}
            </p>
          </div>
          {isSuperAdmin && assessments.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={16} />
              {t('resetButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('deleteModal.title')}
              </h2>
            </div>
            <p className="text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: t('deleteModal.message') }} />
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1 ml-4">
              <li>{t('deleteModal.items.assessments', { count: assessments.length })}</li>
              <li>{t('deleteModal.items.responses')}</li>
              <li>{t('deleteModal.items.results')}</li>
              <li>{t('deleteModal.items.contributors')}</li>
            </ul>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                {t('deleteModal.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAllAssessments}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? t('deleteModal.deleting') : t('deleteModal.confirm')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Single Assessment Confirmation Modal */}
      {showResetAssessmentModal && assessmentToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('resetAssessmentModal.title') || 'Reset Assessment'}
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              {t('resetAssessmentModal.message') || 'This will reset the assessment to its initial state. All your answers and results will be deleted, but the assessment itself will be kept. You can start it again from the assessments page.'}
            </p>
            <p className="text-gray-700 mb-4 font-medium">
              {t('resetAssessmentModal.enterTitle') || 'To confirm, please enter the assessment title:'}
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-2 bg-gray-100 p-2 rounded">
              {assessmentToReset.name}
            </p>
            <input
              type="text"
              value={resetTitleInput}
              onChange={(e) => {
                setResetTitleInput(e.target.value);
                setResetTitleError(null);
              }}
              placeholder={t('resetAssessmentModal.placeholder') || 'Enter assessment title'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
              disabled={isResettingAssessment}
            />
            {resetTitleError && (
              <p className="text-red-600 text-sm mb-4">{resetTitleError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleResetAssessmentCancel}
                disabled={isResettingAssessment}
                className="flex-1"
              >
                {t('resetAssessmentModal.cancel') || 'Cancel'}
              </Button>
              <Button
                variant="arise-primary"
                onClick={handleResetAssessmentConfirm}
                disabled={isResettingAssessment || !resetTitleInput.trim()}
                className="flex-1"
              >
                {isResettingAssessment ? (t('resetAssessmentModal.resetting') || 'Resetting...') : (t('resetAssessmentModal.confirm') || 'Reset')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-1">{t('errors.title')}</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </Card>
      )}

      {/* Wrapper for content with background color block */}
      <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
        {/* Background color block behind all content */}
        <div 
          className="absolute"
          style={{ 
            backgroundColor: '#D5DEE0',
            top: '-20px',
            bottom: 0,
            left: '-7.5%',
            right: '-7.5%',
            zIndex: 0,
            borderRadius: '24px',
            width: 'calc(100% + 4%)',
            margin: 'auto',
          }}
        />
        
        {/* Content sections with relative positioning */}
        <div className="relative z-10 space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center bg-white">
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="text-arise-deep-teal" size={24} />
              </div>
              <p className="text-3xl font-bold text-arise-deep-teal mb-1">{stats.completedAssessments}</p>
              <p className="text-gray-700 text-sm">{t('stats.assessmentsCompleted')}</p>
            </Card>

            <Card className="text-center bg-white">
              <div className="w-12 h-12 bg-arise-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-arise-gold" size={24} />
              </div>
              <p className="text-3xl font-bold text-arise-gold mb-1">{stats.averageScore}%</p>
              <p className="text-gray-700 text-sm">{t('stats.averageScore')}</p>
            </Card>

            <Card className="text-center bg-white">
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="text-primary-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-primary-500 mb-1">{stats.developmentGoals}</p>
              <p className="text-gray-700 text-sm">{t('stats.developmentGoals')}</p>
            </Card>

            <Card className="text-center bg-white relative group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-success-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="text-success-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-success-500 mb-1">{stats.evaluatorsCount}</p>
              <p className="text-gray-700 text-sm mb-3">{t('stats.contributors360')}</p>
              {stats.evaluatorsCount > 0 && (
                <Link href="/dashboard/evaluators">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs flex flex-row items-center gap-2"
                  >
                    <Eye size={14} />
                    {t('stats.viewContributors')}
                  </Button>
                </Link>
              )}
            </Card>
          </div>

          {/* Assessment Results */}
          <Card className="text-white border-0" style={{ backgroundColor: '#10454D' }} padding={false}>
            <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 76, 86, 0.1)' }}>
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('assessments.title')}
                  </h2>
                  <p className="text-white/90">
                    {t('assessments.description')}
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
                {isGeneratingPDF ? t('assessments.generating') : t('assessments.exportAll')}
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
                <p style={{ color: '#FFFFFF' }}>{t('assessments.noAssessments')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div 
                    key={assessment.id}
                    ref={(el) => {
                      if (el) {
                        assessmentRefs.current.set(assessment.id, el);
                      } else {
                        assessmentRefs.current.delete(assessment.id);
                      }
                    }}
                  >
                    <Card className="border border-gray-200 hover:border-arise-deep-teal/30 transition-colors bg-white">
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
                              <span>{t('assessments.completed')} {assessment.completedDate}</span>
                              <span>•</span>
                              <span>{t('assessments.score')} {assessment.score}</span>
                              <span>•</span>
                              <span className="font-semibold text-arise-deep-teal">{assessment.result}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Color indicator for assessments with percentage scores */}
                          {hasScoreColor(assessment) && getScoreColor(assessment.score) && (
                            <div 
                              className="w-10 h-8 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: getScoreColor(assessment.score) || '#E5E7EB' }}
                              title={`Score: ${assessment.score}`}
                            />
                          )}
                          <Button 
                            variant="arise-primary"
                            size="sm"
                            onClick={() => handleViewDetails(assessment)}
                          >
                            {expandedAssessmentIds.has(assessment.id) ? t('assessments.hideDetails') : t('assessments.viewDetails')}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadAssessment(assessment)}
                            title={t('assessments.downloadReport')}
                          >
                            <Download size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResetAssessmentClick(assessment)}
                            title={t('assessments.resetAssessment') || 'Reset Assessment'}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Accordion Content */}
                      <AssessmentResultAccordion
                        assessmentId={assessment.id}
                        assessmentType={assessment.type}
                        isOpen={expandedAssessmentIds.has(assessment.id)}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            )}
            </div>
          </Card>

          {/* Executive Summary Report */}
          {(() => {
            const hasContent = executiveSummary.leadershipDescription || executiveSummary.selfAwarenessDescription;
            console.log('[Executive Summary Render] State:', {
              hasLeadership: !!executiveSummary.leadershipDescription,
              hasSelfAwareness: !!executiveSummary.selfAwarenessDescription,
              hasContent,
              leadershipLength: executiveSummary.leadershipDescription?.length || 0,
              selfAwarenessLength: executiveSummary.selfAwarenessDescription?.length || 0,
            });
            
            if (!hasContent) {
              return null;
            }
            
            return (
              <Card className="bg-white">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white uppercase text-center py-3 px-4 rounded-t-lg" style={{ backgroundColor: '#10454D' }}>
                    {t('executiveSummary.title')}
                  </h2>
                </div>

                <div className="space-y-6">
                {/* PROFESSION Section */}
                {executiveSummary.leadershipDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 uppercase text-center py-2 px-4 rounded-t-lg mb-0" style={{ backgroundColor: '#D5DEE0', color: '#10454D' }}>
                      {t('executiveSummary.profession.title')}
                    </h3>
                    <div className="border border-gray-300 rounded-b-lg p-6 bg-white">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        <span className="font-semibold">Leadership : </span>
                        {executiveSummary.leadershipDescription}
                      </p>
                    </div>
                  </div>
                )}

                {/* LIFESTYLE & WELLNESS Section */}
                {executiveSummary.selfAwarenessDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 uppercase text-center py-2 px-4 rounded-t-lg mb-0" style={{ backgroundColor: '#D5DEE0', color: '#10454D' }}>
                      {t('executiveSummary.lifestyleWellness.title')}
                    </h3>
                    <div className="border border-gray-300 rounded-b-lg p-6 bg-white">
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-semibold">Self-Awareness : </span>
                        {executiveSummary.selfAwarenessDescription}
                      </p>
                    </div>
                  </div>
                )}
                </div>
              </Card>
            );
          })()}

          {/* Ready to accelerate your growth? */}
          <Card 
            className="text-white border-0 overflow-hidden" 
            padding={false}
            style={{ 
              backgroundColor: '#2E2E2E',
              borderRadius: '24px',
              paddingLeft: 'calc(7.5% + 2rem)',
              paddingRight: 'calc(7.5% + 2rem)',
              paddingTop: '2rem',
              paddingBottom: '2rem',
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-3">
                  {t('cta.title')}
                </h2>
                <p className="text-white/90 mb-4 break-words">
                  {t('cta.description')}
                </p>
                <Button 
                  variant="arise-primary"
                  onClick={() => router.push('/dashboard/coaching-options')}
                >
                  {t('cta.button')}
                </Button>
              </div>
              <div className="relative w-48 h-48 flex-shrink-0">
                <Image
                  src="/images/leader-4.jpg"
                  alt={t('cta.imageAlt')}
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
