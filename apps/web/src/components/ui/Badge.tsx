import { ReactNode, memo } from 'react';
import { clsx } from 'clsx';
import { ColorVariant, BaseComponentProps, ColorVariantProps } from './types';

interface BadgeProps extends BaseComponentProps, ColorVariantProps {
  children: ReactNode;
  variant?: ColorVariant;
}

function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300',
    error: 'bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-300',
    info: 'bg-info-100 dark:bg-info-900/30 text-info-900 dark:text-info-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default memo(Badge);

