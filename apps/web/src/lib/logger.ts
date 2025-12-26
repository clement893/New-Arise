/**
 * Secure Logger Utility
 * 
 * Provides secure logging that:
 * - Removes console.log in production
 * - Sanitizes sensitive data
 * - Provides structured logging
 * 
 * @module logger
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Sanitize sensitive data from log context
   */
  private sanitize(context: LogContext | undefined): LogContext | undefined {
    if (!context) return undefined;

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'api_key',
      'authorization',
      'access_token',
      'refresh_token',
      'secret_key',
      'private_key',
      'credit_card',
      'card_number',
      'cvv',
    ];

    const sanitized = { ...context };
    for (const key in sanitized) {
      const keyLower = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => keyLower.includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Log a message (only in development)
   */
  log(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    const sanitized = this.sanitize(context);
    console.log(`[LOG] ${message}`, sanitized || '');
  }

  /**
   * Log an info message (only in development)
   */
  info(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    const sanitized = this.sanitize(context);
    console.info(`[INFO] ${message}`, sanitized || '');
  }

  /**
   * Log a warning (always logged, but sanitized)
   */
  warn(message: string, context?: LogContext): void {
    const sanitized = this.sanitize(context);
    console.warn(`[WARN] ${message}`, sanitized || '');
  }

  /**
   * Log an error (always logged, but sanitized)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const sanitized = this.sanitize(context);
    console.error(`[ERROR] ${message}`, error || '', sanitized || '');
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    const sanitized = this.sanitize(context);
    console.debug(`[DEBUG] ${message}`, sanitized || '');
  }
}

export const logger = new SecureLogger();
