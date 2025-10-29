/**
 * Optimize Login Flow
 * 
 * This script implements several optimizations to improve the login flow:
 * 1. Improve navigation timing to prevent race conditions
 * 2. Optimize schema initialization to reduce overhead during login
 * 3. Add a logger utility to reduce console logging in production
 * 4. Fix potential connection issues
 */

const fs = require('fs');
const path = require('path');

console.log('Starting login flow optimization...');

// Paths to the files we need to modify
const paths = {
  loginPage: path.resolve(process.cwd(), 'src/app/login/page.tsx'),
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  schemaInit: path.resolve(process.cwd(), 'src/lib/schema/initialize-schema.ts'),
  logger: path.resolve(process.cwd(), 'src/utils/logger.ts')
};

// Create backups of all files
Object.entries(paths).forEach(([key, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.login-opt-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${key} at ${backupPath}`);
  } else {
    console.log(`Warning: ${key} not found at ${filePath}`);
  }
});

// 1. Create Logger Utility
console.log('Creating logger utility...');
const loggerContent = `/**
 * Logger Utility
 * 
 * Provides consistent logging across the application with the ability
 * to disable verbose logging in production.
 */

// Style mapping for different areas
const styleMap = {
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
const shouldLog = (level = 'info') => {
  // Always log errors
  if (level === 'error') return true;
  
  // In development, log everything
  if (process.env.NODE_ENV !== 'production') return true;
  
  // In production, only log if debug is enabled
  return process.env.NEXT_PUBLIC_DEBUG === 'true';
};

/**
 * Log a message with consistent styling
 * @param {string} area - The area of the application (AUTH, LOGIN, etc.)
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 * @param {string} level - Log level (info, error, warning, success)
 */
export const log = (area, message, data = null, level = 'info') => {
  if (!shouldLog(level)) return;
  
  const style = styleMap[area] || styleMap.DEFAULT;
  
  if (data) {
    console.log(\`%c[\${area}] \${message}\`, style, data);
  } else {
    console.log(\`%c[\${area}] \${message}\`, style);
  }
};

/**
 * Log an error with consistent styling
 * @param {string} area - The area of the application (AUTH, LOGIN, etc.)
 * @param {string} message - The error message
 * @param {any} error - The error object
 */
export const logError = (area, message, error) => {
  // Always log errors
  console.error(\`%c[\${area}] \${message}\`, styleMap.ERROR, error);
};

/**
 * Time an operation and log the duration
 * @param {string} area - The area of the application (AUTH, LOGIN, etc.)
 * @param {string} operation - The operation being timed
 * @param {Function} fn - The function to time
 * @returns {Promise<any>} - The result of the function
 */
export const timeOperation = async (area, operation, fn) => {
  if (!shouldLog()) return fn();
  
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    log(area, \`\${operation} duration: \${duration.toFixed(2)} ms\`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logError(area, \`\${operation} failed after \${duration.toFixed(2)} ms\`, error);
    throw error;
  }
};
`;

// Create utils directory if it doesn't exist
const utilsDir = path.resolve(process.cwd(), 'src/utils');
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
  console.log('Created utils directory');
}

// Write logger utility
fs.writeFileSync(paths.logger, loggerContent);
console.log('Created logger utility at', paths.logger);

// 2. Optimize Schema Initialization
console.log('Optimizing schema initialization...');
if (fs.existsSync(paths.schemaInit)) {
  let schemaContent = fs.readFileSync(paths.schemaInit, 'utf8');
  
  // Add import for logger
  schemaContent = schemaContent.replace(
    'import { db } from \'@/lib/firebase/firebaseConfig\';',
    'import { db } from \'@/lib/firebase/firebaseConfig\';\nimport { log, logError } from \'@/utils/logger\';'
  );
  
  // Replace console.log calls with logger
  schemaContent = schemaContent.replace(
    /console\.log\(['"](.+?)['"](.*?)\);/g,
    'log(\'SCHEMA\', \'$1\'$2);'
  );
  
  // Replace console.error calls with logError
  schemaContent = schemaContent.replace(
    /console\.error\(['"](.+?)['"](.*?)\);/g,
    'logError(\'SCHEMA\', \'$1\'$2);'
  );
  
  // Add lazy initialization function
  schemaContent += `
/**
 * Lazily initialize schema only when needed
 * This reduces overhead during login and improves performance
 */
export async function initializeSchemaIfNeeded() {
  try {
    // Check if schema is already verified in this session
    if (typeof window !== 'undefined') {
      const schemaVerified = sessionStorage.getItem('schemaVerified');
      if (schemaVerified) {
        log('SCHEMA', 'Schema already verified in this session');
        return true;
      }
    }
    
    // Initialize schema
    const result = await initializeFirebaseSchema();
    
    // Mark as verified for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('schemaVerified', 'true');
      sessionStorage.setItem('schemaVerifiedAt', new Date().toISOString());
    }
    
    return result;
  } catch (error) {
    logError('SCHEMA', 'Error in lazy schema initialization', error);
    return false;
  }
}
`;
  
  // Write updated content
  fs.writeFileSync(paths.schemaInit, schemaContent);
  console.log('Updated schema initialization');
}

// 3. Update Auth Context
console.log('Updating Auth Context...');
if (fs.existsSync(paths.authContext)) {
  let authContent = fs.readFileSync(paths.authContext, 'utf8');
  
  // Add import for logger
  authContent = authContent.replace(
    'import React, { createContext, useContext, useEffect, useState } from \'react\';',
    'import React, { createContext, useContext, useEffect, useState } from \'react\';\nimport { log, logError, timeOperation } from \'@/utils/logger\';'
  );
  
  // Replace console.log calls with logger
  authContent = authContent.replace(
    /console\.log\(['"]%c\[AUTH\] (.+?)['"](.*?)\);/g,
    'log(\'AUTH\', \'$1\'$2);'
  );
  
  // Replace console.error calls with logError
  authContent = authContent.replace(
    /console\.error\(['"]%c\[AUTH\] (.+?)['"](.*?)\);/g,
    'logError(\'AUTH\', \'$1\'$2);'
  );
  
  // Replace other console.error calls
  authContent = authContent.replace(
    /console\.error\(['"](.+?)['"](.*?)\);/g,
    'logError(\'AUTH\', \'$1\'$2);'
  );
  
  // Update signIn function to use timeOperation
  authContent = authContent.replace(
    /const signIn = async \(email: string, password: string\) => {[\s\S]*?try {/m,
    `const signIn = async (email: string, password: string) => {
    log('AUTH', 'Sign In Attempt');
    log('AUTH', 'Credentials:', { email, passwordLength: password?.length });
    log('AUTH', 'Auth state before sign in:', { 
      currentUser: currentUser?.email || null,
      loading,
      error,
      authProvider
    });
    setLoading(true);
    setError(null);
    
    return await timeOperation('AUTH', 'Sign In', async () => {
      try {`
  );
  
  // Update the end of signIn function
  authContent = authContent.replace(
    /} catch \(error: any\) {[\s\S]*?} finally {[\s\S]*?}/m,
    `} catch (error: any) {
      logError('AUTH', 'Sign in error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
    });
  }`
  );
  
  // Optimize the onAuthStateChanged handler
  authContent = authContent.replace(
    /const unsubscribe = onAuthStateChanged\(auth, async \(user\) => {[\s\S]*?}\);/m,
    `const unsubscribe = onAuthStateChanged(auth, async (user) => {
        authChangeCount++;
        const currentAuthChange = authChangeCount;
        
        log('AUTH', 'Auth State Changed', {
          user: user ? { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          } : null,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString(),
          changeCount: currentAuthChange
        });
        
        // Emergency fix: Prevent auto-login
        if (DISABLE_AUTO_LOGIN && user && window.location.pathname === "/") {
          log('AUTH', 'Auto-login prevented by emergency fix', null, 'warning');
          await firebaseSignOut(auth);
          return;
        }

        // Clear timeout since we got a response
        if (authTimeoutId) clearTimeout(authTimeoutId);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Reset Firebase error state
        setFirebaseError(false);
        
        if (user) {
          log('AUTH', 'Setting current user', { 
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          
          // Store auth session in localStorage for persistence
          try {
            localStorage.setItem('authSession', JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              timestamp: new Date().toISOString()
            }));
            log('AUTH', 'Stored auth session in localStorage');
          } catch (e) {
            logError('AUTH', 'Error storing auth session', e);
          }
          
          // Increased delay to ensure Firebase is fully initialized
          setTimeout(() => {
            if (isMounted) {
              setCurrentUser(user);
              log('AUTH', 'Current user set after delay');
            }
          }, 300); // Increased from 100ms to 300ms
          
          // Don't await checkUserApproval to prevent blocking
          checkUserApproval(user)
            .then(result => log('AUTH', 'User approval check completed', { result }))
            .catch(err => logError('AUTH', 'User approval check failed', err));
        } else {
          log('AUTH', 'Clearing current user');
          setCurrentUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      },
      (error) => logError('AUTH', 'Firebase auth error', error)
    );`
  );
  
  // Write updated content
  fs.writeFileSync(paths.authContext, authContent);
  console.log('Updated Auth Context');
}

// 4. Update Login Page
console.log('Updating Login Page...');
if (fs.existsSync(paths.loginPage)) {
  let loginContent = fs.readFileSync(paths.loginPage, 'utf8');
  
  // Add import for logger
  loginContent = loginContent.replace(
    'import { useAuth } from \'@/contexts/AuthContext\';',
    'import { useAuth } from \'@/contexts/AuthContext\';\nimport { log, logError, timeOperation } from \'@/utils/logger\';'
  );
  
  // Add import for lazy schema initialization
  loginContent = loginContent.replace(
    'import { useRouter } from \'next/navigation\';',
    'import { useRouter } from \'next/navigation\';\nimport { initializeSchemaIfNeeded } from \'@/lib/schema/initialize-schema\';'
  );
  
  // Replace console.log calls with logger
  loginContent = loginContent.replace(
    /console\.log\(['"]%c\[LOGIN\] (.+?)['"](.*?)\);/g,
    'log(\'LOGIN\', \'$1\'$2);'
  );
  
  // Replace console.error calls with logError
  loginContent = loginContent.replace(
    /console\.error\(['"](.+?)['"](.*?)\);/g,
    'logError(\'LOGIN\', \'$1\'$2);'
  );
  
  // Update handleSubmit function
  loginContent = loginContent.replace(
    /const handleSubmit = async \(e: React\.FormEvent\) => {[\s\S]*?try {/m,
    `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      log('LOGIN', 'Login already in progress, ignoring submit');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    log('LOGIN', 'Submit started', { email });
    
    return await timeOperation('LOGIN', 'Login attempt', async () => {
      try {`
  );
  
  // Update the successful login part
  loginContent = loginContent.replace(
    /const user = await signIn\(email, password\);[\s\S]*?setTimeout\(\(\) => {[\s\S]*?}, (\d+)\);/m,
    `const user = await signIn(email, password);
        
        log('LOGIN', 'Login successful', { 
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        
        // Store login success flag in sessionStorage
        sessionStorage.setItem('loginSuccess', 'true');
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // Determine redirect URL
        const redirectUrl = searchParams?.get('redirect') || '/dashboard';
        log('LOGIN', 'Redirect URL:', redirectUrl);
        
        // Set a more generous timeout for navigation
        log('LOGIN', 'Setting navigation timeout');
        setTimeout(() => {
          log('LOGIN', 'Navigation timeout fired');
          
          // Lazily initialize schema in background after successful login
          initializeSchemaIfNeeded()
            .then(() => log('LOGIN', 'Schema initialized in background'))
            .catch(err => logError('LOGIN', 'Background schema initialization failed', err));
          
          log('LOGIN', 'Navigating to dashboard');
          router.push(redirectUrl);
        }, 800);`
  );
  
  // Update the end of handleSubmit function
  loginContent = loginContent.replace(
    /} catch \(error: any\) {[\s\S]*?} finally {[\s\S]*?}/m,
    `} catch (error: any) {
        logError('LOGIN', 'Login error', error);
        setError(error.message || 'Failed to sign in');
        
        // Add analytics for login failures
        if (error.code) {
          log('LOGIN', \`Login failed with code: \${error.code}\`);
        }
      } finally {
        setIsSubmitting(false);
        log('LOGIN', 'Login attempt completed', { success: !error, email });
      }
    });
  }`
  );
  
  // Write updated content
  fs.writeFileSync(paths.loginPage, loginContent);
  console.log('Updated Login Page');
}

console.log('\nLogin flow optimization completed successfully!');
console.log('\nOptimizations implemented:');
console.log('1. Created a logger utility to reduce console logging in production');
console.log('2. Optimized schema initialization to reduce overhead during login');
console.log('3. Improved navigation timing to prevent race conditions');
console.log('4. Enhanced error handling and logging');
console.log('5. Added session storage for better state persistence');
console.log('\nNext steps:');
console.log('1. Test the login flow to ensure it works smoothly');
console.log('2. Check for any console errors during login');
console.log('3. Verify that the dashboard loads properly after login');
