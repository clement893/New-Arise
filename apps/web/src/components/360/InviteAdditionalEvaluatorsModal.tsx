'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { X, Plus, Trash2 } from 'lucide-react';
import { invite360Evaluators, type Evaluator360Data } from '@/lib/api/assessments';

type EvaluatorRole = 'PEER' | 'MANAGER' | 'DIRECT_REPORT' | 'STAKEHOLDER';

interface EvaluatorForm {
  name: string;
  email: string;
  role: EvaluatorRole;
}

interface InviteAdditionalEvaluatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: number;
  onSuccess?: () => void;
}

const ROLE_LABELS: Record<EvaluatorRole, string> = {
  PEER: 'Pair / Collègue',
  MANAGER: 'Manager / Supérieur',
  DIRECT_REPORT: 'Rapport direct / Collaborateur',
  STAKEHOLDER: 'Partie prenante / Client',
};

const ROLE_OPTIONS: EvaluatorRole[] = ['PEER', 'MANAGER', 'DIRECT_REPORT', 'STAKEHOLDER'];

export default function InviteAdditionalEvaluatorsModal({
  isOpen,
  onClose,
  assessmentId,
  onSuccess,
}: InviteAdditionalEvaluatorsModalProps) {
  const [evaluators, setEvaluators] = useState<EvaluatorForm[]>([
    { name: '', email: '', role: 'PEER' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEvaluators([{ name: '', email: '', role: 'PEER' }]);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

      await invite360Evaluators(assessmentId, evaluatorsData);

      setSuccess(true);
      
      // Close modal after a short delay and call onSuccess
      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err: any) {
      console.error('Failed to invite evaluators:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Une erreur est survenue lors de l\'invitation des évaluateurs'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Ajouter des évaluateurs
            </h2>
            <button
              onClick={handleClose}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Invitations envoyées !
              </h3>
              <p className="text-gray-600">
                Les évaluateurs ont été invités avec succès.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-gray-600">
                  Invitez des collègues à fournir un feedback sur votre leadership.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
                  {error}
                </div>
              )}

              <div className="mb-6 space-y-4">
                {evaluators.map((evaluator, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Évaluateur {index + 1}
                      </span>
                      {evaluators.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEvaluator(index)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Nom
                        </label>
                        <Input
                          type="text"
                          placeholder="Jean Dupont"
                          value={evaluator.name}
                          onChange={(e) =>
                            updateEvaluator(index, 'name', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="jean@example.com"
                          value={evaluator.email}
                          onChange={(e) =>
                            updateEvaluator(index, 'email', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Relation
                        </label>
                        <select
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-arise-deep-teal focus:outline-none focus:ring-1 focus:ring-arise-deep-teal"
                          value={evaluator.role}
                          onChange={(e) =>
                            updateEvaluator(index, 'role', e.target.value as EvaluatorRole)
                          }
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEvaluator}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un évaluateur
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer les invitations'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
