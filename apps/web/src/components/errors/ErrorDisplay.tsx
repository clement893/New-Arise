/**
 * Error Display Component
 * Reusable component for displaying errors
 */

'use client';

import { type ReactNode, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AppError } from '@/lib/errors/AppError';
import { type ErrorCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface ErrorDisplayProps {
  error?: AppError | Error;
  title?: string;
  message?: string;
  code?: ErrorCode;
  statusCode?: number;
  details?: Record<string, unknown>;
  onRetry?: () => void;
  onReset?: () => void;
  showDetails?: boolean;
  children?: ReactNode;
  autoRetry?: boolean;
  retryDelay?: number;
}

export function ErrorDisplay({
  error,
  title,
  message,
  code,
  statusCode,
  details,
  onRetry,
  onReset,
  showDetails = false,
  children,
  autoRetry = false,
  retryDelay = 2000,
}: ErrorDisplayProps) {
  // Extract error information
  const errorTitle = title ?? (error instanceof AppError ? getErrorTitle(error.code) : 'Error');
  const errorMessage =
    message ?? error?.message ?? 'An unexpected error occurred';
  const errorCode = code ?? (error instanceof AppError ? error.code : undefined);
  const errorStatusCode =
    statusCode ?? (error instanceof AppError ? error.statusCode : undefined);
  const errorDetails = details ?? (error instanceof AppError ? error.details : undefined);
  
  // Check if error is retryable
  const isRetryable = error instanceof AppError 
    ? (error.details?.retryable as boolean | undefined) ?? false
    : false;
  const retryDelayMs = error instanceof AppError
    ? (error.details?.retryDelay as number | undefined) ?? retryDelay
    : retryDelay;
  
  const [countdown, setCountdown] = useState<number | null>(null);

  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && isRetryable && onRetry && countdown === null) {
      setCountdown(Math.ceil(retryDelayMs / 1000));
    }
  }, [autoRetry, isRetryable, onRetry, retryDelayMs, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && onRetry) {
      onRetry();
      setCountdown(null);
    }
  }, [countdown, onRetry]);

  // Log error
  if (error) {
    logger.error('Error displayed', error, {
      code: errorCode,
      statusCode: errorStatusCode,
      details: errorDetails,
      retryable: isRetryable,
    });
  }
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(errorCode, errorMessage, errorDetails);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Container>
        <Card className="max-w-md w-full mx-auto text-center">
          <div className="p-8">
            <div className="mb-6">
              <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
                {errorStatusCode ?? '!'}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {errorTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{userMessage}</p>
              {isRetryable && autoRetry && countdown !== null && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Retrying automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
              )}
            </div>

            {errorCode && (
              <div className="mb-4">
                <Badge variant="error">Code: {errorCode}</Badge>
              </div>
            )}

            {showDetails && errorDetails && Object.keys(errorDetails).length > 0 && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Details:
                </h3>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </div>
            )}

            {children}

            <div className="flex gap-4 justify-center">
              {onRetry && isRetryable && !autoRetry && (
                <Button onClick={onRetry} variant="primary">
                  Try Again
                </Button>
              )}
              {onRetry && isRetryable && autoRetry && countdown !== null && (
                <Button 
                  onClick={() => {
                    setCountdown(null);
                    onRetry();
                  }} 
                  variant="primary"
                  disabled={countdown === 0}
                >
                  Retry Now {countdown !== null && countdown > 0 && `(${countdown}s)`}
                </Button>
              )}
              {onReset && (
                <Button onClick={onReset} variant="secondary">
                  Go Back
                </Button>
              )}
              {!onRetry && !onReset && (
                <Button onClick={() => window.location.href = '/'} variant="primary">
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}

function getErrorTitle(code: ErrorCode): string {
  switch (code) {
    case 'BAD_REQUEST':
      return 'Invalid Request';
    case 'UNAUTHORIZED':
      return 'Session Expired';
    case 'FORBIDDEN':
      return 'Access Denied';
    case 'NOT_FOUND':
      return 'Not Found';
    case 'CONFLICT':
      return 'Conflict';
    case 'VALIDATION_ERROR':
      return 'Validation Error';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too Many Requests';
    case 'INTERNAL_SERVER_ERROR':
      return 'Server Error';
    case 'SERVICE_UNAVAILABLE':
      return 'Service Unavailable';
    case 'NETWORK_ERROR':
      return 'Connection Problem';
    case 'TIMEOUT':
      return 'Request Timeout';
    default:
      return 'Something Went Wrong';
  }
}

function getUserFriendlyMessage(
  code: ErrorCode | undefined,
  defaultMessage: string,
  details?: Record<string, unknown>
): string {
  if (!code) {
    return defaultMessage;
  }

  // Check if there's a custom suggestion in details
  if (details?.suggestion && typeof details.suggestion === 'string') {
    return details.suggestion;
  }

  switch (code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'TIMEOUT':
      return 'The request took too long. Please try again.';
    case 'UNAUTHORIZED':
      return 'Your session has expired. Please log in again.';
    case 'FORBIDDEN':
      return "You don't have permission to perform this action.";
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many requests. Please wait a moment and try again.';
    case 'SERVICE_UNAVAILABLE':
      return 'The service is temporarily unavailable. Please try again in a few moments.';
    case 'INTERNAL_SERVER_ERROR':
      return 'An error occurred on our end. Our team has been notified. Please try again later.';
    default:
      return defaultMessage;
  }
}

