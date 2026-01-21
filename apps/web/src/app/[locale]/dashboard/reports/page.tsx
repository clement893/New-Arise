'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Card, Loading } from '@/components/ui';
import Button from '@/components/ui/Button';
import { FileText, Download, TrendingUp, Target, Users, Brain, Eye } from 'lucide-react';
import Image from 'next/image';
import { getMyAssessments, getAssessmentResults, get360Evaluators, getDevelopmentGoalsCount, deleteAllMyAssessments, deleteAssessment, Assessment as ApiAssessment, AssessmentType, AssessmentResult } from '@/lib/api/assessments';
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
  const t = useTranslations('dashboard.reports');
  const tWellness = useTranslations('dashboard.assessments.wellness.results');
  const locale = useLocale();
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedAssessmentIds, setExpandedAssessmentIds] = useState<Set<number>>(new Set());
  const [showDeleteAssessmentModal, setShowDeleteAssessmentModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<AssessmentDisplay | null>(null);
  const [deleteTitleInput, setDeleteTitleInput] = useState('');
  const [deleteTitleError, setDeleteTitleError] = useState<string | null>(null);
  const [isDeletingAssessment, setIsDeletingAssessment] = useState(false);

  useEffect(() => {
    loadAssessments();
    checkSuperAdminStatus();
  }, []);

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
      
      // Filter only completed assessments (handle both 'COMPLETED' and 'completed' formats, and also check for results)
      const completedAssessments = apiAssessments.filter(
        (a: ApiAssessment) => {
          const status = (a.status || '').toUpperCase();
          // Include if status is completed (in any case), or if it has a score_summary (finalized with results)
          // or if it has completed_at set (indicating it was finalized)
          return status === 'COMPLETED' || !!a.score_summary || !!a.completed_at;
        }
      );

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
        setKeyInsights([]);
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
      const transformedAssessments: AssessmentDisplay[] = await Promise.all(
        sortedAssessments.map(async (assessment: ApiAssessment) => {
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
      
      // Generate key insights from assessments (use all, but prioritize latest for insights)
      const insights = generateKeyInsights(transformedAssessments);
      setKeyInsights(insights);
      
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
      setKeyInsights([]);
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

  const generateKeyInsights = (assessments: AssessmentDisplay[]): KeyInsight[] => {
    const insights: KeyInsight[] = [];
    let insightId = 1;

    // MBTI Insight
    const mbti = assessments.find((a) => a.type === 'MBTI' && a.detailedResult);
    if (mbti && mbti.detailedResult?.scores?.mbti_type) {
      const mbtiType = mbti.detailedResult.scores.mbti_type;
      const description = mbti.detailedResult.insights?.personality_type 
        || t('insights.descriptions.mbtiDefault', { type: mbtiType });
      
      insights.push({
        id: insightId++,
        title: t('insights.titles.leadershipStyle'),
        description,
        category: t('insights.categories.Personality'),
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
          const dominantMode = dominantEntry[0].toLowerCase();
          let modeName: string;
          try {
            modeName = t(`insights.tkiModes.${dominantMode}`);
            if (modeName === `insights.tkiModes.${dominantMode}`) {
              modeName = dominantMode; // Fallback if translation not found
            }
          } catch (e) {
            modeName = dominantMode; // Fallback if translation fails
          }
          
          let description: string;
          if (dominantMode === 'competing') {
            description = t('insights.descriptions.tkiCompeting', { mode: modeName });
          } else if (dominantMode === 'collaborating') {
            description = t('insights.descriptions.tkiCollaborating', { mode: modeName });
          } else {
            description = t('insights.descriptions.tkiOther', { mode: modeName });
          }
          
          insights.push({
            id: insightId++,
            title: t('insights.titles.conflictResolution'),
            description,
            category: t('insights.categories.TKI'),
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
            const strongest = strongestEntry[0].replace(/_/g, ' ');
            
            insights.push({
              id: insightId++,
              title: t('insights.titles.teamPerception'),
              description: t('insights.descriptions.threeSixtyCapabilities', { capability: strongest }),
              category: t('insights.categories.360 Feedback'),
            });
          }
        }
      } else if (scores.percentage) {
        insights.push({
          id: insightId++,
          title: t('insights.titles.teamPerception'),
          description: t('insights.descriptions.threeSixtyScore', { score: Math.round(scores.percentage) }),
          category: t('insights.categories.360 Feedback'),
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
            // Translate pillar names
            const translatePillar = (pillarId: string): string => {
              // Convert underscore format to camelCase (e.g., stress_management -> stressManagement)
              const toCamelCase = (str: string): string => {
                return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
              };
              const pillarKey = toCamelCase(pillarId);
              try {
                // Use the wellness translation hook to access pillars
                const translated = tWellness(`pillars.${pillarKey}`);
                if (translated && translated !== `pillars.${pillarKey}`) {
                  return translated;
                }
              } catch (e) {
                // Fallback - try common pillar names
                const commonPillars: Record<string, string> = {
                  sleep: 'Sleep',
                  nutrition: 'Nutrition',
                  hydration: 'Hydration',
                  movement: 'Movement',
                  stressManagement: 'Stress Management',
                  socialConnection: 'Social Connection',
                  avoidanceOfRiskySubstances: 'Avoidance of Risky Substances',
                };
                if (commonPillars[pillarKey]) {
                  return commonPillars[pillarKey];
                }
              }
              return pillarId.replace(/_/g, ' ');
            };
            
            const strongest = translatePillar(strongestEntry[0]);
            const weakest = translatePillar(weakestEntry[0]);
            
            insights.push({
              id: insightId++,
              title: t('insights.titles.wellnessFocus'),
              description: t('insights.descriptions.wellnessPillars', { score: wellness.score, strongest, weakest }),
              category: t('insights.categories.Wellness'),
            });
          }
        }
      } else if (scores.percentage) {
        insights.push({
          id: insightId++,
          title: t('insights.titles.wellnessFocus'),
          description: t('insights.descriptions.wellnessDefault', { score: wellness.score }),
          category: t('insights.categories.Wellness'),
        });
      }
    }

    // Fill with default insights if we don't have enough
    if (insights.length < 4) {
      const defaultInsights = [
        {
          id: insightId++,
          title: t('insights.titles.continueJourney'),
          description: t('insights.descriptions.continueJourney'),
          category: t('insights.categories.General'),
        },
      ];
      insights.push(...defaultInsights.slice(0, 4 - insights.length));
    }

    return insights.slice(0, 4); // Return max 4 insights
  };

  const getAssessmentName = (type: AssessmentType): string => {
    const names: Record<AssessmentType, string> = {
      MBTI: t('assessments.types.MBTI'),
      TKI: t('assessments.types.TKI'),
      WELLNESS: t('assessments.types.WELLNESS'),
      THREE_SIXTY_SELF: t('assessments.types.THREE_SIXTY_SELF'),
    };
    return names[type] || type;
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
      
      // Generate ZIP with all PDFs
      const zipBlob = await generateAllAssessmentsZip(assessments);
      
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

      // Generate PDF for this assessment
      const pdfBlob = await generateAssessmentPDF(assessment);
      
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

  const handleDeleteAssessmentClick = (assessment: AssessmentDisplay) => {
    setAssessmentToDelete(assessment);
    setDeleteTitleInput('');
    setDeleteTitleError(null);
    setShowDeleteAssessmentModal(true);
  };

  const handleDeleteAssessmentConfirm = async () => {
    if (!assessmentToDelete) return;

    // Validate that the input matches the assessment name exactly
    if (deleteTitleInput.trim() !== assessmentToDelete.name.trim()) {
      setDeleteTitleError(t('errors.titleMismatch'));
      return;
    }

    try {
      setIsDeletingAssessment(true);
      setDeleteTitleError(null);
      
      await deleteAssessment(assessmentToDelete.id);
      
      // Reload assessments after deletion
      await loadAssessments();
      
      setShowDeleteAssessmentModal(false);
      setAssessmentToDelete(null);
      setDeleteTitleInput('');
      alert(t('errors.assessmentDeleted'));
    } catch (err: any) {
      console.error('Failed to delete assessment:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || t('errors.deleteFailed');
      setDeleteTitleError(errorMessage);
    } finally {
      setIsDeletingAssessment(false);
    }
  };

  const handleDeleteAssessmentCancel = () => {
    setShowDeleteAssessmentModal(false);
    setAssessmentToDelete(null);
    setDeleteTitleInput('');
    setDeleteTitleError(null);
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

      {/* Delete Single Assessment Confirmation Modal */}
      {showDeleteAssessmentModal && assessmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('deleteAssessmentModal.title')}
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              {t('deleteAssessmentModal.message')}
            </p>
            <p className="text-gray-700 mb-4 font-medium">
              {t('deleteAssessmentModal.enterTitle')}
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-2 bg-gray-100 p-2 rounded">
              {assessmentToDelete.name}
            </p>
            <input
              type="text"
              value={deleteTitleInput}
              onChange={(e) => {
                setDeleteTitleInput(e.target.value);
                setDeleteTitleError(null);
              }}
              placeholder={t('deleteAssessmentModal.placeholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-2"
              disabled={isDeletingAssessment}
            />
            {deleteTitleError && (
              <p className="text-red-600 text-sm mb-4">{deleteTitleError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDeleteAssessmentCancel}
                disabled={isDeletingAssessment}
                className="flex-1"
              >
                {t('deleteAssessmentModal.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAssessmentConfirm}
                disabled={isDeletingAssessment || !deleteTitleInput.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletingAssessment ? t('deleteAssessmentModal.deleting') : t('deleteAssessmentModal.confirm')}
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
                  <div key={assessment.id}>
                    <Card className="border border-gray-200 hover:border-arise-deep-teal/30 transition-colors bg-white relative">
                      {/* Delete icon in top right corner */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAssessmentClick(assessment)}
                        title={t('assessments.deleteAssessment') || 'Delete Assessment'}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50 p-0"
                      >
                        <Trash2 size={14} />
                      </Button>
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

          {/* Key Insights */}
          <Card className="bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                <Brain className="text-arise-deep-teal" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('insights.title')}
                </h2>
                <p className="text-gray-700">
                  {t('insights.description')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyInsights.length > 0 ? (
                keyInsights.map((insight) => (
                <Card key={insight.id} className="border border-gray-200 bg-gray-50">
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
                <div className="col-span-2 text-center sm:py-8 py-2 text-gray-500">
                  <p>{t('insights.noInsights')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Comprehensive Leadership Profile */}
          <Card className="bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center">
                <Target className="text-arise-deep-teal" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('profile.title')}
                </h2>
                <p className="text-gray-700">
                  {t('profile.description')}
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
                    {t('profile.mbti.title')}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {t('profile.mbti.description')}
                  </p>
                </div>

                {/* TKI Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500/10 rounded flex items-center justify-center">
                      <span className="text-primary-500 font-bold text-sm">T</span>
                    </div>
                    {t('profile.tki.title')}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {t('profile.tki.description')}
                  </p>
                </div>

                {/* 360 Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-success-500/10 rounded flex items-center justify-center">
                      <span className="text-success-500 font-bold text-sm">360</span>
                    </div>
                    {t('profile.threeSixty.title')}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {t('profile.threeSixty.description')}
                  </p>
                </div>

                {/* Wellness Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-arise-gold/10 rounded flex items-center justify-center">
                      <span className="text-arise-gold font-bold text-sm">W</span>
                    </div>
                    {t('profile.wellness.title')}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {t('profile.wellness.description')}
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
                  {isGeneratingPDF ? t('profile.generatingPdf') : t('profile.downloadButton')}
                </Button>
              </div>
            </div>
          </Card>

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
