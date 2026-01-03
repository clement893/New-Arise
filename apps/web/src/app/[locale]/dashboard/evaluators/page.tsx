'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, LoadingSkeleton } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import InviteAdditionalEvaluatorsModal from '@/components/360/InviteAdditionalEvaluatorsModal';
import { ArrowLeft, CheckCircle, Clock, Mail, User, Plus, Trash2, Copy, RefreshCw, Filter } from 'lucide-react';
import { get360Evaluators, EvaluatorStatus, getMyAssessments, remove360Evaluator } from '@/lib/api/assessments';

const ROLE_LABELS: Record<string, string> = {
  PEER: 'Pair / Collègue',
  MANAGER: 'Manager / Supérieur',
  DIRECT_REPORT: 'Rapport direct / Collaborateur',
  STAKEHOLDER: 'Partie prenante / Client',
};

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'invited' | 'pending';

function EvaluatorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [evaluators, setEvaluators] = useState<EvaluatorStatus[]>([]);
  const [filteredEvaluators, setFilteredEvaluators] = useState<EvaluatorStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadEvaluators();
  }, []);

  useEffect(() => {
    filterEvaluators();
  }, [evaluators, statusFilter]);

  const loadEvaluators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Get assessment ID from URL params or find it from assessments
      let id: number | null = searchParams?.get('id') ? parseInt(searchParams.get('id')!) : null;
      
      if (!id) {
        const assessments = await getMyAssessments();
        const feedback360Assessment = assessments.find(
          (a) => a.assessment_type === 'THREE_SIXTY_SELF'
        );
        if (!feedback360Assessment) {
          setError('Aucun assessment de feedback 360° trouvé');
          setIsLoading(false);
          return;
        }
        id = feedback360Assessment.id;
      }

      setAssessmentId(id);
      const response = await get360Evaluators(id);
      setEvaluators(response.evaluators || []);
    } catch (err) {
      console.error('Failed to load evaluators:', err);
      setError(err instanceof Error ? err.message : 'Échec du chargement des évaluateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvaluators = () => {
    if (statusFilter === 'all') {
      setFilteredEvaluators(evaluators);
      return;
    }

    const filtered = evaluators.filter((e) => {
      const statusLower = e.status?.toLowerCase() || '';
      switch (statusFilter) {
        case 'completed':
          return statusLower === 'completed';
        case 'in_progress':
          return statusLower === 'in_progress' || statusLower === 'started';
        case 'invited':
          return statusLower === 'invited';
        case 'pending':
          return statusLower === 'pending' || statusLower === 'not_started';
        default:
          return true;
      }
    });
    setFilteredEvaluators(filtered);
  };

  const handleDelete = async (evaluatorId: number, evaluatorName: string) => {
    if (!assessmentId) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'évaluateur "${evaluatorName}" ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(evaluatorId);
      await remove360Evaluator(assessmentId, evaluatorId);
      setSuccessMessage(`L'évaluateur "${evaluatorName}" a été supprimé avec succès`);
      await loadEvaluators();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to delete evaluator:', err);
      const errorMessage = err instanceof Error ? err.message : 'Échec de la suppression de l\'évaluateur';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const copyInvitationLink = async (token: string) => {
    try {
      const baseUrl = window.location.origin;
      const invitationUrl = `${baseUrl}/360-evaluator/${token}`;
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedToken(token);
      setSuccessMessage('Lien d\'invitation copié dans le presse-papiers');
      setTimeout(() => {
        setCopiedToken(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setError('Échec de la copie du lien');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'completed') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          Terminé
        </div>
      );
    } else if (statusLower === 'in_progress' || statusLower === 'started') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <Clock size={16} />
          En cours
        </div>
      );
    } else if (statusLower === 'invited') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <Mail size={16} />
          Invité
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          <Clock size={16} />
          En attente
        </div>
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTimeElapsed = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return diffMinutes <= 1 ? 'Il y a moins d\'une minute' : `Il y a ${diffMinutes} minutes`;
        }
        return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      }
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton variant="custom" className="h-10 w-64 mb-8" />
        <LoadingSkeleton variant="card" className="h-48 mb-4" />
        <LoadingSkeleton variant="card" className="h-48 mb-4" />
      </div>
    );
  }

  if (error && !evaluators.length) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadEvaluators}>
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const completedCount = evaluators.filter(
    (e) => e.status?.toLowerCase() === 'completed'
  ).length;
  const inProgressCount = evaluators.filter(
    (e) => {
      const status = e.status?.toLowerCase() || '';
      return status === 'in_progress' || status === 'started';
    }
  ).length;
  const invitedCount = evaluators.filter(
    (e) => e.status?.toLowerCase() === 'invited'
  ).length;
  const pendingCount = evaluators.length - completedCount - inProgressCount - invitedCount;

  return (
    <>
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Retour
            </Button>
            <Button
              variant="outline"
              onClick={loadEvaluators}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">Mes </span>
                <span style={{ color: '#D5B667' }}>Évaluateurs</span>
              </h1>
              <p className="text-white text-lg">
                Visualisez et gérez vos évaluateurs de feedback 360°
              </p>
            </div>
            {assessmentId && (
              <Button
                variant="primary"
                variant="arise-primary"
                className="font-semibold"
                onClick={() => setShowEvaluatorModal(true)}
              >
                <Plus size={20} className="mr-2" />
                Ajouter des évaluateurs
              </Button>
            )}
          </div>
        </div>
      </MotionDiv>

      {/* Success/Error Messages */}
      {successMessage && (
        <MotionDiv variant="fade" duration="fast">
          <Card className="mb-4 p-4 bg-green-50 border-green-200">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </Card>
        </MotionDiv>
      )}
      {error && (
        <MotionDiv variant="fade" duration="fast">
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </Card>
        </MotionDiv>
      )}

      {/* Summary Card */}
      <MotionDiv variant="slideUp" delay={100}>
        <Card className="mb-8" style={{ backgroundColor: '#D5DEE0' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {evaluators.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {completedCount}
              </div>
              <div className="text-sm text-gray-600">Terminés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {inProgressCount}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {invitedCount + pendingCount}
              </div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </div>
        </Card>
      </MotionDiv>

      {/* Filters */}
      {evaluators.length > 0 && (
        <MotionDiv variant="slideUp" delay={150}>
          <Card className="mb-6 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'completed', 'in_progress', 'invited', 'pending'] as StatusFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(filter)}
                    className="text-xs"
                  >
                    {filter === 'all' && 'Tous'}
                    {filter === 'completed' && 'Terminés'}
                    {filter === 'in_progress' && 'En cours'}
                    {filter === 'invited' && 'Invités'}
                    {filter === 'pending' && 'En attente'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </MotionDiv>
      )}

      {/* Evaluators List */}
      <MotionDiv variant="slideUp" delay={200}>
        <div className="space-y-4">
          {filteredEvaluators.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {evaluators.length === 0 
                  ? 'Aucun évaluateur trouvé.' 
                  : 'Aucun évaluateur ne correspond au filtre sélectionné.'}
              </p>
              {evaluators.length === 0 && assessmentId && (
                <Button
                  variant="primary"
                  onClick={() => setShowEvaluatorModal(true)}
                >
                  <Plus size={20} className="mr-2" />
                  Ajouter des évaluateurs
                </Button>
              )}
            </Card>
          ) : (
            filteredEvaluators.map((evaluator) => {
              const isCompleted = evaluator.status?.toLowerCase() === 'completed';
              const canDelete = !isCompleted;
              
              return (
                <Card key={evaluator.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e7eeef' }}
                      >
                        <User className="text-arise-deep-teal" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {evaluator.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {evaluator.email}
                        </p>
                        {evaluator.role && (
                          <p className="text-xs text-gray-500 mb-3">
                            Relation: {ROLE_LABELS[evaluator.role] || evaluator.role}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                          {evaluator.invitation_sent_at && (
                            <div>
                              <span className="font-medium">Invité:</span>{' '}
                              {formatDate(evaluator.invitation_sent_at)}
                              {getTimeElapsed(evaluator.invitation_sent_at) && (
                                <span className="text-gray-400 ml-1">
                                  ({getTimeElapsed(evaluator.invitation_sent_at)})
                                </span>
                              )}
                            </div>
                          )}
                          {evaluator.invitation_opened_at && (
                            <div>
                              <span className="font-medium">Ouvert:</span>{' '}
                              {formatDate(evaluator.invitation_opened_at)}
                            </div>
                          )}
                          {evaluator.started_at && (
                            <div>
                              <span className="font-medium">Commencé:</span>{' '}
                              {formatDate(evaluator.started_at)}
                            </div>
                          )}
                          {evaluator.completed_at && (
                            <div>
                              <span className="font-medium">Terminé:</span>{' '}
                              {formatDate(evaluator.completed_at)}
                            </div>
                          )}
                        </div>
                        {evaluator.invitation_token && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyInvitationLink(evaluator.invitation_token)}
                              className="text-xs"
                            >
                              <Copy size={14} className="mr-1" />
                              {copiedToken === evaluator.invitation_token ? 'Copié!' : 'Copier le lien'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(evaluator.status)}
                      {canDelete && assessmentId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(evaluator.id, evaluator.name)}
                          disabled={deletingId === evaluator.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === evaluator.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </MotionDiv>

      {/* Invite Evaluators Modal */}
      {showEvaluatorModal && assessmentId && (
        <InviteAdditionalEvaluatorsModal
          isOpen={showEvaluatorModal}
          onClose={() => setShowEvaluatorModal(false)}
          assessmentId={assessmentId}
          onSuccess={() => {
            setShowEvaluatorModal(false);
            loadEvaluators();
            setSuccessMessage('Les évaluateurs ont été invités avec succès');
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}
    </>
  );
}

export default function EvaluatorsPage() {
  return (
    <ErrorBoundary>
      <EvaluatorsContent />
    </ErrorBoundary>
  );
}
