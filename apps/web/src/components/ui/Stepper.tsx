/**
 * Stepper Component
 * Multi-step form navigation component
 */

'use client';

import { clsx } from 'clsx';

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  error?: boolean;
  completed?: boolean;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  showStepNumbers?: boolean;
  allowNavigation?: boolean;
  className?: string;
}

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  showStepNumbers = true,
  allowNavigation = false,
  className,
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';

  const getStepStatus = (index: number) => {
    const step = steps[index];
    if (!step) return 'upcoming';
    if (step.error) return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (index: number) => {
    if (!allowNavigation) return;
    const step = steps[index];
    if (!step) return;
    if (index <= currentStep || step.optional) {
      onStepClick?.(index);
    }
  };

  return (
    <nav
      className={clsx(
        'stepper',
        isHorizontal ? 'flex items-center' : 'flex flex-col',
        className
      )}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isClickable = allowNavigation && (index <= currentStep || step.optional);

        return (
          <div
            key={step.id}
            className={clsx(
              'flex items-center',
              isHorizontal ? 'flex-1' : 'w-full',
              !isHorizontal && index < steps.length - 1 && 'mb-4'
            )}
          >
            {/* Step Circle */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={clsx(
                  'flex items-center justify-center rounded-full transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  showStepNumbers ? 'w-10 h-10 text-sm font-medium' : 'w-8 h-8',
                  status === 'completed' &&
                    'bg-primary-600 dark:bg-primary-500 text-white',
                  status === 'current' &&
                    'bg-primary-600 dark:bg-primary-500 text-white ring-2 ring-primary-200 dark:ring-primary-800',
                  status === 'error' &&
                    'bg-danger-600 dark:bg-danger-500 text-white',
                  status === 'upcoming' &&
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-not-allowed'
                )}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {status === 'completed' ? (
                  <svg
                    className="w-5 h-5"
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
                ) : showStepNumbers ? (
                  index + 1
                ) : (
                  <div
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      status === 'current' && 'bg-white',
                      status === 'upcoming' && 'bg-gray-400 dark:bg-gray-500',
                      status === 'error' && 'bg-white'
                    )}
                  />
                )}
              </button>

              {/* Step Label */}
              <div
                className={clsx(
                  isHorizontal ? 'ml-4' : 'ml-3',
                  'flex flex-col'
                )}
              >
                <span
                  className={clsx(
                    'text-sm font-medium',
                    status === 'current' &&
                      'text-primary-600 dark:text-primary-400',
                    status === 'completed' &&
                      'text-gray-900 dark:text-gray-100',
                    status === 'error' &&
                      'text-danger-600 dark:text-danger-400',
                    status === 'upcoming' &&
                      'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.label}
                  {step.optional && (
                    <span className="text-gray-400 dark:text-gray-500 ml-1">
                      (optionnel)
                    </span>
                  )}
                </span>
                {step.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1',
                  isHorizontal ? 'mx-4 h-0.5' : 'my-2 w-0.5 h-8 ml-4',
                  index < currentStep
                    ? 'bg-primary-600 dark:bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

