/**
 * Theme API Error Handling Utilities
 * Parses and structures validation errors from the backend
 */

export interface ThemeValidationError {
  type: 'color_format' | 'contrast' | 'unknown';
  field?: string;
  message: string;
}

export interface ParsedThemeError {
  isValidationError: boolean;
  validationErrors: ThemeValidationError[];
  originalError: Error;
  message: string;
}

/**
 * Check if an error is a validation error from the backend
 */
export function isThemeValidationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const message = error.message.toLowerCase();
  return (
    message.includes('color format') ||
    message.includes('contrast') ||
    message.includes('validation') ||
    message.includes('invalid color')
  );
}

/**
 * Parse validation errors from backend error message
 */
export function parseThemeValidationErrors(error: Error): ThemeValidationError[] {
  const errors: ThemeValidationError[] = [];
  const message = error.message;
  
  // Parse color format errors
  if (message.includes('Color format errors:')) {
    const parts = message.split('Color format errors:');
    if (parts[1]) {
      const errorLines = parts[1].split('\n');
      errorLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.startsWith('-')) {
          // Extract field and message
          // Format: "  - field: message"
          const match = trimmed.match(/-\s*([^:]+):\s*(.+)/);
          if (match && match[1] && match[2]) {
            errors.push({
              type: 'color_format',
              field: match[1].trim(),
              message: match[2].trim(),
            });
          }
        }
      });
    }
  }
  
  // Parse contrast issues
  if (message.includes('Critical contrast issues:')) {
    const parts = message.split('Critical contrast issues:');
    if (parts[1]) {
      const errorLines = parts[1].split('\n');
      errorLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.startsWith('-')) {
          // Extract element and message
          // Format: "  - element: message"
          const match = trimmed.match(/-\s*([^:]+):\s*(.+)/);
          if (match && match[1] && match[2]) {
            errors.push({
              type: 'contrast',
              field: match[1].trim(),
              message: match[2].trim(),
            });
          }
        }
      });
    }
  }
  
  // If no structured errors found, create a generic one
  if (errors.length === 0 && (message.includes('validation') || message.includes('invalid'))) {
    errors.push({
      type: 'unknown',
      message: message,
    });
  }
  
  return errors;
}

/**
 * Parse theme API error into structured format
 */
export function parseThemeError(error: unknown): ParsedThemeError {
  if (!(error instanceof Error)) {
    return {
      isValidationError: false,
      validationErrors: [],
      originalError: new Error(String(error)),
      message: String(error),
    };
  }
  
  const isValidation = isThemeValidationError(error);
  const validationErrors = isValidation ? parseThemeValidationErrors(error) : [];
  
  return {
    isValidationError: isValidation,
    validationErrors,
    originalError: error,
    message: error.message,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ThemeValidationError[]): string[] {
  const formatted: string[] = [];
  
  const colorErrors = errors.filter(e => e.type === 'color_format');
  const contrastErrors = errors.filter(e => e.type === 'contrast');
  
  if (colorErrors.length > 0) {
    formatted.push(`Erreurs de format de couleur (${colorErrors.length}):`);
    colorErrors.forEach(error => {
      formatted.push(`  • ${error.field || 'Champ inconnu'}: ${error.message}`);
    });
  }
  
  if (contrastErrors.length > 0) {
    formatted.push(`Problèmes de contraste critiques (${contrastErrors.length}):`);
    contrastErrors.forEach(error => {
      formatted.push(`  • ${error.field || 'Élément inconnu'}: ${error.message}`);
    });
  }
  
  const otherErrors = errors.filter(e => e.type === 'unknown');
  if (otherErrors.length > 0) {
    otherErrors.forEach(error => {
      formatted.push(`  • ${error.message}`);
    });
  }
  
  return formatted;
}

