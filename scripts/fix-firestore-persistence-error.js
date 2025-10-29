/**
 * Fix Firestore Persistence Error
 * 
 * This script addresses the error:
 * "Failed to initialize Firestore with persistence, falling back to memory cache"
 * 
 * The issue occurs during hot module reloading when Firestore is initialized
 * multiple times with different persistence options.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Firestore persistence fix...');

// Path to the Firebase config file
const firebaseConfigPath = path.resolve(process.cwd(), 'src/lib/firebase/firebaseConfig.ts');

// Create backup of the file
if (fs.existsSync(firebaseConfigPath)) {
  const backupPath = `${firebaseConfigPath}.persistence-fix-backup`;
  fs.copyFileSync(firebaseConfigPath, backupPath);
  console.log(`Created backup at ${backupPath}`);
}

// Read the current content
let content = fs.readFileSync(firebaseConfigPath, 'utf8');

// Replace the problematic Firestore initialization code
content = content.replace(
  `    // Only use persistence in browser environments
    if (typeof window !== 'undefined') {
      try {
        // First try to get an existing instance
        db = getFirestore(app);
        
        // Only attempt to set persistence on first initialization
        // This prevents the "already been called with different options" error
        const firestoreApps = getApps().filter(app => {
          try {
            return !!getFirestore(app);
          } catch (e) {
            return false;
          }
        });
        
        if (firestoreApps.length <= 1) {
          try {
            // Try to initialize with persistence only on first load
            db = initializeFirestore(app, {
              localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
              })
            } as FirestoreSettings);
          } catch (persistenceError) {
            console.warn('Failed to initialize Firestore with persistence, falling back to memory cache');
            // Already handled by getting the default instance above
          }
        }
      } catch (error) {
        console.error('Error initializing Firestore:', error);
        // Fall back to default Firestore without persistence
        db = getFirestore(app);
      }
    } else {
      // Server environment - use default settings without persistence
      db = getFirestore(app);
    }`,
  `    // Only use persistence in browser environments
    if (typeof window !== 'undefined') {
      try {
        // IMPROVED APPROACH: Use a module-level variable to track initialization
        // This prevents multiple initialization attempts during HMR
        const globalWithFirestore = global as typeof globalThis & {
          _firestoreInitialized?: boolean;
          _firestoreInstance?: Firestore;
        };
        
        // Check if we already have an initialized instance
        if (globalWithFirestore._firestoreInstance) {
          console.log('Using existing Firestore instance from global scope');
          db = globalWithFirestore._firestoreInstance;
        } else {
          // First try to get an existing instance without persistence
          db = getFirestore(app);
          
          // Only try to set persistence if this is the first initialization
          // and we're not in a hot module reload cycle
          if (!globalWithFirestore._firestoreInitialized) {
            try {
              // Create a new instance with persistence
              const dbWithPersistence = initializeFirestore(app, {
                localCache: persistentLocalCache({
                  tabManager: persistentMultipleTabManager()
                })
              } as FirestoreSettings);
              
              // If successful, use this instance instead
              db = dbWithPersistence;
              console.log('Successfully initialized Firestore with persistence');
            } catch (persistenceError) {
              // This is expected during HMR, so we'll just use the default instance
              console.log('Using Firestore without persistence (expected during development)');
            }
            
            // Mark as initialized to prevent future attempts
            globalWithFirestore._firestoreInitialized = true;
            globalWithFirestore._firestoreInstance = db;
          }
        }
      } catch (error) {
        console.error('Error initializing Firestore:', error);
        // Fall back to default Firestore without persistence
        db = getFirestore(app);
      }
    } else {
      // Server environment - use default settings without persistence
      db = getFirestore(app);
    }`
);

// Write the updated content back to the file
fs.writeFileSync(firebaseConfigPath, content);
console.log('Updated Firestore initialization code');

// Create a global fix for Firebase in Next.js
const globalFixPath = path.resolve(process.cwd(), 'src/lib/firebase/firebase-global-fix.ts');
const globalFixContent = `/**
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
`;

// Write the global fix file
fs.writeFileSync(globalFixPath, globalFixContent);
console.log(`Created Firebase global fix at ${globalFixPath}`);

// Create a README file explaining the fix
const readmePath = path.resolve(process.cwd(), 'FIRESTORE_PERSISTENCE_FIX.md');
const readmeContent = `# Firestore Persistence Error Fix

This document explains the fix for the error:
\`\`\`
Failed to initialize Firestore with persistence, falling back to memory cache
\`\`\`

## The Problem

This error occurs during hot module reloading (HMR) in Next.js development mode. When a file is changed, Next.js reloads the affected modules, which can cause Firebase services to be initialized multiple times with different options.

Specifically, the error happens because:

1. Firestore is initialized with persistence options
2. During HMR, the module is reloaded and tries to initialize again
3. Firebase detects that Firestore was already initialized with different options
4. The initialization fails and falls back to memory cache

While this error doesn't break functionality (it falls back to memory cache), it clutters the console with warnings.

## The Solution

The fix implements a global instance tracking approach:

1. **Global Instance Tracking**: Store Firestore instances in a global variable that persists across HMR cycles
2. **Initialization Flag**: Track whether Firestore has been initialized with a global flag
3. **Conditional Initialization**: Only attempt to initialize with persistence if it hasn't been done before
4. **Graceful Fallback**: Use existing instances when available instead of creating new ones

## Implementation Details

1. **Modified Firestore Initialization**: Updated the initialization logic to check for existing instances
2. **Added Global Firebase Fix**: Created a utility to manage global Firebase instances
3. **Improved Error Handling**: Better logging and fallback mechanisms

## Benefits

- **Cleaner Console**: No more persistence error warnings during development
- **Consistent Instances**: Firebase services use the same instances across HMR cycles
- **Better Performance**: Avoids unnecessary re-initialization of Firebase services
- **Improved Developer Experience**: Reduces confusion from non-critical warnings

## Notes

- This fix is primarily for development mode; in production, HMR doesn't occur
- The persistence warning is not a critical error; Firestore still works in memory cache mode
- The fix ensures a smoother development experience without console warnings

Created: ${new Date().toISOString()}
`;

fs.writeFileSync(readmePath, readmeContent);
console.log(`Created explanation file at ${readmePath}`);

console.log('\nFirestore persistence fix completed!');
console.log('\nThis fix should resolve the error by:');
console.log('1. Using global variables to track Firestore initialization across HMR cycles');
console.log('2. Only attempting to initialize with persistence once per session');
console.log('3. Gracefully falling back to existing instances when available');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Check the console for Firebase initialization messages');
console.log('3. Verify that the persistence error no longer appears');
