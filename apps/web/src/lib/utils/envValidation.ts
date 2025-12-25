/**
 * Environment Variable Validation
 * Validates required environment variables on startup
 * 
 * Security: Ensures critical configuration is present before runtime
 */

import { logger } from '@/lib/logger';

interface EnvVarConfig {
  name: string;
  required: boolean;
  defaultValue?: string;
  validate?: (value: string) => boolean;
  errorMessage?: string;
}

/**
 * Environment variable configurations
 */
const ENV_VAR_CONFIGS: EnvVarConfig[] = [
  {
    name: 'NEXT_PUBLIC_API_URL',
    required: process.env.NODE_ENV === 'production',
    validate: (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    errorMessage: 'NEXT_PUBLIC_API_URL must be a valid HTTP/HTTPS URL',
  },
  {
    name: 'NODE_ENV',
    required: true,
    validate: (value) => ['development', 'production', 'test'].includes(value),
    errorMessage: 'NODE_ENV must be one of: development, production, test',
  },
];

/**
 * Validate environment variables
 * @param configs Array of environment variable configurations
 * @returns Object with validation results
 */
export function validateEnvironmentVariables(
  configs: EnvVarConfig[] = ENV_VAR_CONFIGS
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const config of configs) {
    const value = process.env[config.name];

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(
        `Required environment variable ${config.name} is not set. ${config.errorMessage || ''}`
      );
      continue;
    }

    // Skip validation if variable is not set and not required
    if (!value) {
      if (config.defaultValue) {
        warnings.push(
          `Environment variable ${config.name} is not set, using default value`
        );
      }
      continue;
    }

    // Run custom validation if provided
    if (config.validate && !config.validate(value)) {
      const errorMsg = config.errorMessage || `Invalid value for ${config.name}`;
      errors.push(`${config.name}: ${errorMsg}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment variables and log results
 * Should be called at application startup
 */
export function validateAndLogEnvironmentVariables(): void {
  const result = validateEnvironmentVariables();

  if (result.warnings.length > 0) {
    logger.warn('Environment variable warnings', { warnings: result.warnings });
  }

  if (result.errors.length > 0) {
    logger.error('Environment variable validation failed', new Error(result.errors.join('; ')), {
      errors: result.errors,
    });

    if (process.env.NODE_ENV === 'production') {
      // In production, throw error to prevent startup with invalid config
      throw new Error(
        `Environment variable validation failed:\n${result.errors.join('\n')}`
      );
    }
  } else {
    logger.info('Environment variable validation passed');
  }
}

/**
 * Get environment variable with validation
 * @param name Environment variable name
 * @param defaultValue Default value if not set
 * @returns Environment variable value
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is not set and no default value provided`);
  }
  
  return value;
}

/**
 * Get boolean environment variable
 * @param name Environment variable name
 * @param defaultValue Default value if not set
 * @returns Boolean value
 */
export function getBooleanEnvVar(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name];
  
  if (!value) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 * @param name Environment variable name
 * @param defaultValue Default value if not set
 * @returns Number value
 */
export function getNumberEnvVar(name: string, defaultValue?: number): number {
  const value = process.env[name];
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is not set and no default value provided`);
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} is not a valid number: ${value}`);
  }
  
  return num;
}

