/**
 * Firebase Global Fix
 * 
 * This module provides a global fix for Firebase initialization issues in Next.js,
 * particularly during development with hot module reloading (HMR).
 * 
 * It ensures that Firebase services are only initialized once per session,
 * even when modules are reloaded during development.
 */

// Define a global type to store Firebase instances
declare global {
  var firebase: {
    app?: any;
    auth?: any;
    firestore?: any;
    storage?: any;
    initialized?: boolean;
  };
}

// Initialize the global firebase object if it doesn't exist
if (typeof global !== 'undefined' && !global.firebase) {
  global.firebase = {
    initialized: false
  };
}

/**
 * Get or create a global Firebase instance
 * This prevents multiple initializations during HMR
 */
export function getGlobalFirebase() {
  return global.firebase;
}

/**
 * Set a global Firebase instance
 */
export function setGlobalFirebase(key: string, instance: any) {
  if (typeof global !== 'undefined') {
    global.firebase = global.firebase || {};
    global.firebase[key] = instance;
  }
}

/**
 * Mark Firebase as initialized globally
 */
export function markFirebaseInitialized() {
  if (typeof global !== 'undefined') {
    global.firebase = global.firebase || {};
    global.firebase.initialized = true;
  }
}

/**
 * Check if Firebase is already initialized globally
 */
export function isFirebaseInitialized() {
  return typeof global !== 'undefined' && 
    global.firebase && 
    global.firebase.initialized === true;
}

export default {
  getGlobalFirebase,
  setGlobalFirebase,
  markFirebaseInitialized,
  isFirebaseInitialized
};
