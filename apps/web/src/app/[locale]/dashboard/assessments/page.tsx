'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Brain, Target, Users, Heart, Upload, CheckCircle, Lock, type LucideIcon, Loader2 } from 'lucide-react';
import { getMyAssessments, Assessment as ApiAssessment, AssessmentType } from '@/lib/api/assessments';
import { startAssessment } from '@/lib/api/assessments';

interface AssessmentDisplay {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  icon: LucideIcon;
  externalLink?: string;
  requiresEvaluators?: boolean;
  assessmentId?: number; // ID from database
  assessmentType: AssessmentType;
  answerCount?: number;
  totalQuestions?: number;
}

// Mapping of assessment types to display info (using lowercase keys for internal mapping)
const ASSESSMENT_CONFIG: Record<string, { title: string; description: string; icon: LucideIcon; externalLink?: string; requiresEvaluators?: boolean }> = {
  mbti: {
    title: 'MBTI Personality',
    description: 'Understanding your natural preferences',
    icon: Brain,
    externalLink: 'https://www.psychometrics.com/assessments/mbti/',
  },
  tki: {
    title: 'TKI Conflict Style',
    description: 'Explore your conflict management approach',
    icon: Target,
  },
  wellness: {
    title: 'Wellness',
    description: 'Your overall well-being',
    icon: Heart,
  },
  '360_self': {
    title: '360° Feedback',
    description: 'Multi-faceted leadership perspectives',
    icon: Users,
    requiresEvaluators: true,
  },
  '360_evaluator': {
    title: '360° Feedback (Evaluator)',
    description: 'Provide feedback for a colleague',
    icon: Users,
  },
};

function AssessmentsContent() {
  const router = useRouter();
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAssessment, setStartingAssessment] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get assessments from API
      const apiAssessments: ApiAssessment[] = await getMyAssessments();
      
      // Create a map of existing assessments by type
      const existingAssessmentsMap = new Map<AssessmentType, ApiAssessment>();
      apiAssessments.forEach(assessment => {
        const existing = existingAssessmentsMap.get(assessment.assessment_type);
        // Keep the most recent assessment of each type
        if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
          existingAssessmentsMap.set(assessment.assessment_type, assessment);
        }
      });
      
      // Build display assessments list
      const displayAssessments: AssessmentDisplay[] = Object.entries(ASSESSMENT_CONFIG).map(([type, config]) => {
        // Map lowercase type to uppercase for API
        const apiType = type.toUpperCase() as AssessmentType;
        const apiAssessment = existingAssessmentsMap.get(apiType);
        
        let status: 'completed' | 'in-progress' | 'locked' | 'available' = 'available';
        if (apiAssessment) {
          if (apiAssessment.status === 'COMPLETED') {
            status = 'completed';
          } else if (apiAssessment.status === 'IN_PROGRESS' || apiAssessment.status === 'NOT_STARTED') {
            status = 'in-progress';
          }
        }
        
        return {
          id: type,
          title: config.title,
          description: config.description,
          status,
          icon: config.icon,
          externalLink: config.externalLink,
          requiresEvaluators: config.requiresEvaluators,
          assessmentId: apiAssessment?.id,
          assessmentType: apiType,
          answerCount: apiAssessment?.answer_count,
          totalQuestions: apiAssessment?.total_questions,
        };
      });
      
      setAssessments(displayAssessments);
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = async (assessmentType: AssessmentType, assessmentId?: number) => {
    try {
      setStartingAssessment(assessmentType);
      
      if (assessmentId) {
        // Resume existing assessment
        router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}`);
      } else {
        // Start new assessment
        await startAssessment(assessmentType);
        router.push(`/dashboard/assessments/${getAssessmentRoute(assessmentType)}`);
      }
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
    } finally {
      setStartingAssessment(null);
    }
  };

  const getAssessmentRoute = (type: AssessmentType): string => {
    switch (type) {
      case 'TKI':
        return 'tki';
      case 'WELLNESS':
        return 'wellness';
      case 'THREE_SIXTY_SELF':
        return '360-feedback';
      case 'MBTI':
        return 'mbti';
      default:
        // TypeScript exhaustiveness check - this should never happen
        return String(type).toLowerCase();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            Terminé
          </div>
        );
      case 'in-progress':
        return (
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            En cours
          </div>
        );
      case 'locked':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
            <Lock size={16} />
            Verrouillé
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 bg-arise-gold/20 text-arise-gold rounded-full text-sm font-medium">
            Disponible
          </div>
        );
    }
  };

  const getActionButton = (assessment: AssessmentDisplay) => {
    const isStarting = startingAssessment === assessment.assessmentType;
    
    switch (assessment.status) {
      case 'completed':
        if (assessment.externalLink && assessment.assessmentType === 'MBTI') {
          return (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(assessment.externalLink, '_blank')}
            >
              <Upload size={16} />
              Télécharger mon score
            </Button>
          );
        }
        // For other assessments, show "Voir les résultats"
        return (
          <Button 
            variant="outline" 
            onClick={() => {
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${assessment.assessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${assessment.assessmentId}`);
              }
            }}
          >
            Voir les résultats
          </Button>
        );
      case 'in-progress':
        return (
          <Button 
            variant="primary"
            disabled={isStarting}
            onClick={() => {
              if (assessment.requiresEvaluators) {
                setShowEvaluatorModal(true);
              } else {
                router.push(`/dashboard/assessments/${getAssessmentRoute(assessment.assessmentType)}`);
              }
            }}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Continuer'
            )}
          </Button>
        );
      case 'available':
        return (
          <Button 
            variant="primary"
            disabled={isStarting}
            onClick={() => handleStartAssessment(assessment.assessmentType, assessment.assessmentId)}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Commencer'
            )}
          </Button>
        );
      default:
        return (
          <Button variant="secondary" disabled>
            Verrouillé
          </Button>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-arise-deep-teal" />
            <p className="text-gray-600">Chargement des assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={loadAssessments}>
                Réessayer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Background */}
        <div 
          className="fixed inset-0 ml-64 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/dashboard-bg.jpg)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8">
          <MotionDiv variant="fade" duration="normal">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-arise-deep-teal mb-2">
                Vos assessments
              </h1>
              <p className="text-gray-600">
                Suivez et gérez vos assessments de leadership
              </p>
            </div>
          </MotionDiv>

          <MotionDiv variant="slideUp" delay={100}>
            <Stack gap="normal">
              {assessments.map((assessment) => {
                const Icon = assessment.icon;
                return (
                  <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-arise-deep-teal" size={32} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {assessment.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {assessment.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(assessment.status)}
                        {assessment.status === 'in-progress' && assessment.answerCount !== undefined && assessment.totalQuestions !== undefined && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {assessment.answerCount}/{assessment.totalQuestions}
                          </span>
                        )}
                        {assessment.externalLink && assessment.status !== 'completed' && (
                          <span className="px-3 py-1 border border-arise-deep-teal text-arise-deep-teal rounded-full text-xs font-medium">
                            Lien externe
                          </span>
                        )}
                        {getActionButton(assessment)}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* 360 Feedback Evaluators Section */}
              {assessments.find(a => a.assessmentType === 'THREE_SIXTY_SELF') && (
                <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-arise-gold/20 rounded-full flex items-center justify-center">
                        <Users className="text-arise-gold" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Ajoutez vos évaluateurs avant de commencer cet assessment
                        </h3>
                        <p className="text-sm text-gray-600">
                          Invitez des collègues à fournir un feedback 360° sur votre leadership
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="primary"
                      className="bg-arise-gold text-white hover:bg-arise-gold/90"
                      onClick={() => setShowEvaluatorModal(true)}
                    >
                      Ajouter
                    </Button>
                  </div>
                </Card>
              )}
            </Stack>
          </MotionDiv>
        </div>
      </div>

      {/* Evaluator Modal - Placeholder */}
      {showEvaluatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ajouter des évaluateurs
            </h2>
            <p className="text-gray-600 mb-6">
              Cette fonctionnalité vous permettra d'inviter des collègues à évaluer votre leadership.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowEvaluatorModal(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => setShowEvaluatorModal(false)}
              >
                Bientôt disponible
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <ErrorBoundary>
      <AssessmentsContent />
    </ErrorBoundary>
  );
}
