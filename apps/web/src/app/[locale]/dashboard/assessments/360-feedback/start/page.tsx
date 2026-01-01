'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout';
import { Card, Container } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { start360Feedback, type Evaluator360Data } from '@/lib/api/assessments';
import { Users, UserPlus, CheckCircle } from 'lucide-react';
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
  const [evaluators, setEvaluators] = useState<EvaluatorForm[]>([
    { name: '', email: '', role: 'PEER' },
    { name: '', email: '', role: 'PEER' },
    { name: '', email: '', role: 'PEER' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    // Check that we have exactly 3 evaluators
    if (evaluators.length !== 3) {
      setError('Vous devez fournir exactement 3 évaluateurs');
      return false;
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

      const evaluatorsData: Evaluator360Data[] = evaluators.map((e) => ({
        name: e.name.trim(),
        email: e.email.trim(),
        role: e.role,
      }));

      const response = await start360Feedback(evaluatorsData);

      setSuccess(true);
      
      // Redirect to the 360 feedback assessment page after a short delay
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
      <DashboardLayout>
        <Container className="py-8">
          <div className="mx-auto max-w-2xl">
            <Card className="p-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                Invitations envoyées !
              </h1>
              <p className="mb-8 text-gray-600">
                Les invitations ont été envoyées aux 3 évaluateurs. Vous pouvez maintenant commencer votre auto-évaluation.
              </p>
              <p className="text-sm text-gray-500">
                Redirection en cours...
              </p>
            </Card>
          </div>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Démarrer une évaluation 360° Feedback"
        description="Invitez 3 personnes à évaluer votre leadership. Elles recevront un email avec un lien vers le formulaire."
      />

      <Container className="py-8">
        <div className="mx-auto max-w-4xl">
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
                      Invitez 3 personnes qui vous connaissent bien dans votre contexte professionnel. 
                      Choisissez des personnes ayant des relations différentes avec vous (collègue, manager, collaborateur, client, etc.).
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <div className="space-y-6">
                {evaluators.map((evaluator, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arise-teal text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Évaluateur {index + 1}
                      </h3>
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

              <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/assessments')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
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
                      Envoyer les invitations et commencer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </DashboardLayout>
  );
}
