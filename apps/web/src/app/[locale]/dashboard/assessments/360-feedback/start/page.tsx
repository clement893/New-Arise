'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
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
        setResolvedAssessmentId(id);
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
        setError(`Contributor ${i + 1} is invalid`);
        return false;
      }
      if (!evaluator.name.trim()) {
        setError(`Contributor ${i + 1} name is required`);
        return false;
      }
      if (!evaluator.email.trim()) {
        setError(`Contributor ${i + 1} email is required`);
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(evaluator.email)) {
        setError(`Contributor ${i + 1} email is not valid`);
        return false;
      }
    }

    // Check for duplicate emails
    const emails = evaluators.filter((e): e is EvaluatorForm => e !== undefined).map((e) => e.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setError('Contributor emails must be unique');
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

      // Check if assessment already exists
      let assessmentIdToUse: number | null = null;
      
      // First, try to use existing assessment ID
      if (assessmentId) {
        assessmentIdToUse = parseInt(assessmentId);
      } else if (resolvedAssessmentId) {
        assessmentIdToUse = resolvedAssessmentId;
      } else {
        // Try to find existing assessment
        try {
          const assessments = await getMyAssessments();
          const feedback360Assessment = assessments.find(
            (a) => a.assessment_type === 'THREE_SIXTY_SELF'
          );
          if (feedback360Assessment) {
            assessmentIdToUse = feedback360Assessment.id;
          }
        } catch (err) {
          console.warn('Could not find existing assessment:', err);
        }
      }

      // Always call start360Feedback - backend will resume existing or create new
      // This ensures contributors are properly added
      const response = await start360Feedback(evaluatorsData);
      assessmentIdToUse = response.assessment_id || assessmentIdToUse;

      setSubmittedEvaluatorsCount(evaluatorsData.length);
      setSuccess(true);
      
      // Store the assessment ID for persistence
      if (assessmentIdToUse) {
        setResolvedAssessmentId(assessmentIdToUse);
        // Update URL with assessment ID for persistence
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('assessmentId', assessmentIdToUse.toString());
        window.history.replaceState({}, '', newUrl.toString());
        await loadExistingEvaluators(assessmentIdToUse);
      }
      
      // Redirect to the 360 feedback assessment page (auto-evaluation) after a short delay
      setTimeout(() => {
        router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessmentIdToUse}`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to start 360 feedback:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'An error occurred while starting the 360° assessment'
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

      // Check if assessment already exists
      let assessmentIdToUse: number | null = null;
      
      // First, try to use existing assessment ID from URL or resolved
      if (assessmentId) {
        assessmentIdToUse = parseInt(assessmentId);
      } else if (resolvedAssessmentId) {
        assessmentIdToUse = resolvedAssessmentId;
      } else {
        // Try to find existing assessment
        try {
          const assessments = await getMyAssessments();
          const feedback360Assessment = assessments.find(
            (a) => a.assessment_type === 'THREE_SIXTY_SELF'
          );
          if (feedback360Assessment) {
            assessmentIdToUse = feedback360Assessment.id;
          }
        } catch (err) {
          console.warn('Could not find existing assessment:', err);
        }
      }

      // If no existing assessment, create a new one without contributors
      if (!assessmentIdToUse) {
        const response = await start360Feedback([]);
        assessmentIdToUse = response.assessment_id;
      }

      // Store the assessment ID for persistence
      if (assessmentIdToUse) {
        setResolvedAssessmentId(assessmentIdToUse);
        // Update URL with assessment ID for persistence
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('assessmentId', assessmentIdToUse.toString());
        window.history.replaceState({}, '', newUrl.toString());
      }
      
      setSubmittedEvaluatorsCount(0);
      setSuccess(true);
      
      // Redirect immediately to the 360 feedback assessment page (skip success screen)
      router.push(`/dashboard/assessments/360-feedback?assessmentId=${assessmentIdToUse}`);
    } catch (err: any) {
      console.error('Failed to start 360 feedback:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'An error occurred while starting the 360° assessment'
      );
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
              {submittedEvaluatorsCount > 0 ? 'Invitations Sent!' : 'Assessment Created!'}
            </h1>
            <p className="mb-8 text-gray-600">
              {submittedEvaluatorsCount > 0
                ? `Invitations have been sent ${submittedEvaluatorsCount > 1 ? `to ${submittedEvaluatorsCount} contributors` : 'to the contributor'}. You can now start your self-assessment.`
                : 'Your 360° assessment has been created. You can now start your self-assessment and add contributors later if you wish.'}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting...
            </p>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <>
      <PageHeader
        title="Start a 360° Feedback Assessment"
        description="Invite professionals to assess your leadership capabilities (optional). They will receive an email with thorough orientation and with a link to complete a form. You may add contributors later."
        titleClassName="text-white"
        descriptionClassName="text-white"
      />

      <Container className="py-8">
        <div className="mx-auto max-w-6xl">
          {/* Existing Evaluators Section */}
          {existingEvaluators.length > 0 && (
            <Card className="mb-6 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Added Contributors ({existingEvaluators.length})
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
                  {isLoadingEvaluators ? 'Loading...' : 'Refresh'}
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
                    'not_started': 'Invitation sent',
                    'in_progress': 'In Progress',
                    'completed': 'Completed',
                    // Support for uppercase format (backward compatibility)
                    'NOT_STARTED': 'Invitation sent',
                    'IN_PROGRESS': 'In Progress',
                    'COMPLETED': 'Completed',
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
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
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

          <Card className="p-8" style={{ backgroundColor: '#D5DEE0', borderRadius: '24px' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="mb-6 rounded-lg bg-primary-50 p-4">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="font-semibold text-primary-900">
                      Instructions
                    </h3>
                    <div className="mt-1 text-sm text-primary-800 space-y-2">
                      <p>
                        The 360° feedback process provides a complete view of your leadership by combining your self-reflection with feedback from colleagues/peers, leaders, direct reports and external stakeholders. It helps you recognize your strengths, identify areas for growth, and compare how you see yourself with how others experience your leadership.
                      </p>
                      <p className="font-semibold mt-3">
                        ORIENTATION FOR SELECTION OF CONTRIBUTORS
                      </p>
                      <p>
                        This process requires openness, honesty, and thoughtful reflections. It is important to select professionals that will be comfortable conducting this process while being:
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li><strong>Reflective:</strong> Taking time to carefully consider your actions, decisions, and the impact you have had on work environment and on others, ideally in the last twelve months.</li>
                        <li><strong>Honest:</strong> Acknowledging both your strengths and the areas where you can grow, to add the most value to the process.</li>
                        <li><strong>Balanced:</strong> Focusing on real behaviors and outcomes, not intentions and/or isolated moments.</li>
                        <li><strong>Growth-oriented:</strong> Approaching this process to genuinely allow the opportunity to reveal blinds and to set a foundation for continued growth.</li>
                      </ul>
                    </div>
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
                        <h3 className="text-lg font-semibold text-gray-900 text-left">
                          Contributor {index + 1}
                        </h3>
                      </div>
                      {evaluators.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEvaluator(index)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Remove this contributor"
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
                          Full name *
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

              <div className="flex justify-center border-t border-gray-200 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEvaluator}
                  className="flex items-center gap-2"
                  style={{ 
                    border: '1px solid #D8B868',
                    color: '#D8B868',
                    padding: '3px 6px'
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add a contributor
                </Button>
              </div>

              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // If we have an assessmentId, go to the assessment page, otherwise go to assessments list
                      const idToUse = parseInt(assessmentId || '') || resolvedAssessmentId;
                      if (idToUse) {
                        router.push(`/dashboard/assessments/360-feedback?assessmentId=${idToUse}`);
                      } else {
                        router.push('/dashboard/assessments/360-feedback');
                      }
                    }}
                    disabled={isSubmitting}
                    style={{ 
                      border: '1px solid #D8B868',
                      color: '#D8B868',
                      padding: '6px 12px'
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    style={{ 
                      border: '1px solid #D8B868',
                      color: '#D8B868',
                      padding: '6px 12px'
                    }}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>Start without contributors</>
                    )}
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-arise-gold hover:bg-arise-gold/90 flex flex-row items-center gap-2"
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {evaluators.length > 0 && evaluators.some(e => e.name.trim() && e.email.trim())
                        ? 'Send invitations and start'
                        : 'Start without contributors'}
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
