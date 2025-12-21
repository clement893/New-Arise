/**
 * Logger Structuré Frontend
 * Logging structuré pour le frontend avec niveaux et contexte
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'accessToken',
    'refreshToken',
    'authorization',
    'auth',
    'creditCard',
    'credit_card',
    'ssn',
    'socialSecurityNumber',
  ];

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive && typeof value === 'string') {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Sanitize sensitive data before logging
    const sanitizedContext = context ? sanitizeData(context) as LogContext : undefined;
    
    if (this.isDevelopment) {
      const formatted = this.formatMessage(level, message, sanitizedContext);
      
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted, error);
          break;
      }
    }

    // En production, envoyer à votre service de logging
    if (this.isProduction && level === 'error') {
      // Exemple: envoyer à Sentry, LogRocket, etc.
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(error || new Error(message), {
          contexts: {
            custom: sanitizedContext,
          },
        });
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  // Méthodes spécialisées
  apiError(endpoint: string, error: Error, statusCode?: number): void {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      statusCode,
      type: 'api',
    });
  }

  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      type: 'user_action',
    });
  }

  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      unit,
      type: 'performance',
    });
  }
}

export const logger = new Logger();

