import { ReactNode } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import { clsx } from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <Container className={clsx('py-8', className)}>
      {breadcrumbs && (
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Heading level={1} className={clsx('text-foreground font-bold', titleClassName)}>
              {title}
            </Heading>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {description && (
            <Text variant="body" className={clsx('text-muted-foreground', descriptionClassName)}>
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-4 items-start sm:items-center flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </Container>
  );
}
