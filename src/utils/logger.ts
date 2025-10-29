/**
 * Logger Utility
 * 
 * Provides consistent logging across the application with the ability
 * to disable verbose logging in production.
 */

// Define log area types for type safety
export type LogArea = 
  | 'AUTH'
  | 'LOGIN'
  | 'DASHBOARD'
  | 'FIREBASE'
  | 'SCHEMA'
  | 'ERROR'
  | 'WARNING'
  | 'SUCCESS'
  | 'INFO'
  | string;

// Define log level types
export type LogLevel = 'info' | 'error' | 'warning' | 'success';

// Style mapping for different areas
const styleMap: Record<string, string> = {
  AUTH: 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;',
  LOGIN: 'background: #2c5282; color: white; padding: 2px 4px; border-radius: 2px;',
  DASHBOARD: 'background: #3182ce; color: white; padding: 2px 4px; border-radius: 2px;',
  FIREBASE: 'background: #dd6b20; color: white; padding: 2px 4px; border-radius: 2px;',
  SCHEMA: 'background: #805ad5; color: white; padding: 2px 4px; border-radius: 2px;',
  ERROR: 'background: #e53e3e; color: white; padding: 2px 4px; border-radius: 2px;',
  WARNING: 'background: #d69e2e; color: white; padding: 2px 4px; border-radius: 2px;',
  SUCCESS: 'background: #38a169; color: white; padding: 2px 4px; border-radius: 2px;',
  INFO: 'background: #4299e1; color: white; padding: 2px 4px; border-radius: 2px;',
  DEFAULT: 'color: #4a5568;'
};

// Check if we should log based on environment
const shouldLog = (level: LogLevel = 'info'): boolean => {
  // Always log errors
  if (level === 'error') return true;
  
  // In development, log everything
  if (process.env.NODE_ENV !== 'production') return true;
  
  // In production, only log if debug is enabled
  return process.env.NEXT_PUBLIC_DEBUG === 'true';
};

/**
 * Log a message with consistent styling
 * @param area - The area of the application (AUTH, LOGIN, etc.)
 * @param message - The message to log
 * @param data - Optional data to log
 * @param level - Log level (info, error, warning, success)
 */
export const log = (
  area: LogArea, 
  message: string, 
  data: any = null, 
  level: LogLevel = 'info'
): void => {
  if (!shouldLog(level)) return;
  
  const style = styleMap[area] || styleMap.DEFAULT;
  
  if (data) {
    console.log(`%c[${area}] ${message}`, style, data);
  } else {
    console.log(`%c[${area}] ${message}`, style);
  }
};

/**
 * Log an error with consistent styling
 * @param area - The area of the application (AUTH, LOGIN, etc.)
 * @param message - The error message
 * @param error - The error object
 */
export const logError = (area: LogArea, message: string, error: any): void => {
  // Always log errors
  console.error(`%c[${area}] ${message}`, styleMap.ERROR, error);
};

/**
 * Time an operation and log the duration
 * @param area - The area of the application (AUTH, LOGIN, etc.)
 * @param operation - The operation being timed
 * @param fn - The function to time
 * @returns The result of the function
 */
export const timeOperation = async <T>(
  area: LogArea, 
  operation: string, 
  fn: () => Promise<T>
): Promise<T> => {
  if (!shouldLog()) return fn();
  
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    log(area, `${operation} duration: ${duration.toFixed(2)} ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logError(area, `${operation} failed after ${duration.toFixed(2)} ms`, error);
    throw error;
  }
};
