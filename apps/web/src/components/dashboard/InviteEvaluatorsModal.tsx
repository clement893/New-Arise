'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X, Plus, Trash2 } from 'lucide-react';

interface Evaluator {
  name: string;
  email: string;
  role: 'manager' | 'peer' | 'direct_report' | 'external';
}

interface InviteEvaluatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (evaluators: Evaluator[]) => Promise<void>;
}

const evaluatorRoles = [
  { value: 'manager', label: 'Manager / Supervisor' },
  { value: 'peer', label: 'Peer / Colleague' },
  { value: 'direct_report', label: 'Direct Report' },
  { value: 'external', label: 'External Stakeholder' },
];

export default function InviteEvaluatorsModal({
  isOpen,
  onClose,
  onInvite,
}: InviteEvaluatorsModalProps) {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([
    { name: '', email: '', role: 'peer' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addEvaluator = () => {
    setEvaluators([...evaluators, { name: '', email: '', role: 'peer' }]);
  };

  const removeEvaluator = (index: number) => {
    if (evaluators.length > 1) {
      setEvaluators(evaluators.filter((_, i) => i !== index));
    }
  };

  const updateEvaluator = (index: number, field: keyof Evaluator, value: string) => {
    const updated = [...evaluators];
    updated[index] = { ...updated[index], [field]: value };
    setEvaluators(updated);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate all evaluators
    const validEvaluators = evaluators.filter(
      (e) => e.name.trim() && e.email.trim()
    );

    if (validEvaluators.length === 0) {
      setError('Please add at least one evaluator with name and email');
      return;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validEvaluators.filter(
      (e) => !emailRegex.test(e.email)
    );

    if (invalidEmails.length > 0) {
      setError('Please enter valid email addresses for all evaluators');
      return;
    }

    setIsSubmitting(true);

    try {
      await onInvite(validEvaluators);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to invite evaluators';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Invite 360° Evaluators
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Add colleagues who will provide feedback on your leadership
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Evaluators List */}
        <div className="mb-6 max-h-96 space-y-4 overflow-y-auto">
          {evaluators.map((evaluator, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Evaluator {index + 1}
                </span>
                {evaluators.length > 1 && (
                  <button
                    onClick={() => removeEvaluator(index)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={evaluator.name}
                    onChange={(e) =>
                      updateEvaluator(index, 'name', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={evaluator.email}
                    onChange={(e) =>
                      updateEvaluator(index, 'email', e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={evaluator.role}
                    onChange={(e) =>
                      updateEvaluator(index, 'role', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-arise-teal focus:outline-none focus:ring-2 focus:ring-arise-teal/20"
                  >
                    {evaluatorRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Button */}
        <button
          onClick={addEvaluator}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-arise-teal hover:bg-arise-teal/5 hover:text-arise-teal"
        >
          <Plus className="h-4 w-4" />
          Add Another Evaluator
        </button>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-arise-gold hover:bg-arise-gold/90"
          >
            {isSubmitting ? 'Sending Invitations...' : 'Send Invitations'}
          </Button>
        </div>
      </div>
    </div>
  );
}
