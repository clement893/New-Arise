/**
 * Common TypeScript types to replace 'any' usage
 */

import { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * API Error with proper typing
 */
export interface ApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data?: {
      detail?: string;
      message?: string;
      errors?: Record<string, unknown>;
    };
    headers?: Record<string, string>;
    config?: AxiosRequestConfig;
  };
  config?: AxiosRequestConfig;
  isAxiosError?: boolean;
  statusCode?: number;
}

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    ('response' in error || 'isAxiosError' in error || 'statusCode' in error)
  );
}

/**
 * Type guard to check if error is an Axios error
 */
export function isAxiosErrorType(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Extract status code from error
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.response?.status || error.statusCode;
  }
  if (isAxiosErrorType(error)) {
    return error.response?.status;
  }
  return undefined;
}

