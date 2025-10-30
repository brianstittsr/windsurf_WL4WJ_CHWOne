/**
 * Global fetch error handler
 * 
 * This utility intercepts fetch calls and provides better error handling
 * to help identify and fix "Failed to fetch" errors.
 */

// Store the original fetch function
const originalFetch = global.fetch;

// Override the global fetch function
global.fetch = async function(input, init) {
  try {
    // Try to perform the fetch
    const response = await originalFetch(input, init);
    return response;
  } catch (error) {
    // Get the URL being fetched
    const url = typeof input === 'string' ? input : input.url;

    let errorMessage = 'An unknown fetch error occurred';
    let errorStack: string | undefined = undefined;

    if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack;
    } else {
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = 'Could not stringify the error object.';
        }
    }
    
    // Log detailed error information
    console.error(
      `%c[FETCH ERROR] Failed to fetch ${url}`,
      'background: #ff5252; color: white; padding: 2px 4px; border-radius: 2px;',
      {
        url,
        method: init?.method || 'GET',
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      }
    );
    
    // Rethrow the error
    throw error;
  }
};

export {};
