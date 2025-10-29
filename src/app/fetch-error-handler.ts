/**
 * Register fetch error handler
 * 
 * This file is imported in the app layout to register the global fetch error handler.
 */

'use client';

// Only import in browser environment
if (typeof window !== 'undefined') {
  import('../utils/fetch-error-handler');
}

export {};
