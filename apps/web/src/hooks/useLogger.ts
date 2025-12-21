/**
 * useLogger Hook
 * React hook for accessing the logger
 */

import { useMemo } from 'react';
import { logger } from '@/lib/logger';
import type { LogContext } from '@/lib/logger';

export function useLogger() {
  return useMemo(
    () => ({
      debug: (message: string, context?: LogContext) => logger.debug(message, context),
      info: (message: string, context?: LogContext) => logger.info(message, context),
      warn: (message: string, context?: LogContext) => logger.warn(message, context),
      error: (message: string, error?: Error | unknown, context?: LogContext) =>
        logger.error(message, error, context),
    }),
    []
  );
}

