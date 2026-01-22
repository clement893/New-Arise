'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

const ROLE_OPTIONS: EvaluatorRole[] = ['PEER', 'MANAGER', 'DIRECT_REPORT', 'STAKEHOLDER'];

export default function InviteAdditionalEvaluatorsModal({
  isOpen,
  onClose,
  assessmentId,
  onSuccess,
}: InviteAdditionalEvaluatorsModalProps) {
  const t = useTranslations('dashboard.assessments.evaluators');
  
  const ROLE_LABELS: Record<EvaluatorRole, string> = {
    PEER: t('page.roles.PEER'),
    MANAGER: t('page.roles.MANAGER'),
    DIRECT_REPORT: t('page.roles.DIRECT_REPORT'),
    STAKEHOLDER: t('page.roles.STAKEHOLDER'),
  };
  
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
    console.log('🔍 Validating form with evaluators:', evaluators);
    
    if (!evaluators || evaluators.length === 0) {
      const errorMsg = t('modal.errors.atLeastOneRequired');
      console.error('❌ Validation failed:', errorMsg);
      setError(errorMsg);
      return false;
    }

    for (let i = 0; i < evaluators.length; i++) {
      const evaluator = evaluators[i];
      if (!evaluator) {
        const errorMsg = t('modal.errors.invalidEvaluator', { number: i + 1 });
        console.error('❌ Validation failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
      if (!evaluator.name || !evaluator.name.trim()) {
        const errorMsg = t('modal.errors.nameRequired', { number: i + 1 });
        console.error('❌ Validation failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
      if (!evaluator.email || !evaluator.email.trim()) {
        const errorMsg = t('modal.errors.emailRequired', { number: i + 1 });
        console.error('❌ Validation failed:', errorMsg);
        setError(errorMsg);
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(evaluator.email.trim())) {
        const errorMsg = t('modal.errors.emailInvalid', { number: i + 1 });
        console.error('❌ Validation failed:', errorMsg, evaluator.email);
        setError(errorMsg);
        return false;
      }
    }

    // Check for duplicate emails
    const emails = evaluators.filter((e): e is EvaluatorForm => e !== undefined).map((e) => e.email.toLowerCase().trim());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      const errorMsg = t('modal.errors.duplicateEmails');
      console.error('❌ Validation failed:', errorMsg, { emails, uniqueEmails: Array.from(uniqueEmails) });
      setError(errorMsg);
      return false;
    }

    console.log('✅ All validations passed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 handleSubmit called', { assessmentId, evaluators });
    setError(null);
    setSuccess(false);

    // Validate form
    console.log('🔵 Validating form...');
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    console.log('✅ Form validation passed');

    // Validate assessmentId
    if (!assessmentId || assessmentId <= 0) {
      console.error('❌ Invalid assessmentId:', assessmentId);
      setError(t('modal.errors.invalidAssessmentId'));
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🟡 Setting isSubmitting to true');

      const evaluatorsData: Evaluator360Data[] = evaluators.map((e) => ({
        name: e.name.trim(),
        email: e.email.trim(),
        role: e.role,
      }));

      console.log('🟡 Calling invite360Evaluators API', { assessmentId, evaluatorsData });
      const result = await invite360Evaluators(assessmentId, evaluatorsData);
      console.log('✅ API call successful', result);

      setSuccess(true);
      setIsSubmitting(false);
      
      // Immediately call onSuccess to refresh the evaluators list, then close modal after a short delay
      if (onSuccess) {
        try {
          await onSuccess();
        } catch (onSuccessErr) {
          console.error('[InviteAdditionalEvaluatorsModal] Error in onSuccess callback:', onSuccessErr);
          // Don't block modal closing if onSuccess fails
        }
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      // Extract error message safely
      let errorMessage = t('modal.errors.inviteFailed');
      
      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;
        if (errorObj.response && typeof errorObj.response === 'object') {
          const response = errorObj.response as Record<string, unknown>;
          if (response.data && typeof response.data === 'object') {
            const data = response.data as Record<string, unknown>;
            if (typeof data.detail === 'string') {
              errorMessage = data.detail;
            } else if (typeof data.message === 'string') {
              errorMessage = data.message;
            }
          }
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to invite evaluators:', err);
        if (err && typeof err === 'object') {
          const errorObj = err as Record<string, unknown>;
          console.error('❌ Error details:', {
            message: typeof errorObj.message === 'string' ? errorObj.message : 'Unknown',
            response: errorObj.response,
          });
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('modal.title')}
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
                {t('modal.successTitle')}
              </h3>
              <p className="text-gray-600">
                {t('modal.successMessage')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-gray-600">
                  {t('modal.description')}
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
                        {t('modal.evaluatorLabel')}
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
                          {t('modal.name')}
                        </label>
                        <Input
                          type="text"
                          placeholder={t('modal.namePlaceholder')}
                          value={evaluator.name}
                          onChange={(e) =>
                            updateEvaluator(index, 'name', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          {t('modal.email')}
                        </label>
                        <Input
                          type="email"
                          placeholder={t('modal.emailPlaceholder')}
                          value={evaluator.email}
                          onChange={(e) =>
                            updateEvaluator(index, 'email', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          {t('modal.relation')}
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
                  className="w-full flex flex-row items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('modal.addEvaluator')}
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
                  {t('modal.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('modal.sending') : t('modal.sendInvitations')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
