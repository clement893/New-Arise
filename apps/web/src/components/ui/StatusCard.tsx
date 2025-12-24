import { clsx } from 'clsx';

interface StatusCardProps {
  title: string;
  description: string;
  status?: 'success' | 'error' | 'warning' | 'info';
}

export default function StatusCard({ title, description, status = 'success' }: StatusCardProps) {
  const statusClasses = {
    success: 'border-secondary-200 dark:border-secondary-800 bg-secondary-100 dark:bg-secondary-900/40',
    error: 'border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/40',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-100 dark:bg-yellow-900/40',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/40',
  };

  const textClasses = {
    success: 'text-secondary-900 dark:text-secondary-100',
    error: 'text-red-900 dark:text-red-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
    info: 'text-blue-900 dark:text-blue-100',
  };

  const textSecondaryClasses = {
    success: 'text-secondary-800 dark:text-secondary-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  };

  return (
    <div
      className={clsx(
        'p-4 border rounded-lg',
        statusClasses[status]
      )}
    >
      <p className={clsx('font-semibold', textClasses[status])}>{title}</p>
      <p className={clsx('text-sm mt-1', textSecondaryClasses[status])}>{description}</p>
    </div>
  );
}

