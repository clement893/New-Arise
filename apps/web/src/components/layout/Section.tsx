import { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { clsx } from 'clsx';

interface SectionProps {
  title: string;
  children: ReactNode;
  description?: string;
  className?: string;
  actions?: ReactNode;
}

export default function Section({
  title,
  children,
  description,
  className,
  actions,
}: SectionProps) {
  return (
    <Card className={clsx(className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </Card>
  );
}

