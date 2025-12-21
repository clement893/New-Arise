/**
 * Global Error Boundary
 * Catches errors in the root layout
 */

'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { logger } from '@/lib/logger';
import { InternalServerError } from '@/lib/errors';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    const appError = new InternalServerError(error.message);
    logger.error('Global error boundary', appError, {
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html>
      <body>
        <ErrorDisplay
          error={new InternalServerError(error.message)}
          onRetry={reset}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  );
}

