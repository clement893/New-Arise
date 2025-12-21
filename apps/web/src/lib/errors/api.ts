/**
 * API Error Handling
 * Centralized error handling for API calls
 */

import { AxiosError } from 'axios';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './AppError';
import { ErrorCode, type ApiErrorResponse } from './types';

/**
 * Convert HTTP status code to ErrorCode
 */
function statusCodeToErrorCode(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
      return ErrorCode.VALIDATION_ERROR;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    case 500:
      return ErrorCode.INTERNAL_SERVER_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * Create AppError from HTTP status code
 */
function createErrorFromStatusCode(
  statusCode: number,
  message: string,
  details?: Record<string, unknown>
): AppError {
  const code = statusCodeToErrorCode(statusCode);

  switch (code) {
    case ErrorCode.BAD_REQUEST:
      return new BadRequestError(message, details);
    case ErrorCode.UNAUTHORIZED:
      return new UnauthorizedError(message, details);
    case ErrorCode.FORBIDDEN:
      return new ForbiddenError(message, details);
    case ErrorCode.NOT_FOUND:
      return new NotFoundError(message, details);
    case ErrorCode.CONFLICT:
      return new ConflictError(message, details);
    case ErrorCode.VALIDATION_ERROR:
      return new ValidationError(message, details);
    default:
      return new InternalServerError(message, details);
  }
}

/**
 * Handle Axios errors and convert to AppError
 */
export function handleApiError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Axios error
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status ?? 500;
    const responseData = error.response?.data as ApiErrorResponse | undefined;

    // Use error message from API response if available
    const message =
      responseData?.error?.message ?? error.message ?? 'An error occurred';

    // Extract details from API response
    const details: Record<string, unknown> = {
      url: error.config?.url,
      method: error.config?.method,
      ...responseData?.error?.details,
    };

    // Add validation errors if present
    if (responseData?.error?.validationErrors) {
      details.validationErrors = responseData.error.validationErrors;
    }

    return createErrorFromStatusCode(statusCode, message, details);
  }

  // Network error
  if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      return new AppError(
        ErrorCode.NETWORK_ERROR,
        'Network error. Please check your connection.',
        0
      );
    }
    return new InternalServerError(error.message);
  }

  // Unknown error
  return new InternalServerError('An unknown error occurred');
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: AppError): boolean {
  return error.statusCode >= 400 && error.statusCode < 500;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: AppError): boolean {
  return error.statusCode >= 500;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: AppError): boolean {
  return error.code === ErrorCode.NETWORK_ERROR || error.statusCode === 0;
}

