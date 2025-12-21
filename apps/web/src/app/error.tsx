/**
 * Global Error Page
 * Next.js error page for unhandled errors
 */

'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { logger } from '@/lib/logger';
import { AppError, InternalServerError } from '@/lib/errors';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error
    const appError =
      error instanceof AppError ? error : new InternalServerError(error.message);
    logger.error('Global error page', appError, {
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <ErrorDisplay
      error={error instanceof AppError ? error : undefined}
      onRetry={reset}
      onReset={() => window.location.href = '/'}
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}

