/**
 * Safe Render Utilities
 * Utilities to safely render values in React components, preventing React error #130
 */

import { formatError } from './formatError';

/**
 * Safely renders an error value as a string
 * Prevents React error #130 (objects not valid as React child)
 * 
 * @param error - The error to render (can be any type)
 * @returns A safe string that can be rendered in JSX
 * 
 * @example
 * ```tsx
 * {safeRenderError(error)}
 * ```
 */
export function safeRenderError(error: unknown): string {
  if (error === null || error === undefined) {
    return 'An error occurred';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return formatError(error);
}

/**
 * Safely renders any value as a string
 * Prevents React error #130 (objects not valid as React child)
 * 
 * @param value - The value to render (can be any type)
 * @param fallback - Fallback string if value is null/undefined
 * @returns A safe string that can be rendered in JSX
 * 
 * @example
 * ```tsx
 * {safeRender(data?.message, 'No message')}
 * ```
 */
export function safeRender(value: unknown, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // For objects, try to extract a message or stringify
  if (typeof value === 'object') {
    if ('message' in value && typeof value.message === 'string') {
      return value.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}
