'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, Container } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { start360Feedback, get360Evaluators, getMyAssessments, type Evaluator360Data, type EvaluatorStatus } from '@/lib/api/assessments';
import { formatError } from '@/lib/utils/formatError';
import { Users, UserPlus, CheckCircle, Plus, Trash2, Copy, Check } from 'lucide-react';
import { Alert } from '@/components/ui';

type EvaluatorRole = 'PEER' | 'MANAGER' | 'DIRECT_REPORT' | 'STAKEHOLDER';

interface EvaluatorForm {
  name: string;
  email: string;
  role: EvaluatorRole;
}

const ROLE_LABELS: Record<EvaluatorRole, string> = {
  PEER: 'Pair / Collègue',
  MANAGER: 'Manager / Supérieur',
  DIRECT_REPORT: 'Rapport direct / Collaborateur',
  STAKEHOLDER: 'Partie prenante / Client',
};

export default function Start360FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  
  const [evaluators, setEvaluators] = useState<EvaluatorForm[]>([
    { name: '', email: '', role: 'PEER' },
  ]);
  const [existingEvaluators, setExistingEvaluators] = useState<EvaluatorStatus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvaluators, setIsLoadingEvaluators] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEvaluatorsCount, setSubmittedEvaluatorsCount] = useState(0);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [resolvedAssessmentId, setResolvedAssessmentId] = useState<number | null>(null);

  // Load existing evaluators - try to find assessment if not in URL
  useEffect(() => {
    const loadEvaluators = async () => {
      let id: number | null = null;
      
      // First, try to use assessmentId from URL
      if (assessmentId) {
        id = parseInt(assessmentId);
      } else {
        // If no assessmentId in URL, try to find existing 360 assessment
        try {
          const assessments = await getMyAssessments();
          const feedback360Assessment = assessments.find(
            (a) => a.assessment_type === 'THREE_SIXTY_SELF'
          );
          if (feedback360Assessment) {
            id = feedback360Assessment.id;
            setResolvedAssessmentId(id);
            // Update URL without navigation
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('assessmentId', id.toString());
            window.history.replaceState({}, '', newUrl.toString());
          }
        } catch (err) {
          console.error('Failed to find existing 360 assessment:', err);
        }
      }
      
      if (id) {
        await loadExistingEvaluators(id);
      }
    };
    
    loadEvaluators();
  }, [assessmentId]);

  const loadExistingEvaluators = async (id?: number) => {
    const evaluatorId = id || parseInt(assessmentId!) || resolvedAssessmentId;
    if (!evaluatorId) return;
    
    try {
      setIsLoadingEvaluators(true);
      const response = await get360Evaluators(evaluatorId);
      setExistingEvaluators(response.evaluators);
    } catch (err: any) {
      console.error('Failed to load evaluators:', err);
      // Don't show error if assessment doesn't exist yet
      setExistingEvaluators([]);
    } finally {
      setIsLoadingEvaluators(false);
    }
  };

  const getEvaluatorLink = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/360-evaluator/${token}`;
  };

  const copyToClipboard = async (text: string, token: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const addEvaluator = () => {
    setEvaluators([...evaluators, { name: '', email: '', role: 'PEER' }]);
  };

  const removeEvaluator = (index: number) => {
    if (evaluators.length > 1) {
      setEvaluators(evaluators.filter((_, i) => i !== index));
    }
  };

  const updateEvaluator = (index: number, field: keyof EvaluatorForm, value: string) => {
    const newEvaluators = [...evaluators];
    const currentEvaluator = newEvaluators[index];
    if (!currentEvaluator) return;
    
    newEvaluators[index] = { 
      name: currentEvaluator.name,
      email: currentEvaluator.email,
      role: currentEvaluator.role,
      [field]: value 
    } as EvaluatorForm;
    setEvaluators(newEvaluators);
  };

  const validateForm = (): boolean => {
    // Allow 0 or more evaluators, but if provided, they must be valid
    if (evaluators.length === 0) {
      return true; // Skip is allowed
    }

    for (let i = 0; i < evaluators.length; i++) {
      const evaluator = evaluators[i];
      if (!evaluator) {
        setError(`L'évaluateur ${i + 1} est invalide`);
        return false;
      }
      if (!evaluator.name.trim()) {
        setError(`Le nom de l'évaluateur ${i + 1} est requis`);
        return false;
      }
      if (!evaluator.email.trim()) {
        setError(`L'email de l'évaluateur ${i + 1} est requis`);
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(evaluator.email)) {
        setError(`L'email de l'évaluateur ${i + 1} n'est pas valide`);
        return false;
      }
    }

    // Check for duplicate emails
    const emails = evaluators.filter((e): e is EvaluatorForm => e !== undefined).map((e) => e.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setError('Les emails des évaluateurs doivent être uniques');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Filter out empty evaluators and map to API format
      const evaluatorsData: Evaluator360Data[] = evaluators
        .filter(e => e.name.trim() && e.email.trim())
        .map((e) => ({
          name: e.name.trim(),
          email: e.email.trim(),
          role: e.role,
        }));

      const response = await start360Feedback(evaluatorsData);

      setSubmittedEvaluatorsCount(evaluatorsData.length);
      setSuccess(true);
      
      // Reload evaluators if we're on an existing assessment
      const idToUse = response.assessment_id || parseInt(assessmentId!) || resolvedAssessmentId;
      if (idToUse) {
        setResolvedAssessmentId(idToUse);
        await loadExistingEvaluators(idToUse);
      }
      
      // Redirect to the 360 feedback assessment page (auto-evaluation) after a short delay
      setTimeout(() => {
        router.push(`/dashboard/assessments/360-feedback?assessmentId=${response.assessment_id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to start 360 feedback:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Une erreur est survenue lors du démarrage de l\'évaluation 360°'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setError(null);
    setSuccess(false);

    try {
      setIsSubmitting(true);

      // Create assessment without evaluators
      const response = await start360Feedback([]);

      setSubmittedEvaluatorsCount(0);
      setSuccess(true);
      
      // Reload evaluators if we're on an existing assessment
      const idToUse = response.assessment_id || parseInt(assessmentId!) || resolvedAssessmentId;
      if (idToUse) {
        setResolvedAssessmentId(idToUse);
        await loadExistingEvaluators(idToUse);
      }
      
      // Redirect to the 360 feedback assessment page (auto-evaluation) after a short delay
      setTimeout(() => {
        router.push(`/dashboard/assessments/360-feedback?assessmentId=${response.assessment_id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to start 360 feedback:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Une erreur est survenue lors du démarrage de l\'évaluation 360°'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container className="py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success-500" />
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              Invitations envoyées !
            </h1>
            <p className="mb-8 text-gray-600">
              {submittedEvaluatorsCount > 0
                ? `Les invitations ont été envoyées ${submittedEvaluatorsCount > 1 ? `aux ${submittedEvaluatorsCount} évaluateurs` : 'à l\'évaluateur'}. Vous pouvez maintenant commencer votre auto-évaluation.`
                : 'Votre évaluation 360° a été créée. Vous pouvez maintenant commencer votre auto-évaluation et ajouter des évaluateurs plus tard si vous le souhaitez.'}
            </p>
            <p className="text-sm text-gray-500">
              Redirection en cours...
            </p>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        title="Démarrer une évaluation 360° Feedback"
        description="Invitez des personnes à évaluer votre leadership (optionnel). Elles recevront un email avec un lien vers le formulaire. Vous pouvez ajouter des évaluateurs plus tard."
      />

      <Container className="py-8">
        <div className="mx-auto max-w-4xl">
          {/* Existing Evaluators Section */}
          {existingEvaluators.length > 0 && (
            <Card className="mb-6 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Évaluateurs ajoutés ({existingEvaluators.length})
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const idToUse = parseInt(assessmentId || '') || resolvedAssessmentId;
                    if (idToUse) {
                      loadExistingEvaluators(idToUse);
                    }
                  }}
                  disabled={isLoadingEvaluators}
                >
                  {isLoadingEvaluators ? 'Chargement...' : 'Actualiser'}
                </Button>
              </div>
              <div className="space-y-3">
                {existingEvaluators.map((evaluator) => {
                  const link = getEvaluatorLink(evaluator.invitation_token);
                  const isCopied = copiedToken === evaluator.invitation_token;
                  const statusColors = {
                    'not_started': 'bg-gray-100 text-gray-700',
                    'in_progress': 'bg-primary-100 text-primary-700',
                    'completed': 'bg-success-100 text-success-700',
                    // Support for uppercase format (backward compatibility)
                    'NOT_STARTED': 'bg-gray-100 text-gray-700',
                    'IN_PROGRESS': 'bg-primary-100 text-primary-700',
                    'COMPLETED': 'bg-success-100 text-success-700',
                  };
                  const statusLabels = {
                    'not_started': 'Invitation envoyée',
                    'in_progress': 'En cours',
                    'completed': 'Terminé',
                    // Support for uppercase format (backward compatibility)
                    'NOT_STARTED': 'Invitation envoyée',
                    'IN_PROGRESS': 'En cours',
                    'COMPLETED': 'Terminé',
                  };
                  
                  return (
                    <div
                      key={evaluator.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {evaluator.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {evaluator.email} • {ROLE_LABELS[evaluator.role as EvaluatorRole]}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[evaluator.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[evaluator.status as keyof typeof statusLabels] || evaluator.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                            <code className="text-xs text-gray-700 dark:text-gray-300">{link}</code>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(link, evaluator.invitation_token)}
                            className="flex items-center gap-2"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-4 w-4 text-success-600" />
                                Copié
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copier
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="mb-6 rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Instructions
                    </h3>
                    <p className="mt-1 text-sm text-blue-800">
                      Invitez des personnes qui vous connaissent bien dans votre contexte professionnel (optionnel). 
                      Choisissez des personnes ayant des relations différentes avec vous (collègue, manager, collaborateur, client, etc.).
                      Vous pouvez ajouter des évaluateurs maintenant ou plus tard depuis votre dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="error" onClose={() => setError(null)}>
                  {typeof error === 'string' ? error : formatError(error || 'An error occurred')}
                </Alert>
              )}

              <div className="space-y-6">
                {evaluators.map((evaluator, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-6"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arise-teal text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Évaluateur {index + 1}
                        </h3>
                      </div>
                      {evaluators.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEvaluator(index)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Supprimer cet évaluateur"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`name-${index}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Nom complet *
                        </label>
                        <Input
                          id={`name-${index}`}
                          type="text"
                          value={evaluator.name}
                          onChange={(e) =>
                            updateEvaluator(index, 'name', e.target.value)
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`email-${index}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Email *
                        </label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={evaluator.email}
                          onChange={(e) =>
                            updateEvaluator(index, 'email', e.target.value)
                          }
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`role-${index}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Relation avec vous *
                      </label>
                      <select
                        id={`role-${index}`}
                        value={evaluator.role}
                        onChange={(e) =>
                          updateEvaluator(
                            index,
                            'role',
                            e.target.value as EvaluatorRole
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-arise-teal focus:outline-none focus:ring-2 focus:ring-arise-teal/20"
                        required
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center border-t border-gray-200 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEvaluator}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un évaluateur
                </Button>
              </div>

              <div className="flex justify-between gap-4 border-t border-gray-200 pt-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/assessments')}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Traitement en cours...</>
                    ) : (
                      <>Passer cette étape</>
                    )}
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-arise-gold hover:bg-arise-gold/90"
                >
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {evaluators.length > 0 && evaluators.some(e => e.name.trim() && e.email.trim())
                        ? 'Envoyer les invitations et commencer'
                        : 'Commencer sans évaluateurs'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </>
  );
}
