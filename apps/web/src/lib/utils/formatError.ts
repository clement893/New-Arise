/**
 * Format Error Utility
 * Converts any error type to a safe string for display in UI
 * Prevents React error #130 (objects not valid as React child)
 */

/**
 * Converts any error type to a safe string message
 * Handles axios errors, Error objects, AppError objects, and unknown types
 * 
 * @param error - The error to format (can be any type)
 * @returns A safe string message that can be rendered in React
 * 
 * @example
 * ```typescript
 * try {
 *   await apiCall();
 * } catch (error) {
 *   setError(formatError(error)); // Always a string, never an object
 * }
 * ```
 */
export function formatError(error: unknown): string {
  try {
    // Handle null or undefined
    if (error === null || error === undefined) {
      return 'An unexpected error occurred.';
    }

    // Handle axios errors (most common case)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            detail?: string; 
            message?: string;
            error?: string | { message?: string };
          }; 
          status?: number;
        };
        message?: string;
      };
      
      const response = axiosError.response;
      
      if (response?.status === 401) {
        return 'Your session has expired. Please refresh the page to log in again.';
      } else if (response?.status === 404) {
        return response.data?.detail || 
               response.data?.message || 
               'Resource not found.';
      } else if (response?.status === 403) {
        return 'You do not have permission to perform this action.';
      } else if (response?.status === 400) {
        return response.data?.detail || 
               response.data?.message || 
               'Invalid request. Please check your input.';
      } else if (response?.status === 422) {
        return response.data?.detail || 
               response.data?.message || 
               'Validation error. Please check your input.';
      } else if (response?.status === 500) {
        return 'Server error. Please try again later.';
      } else if (response?.data) {
        // Try to extract message from various response formats
        const data = response.data;
        if (typeof data === 'string') {
          return data;
        } else if (data.detail) {
          return typeof data.detail === 'string' ? data.detail : 'An error occurred.';
        } else if (data.message) {
          return typeof data.message === 'string' ? data.message : 'An error occurred.';
        } else if (data.error) {
          if (typeof data.error === 'string') {
            return data.error;
          } else if (typeof data.error === 'object' && data.error.message) {
            return data.error.message;
          }
        }
      }
      
      // Fallback to axios error message
      if (axiosError.message) {
        return axiosError.message;
      }
    }

    // Handle Error objects
    if (error instanceof Error) {
      return error.message || 'An error occurred.';
    }

    // Handle AppError objects (from handleApiError)
    if (error && typeof error === 'object' && 'message' in error) {
      const appError = error as { message?: string };
      if (typeof appError.message === 'string' && appError.message) {
        return appError.message;
      }
    }

    // Handle strings
    if (typeof error === 'string') {
      return error;
    }

    // Handle numbers (convert to string)
    if (typeof error === 'number') {
      return `Error code: ${error}`;
    }

    // Fallback: convert to string
    try {
      const stringified = String(error);
      // If stringified is just "[object Object]", try JSON.stringify
      if (stringified === '[object Object]') {
        return JSON.stringify(error);
      }
      return stringified;
    } catch (stringifyError) {
      return 'An unexpected error occurred.';
    }
  } catch (parseError) {
    // If parsing the error itself fails, return a safe default
    return 'An unexpected error occurred while processing the error.';
  }
}

/**
 * Safe setError wrapper
 * Ensures that only strings are passed to setError
 * 
 * @param setError - The setError function from useState
 * @param error - The error to format and set
 * 
 * @example
 * ```typescript
 * const [error, setError] = useState<string | null>(null);
 * 
 * try {
 *   await apiCall();
 * } catch (err) {
 *   safeSetError(setError, err); // Always sets a string
 * }
 * ```
 */
export function safeSetError(
  setError: (error: string | null) => void,
  error: unknown
): void {
  setError(formatError(error));
}
