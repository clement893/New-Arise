import { ReactNode } from 'react';
import { Container } from '@/components/ui';
import { clsx } from 'clsx';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <Container 
      className={clsx('py-4 sm:py-6 md:py-8', className)}
      center={false}
      maxWidth="full"
      style={{
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {children}
    </Container>
  );
}

