/**
 * Remove AWS Resources
 * 
 * This script removes all AWS/Cognito related code and settings from the project,
 * focusing the authentication solely on Firebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to files that need modification
const filePaths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  packageJson: path.resolve(process.cwd(), 'package.json'),
  envTemplate: path.resolve(process.cwd(), '.env.template')
};

// Check if files exist
Object.entries(filePaths).forEach(([name, path]) => {
  if (!fs.existsSync(path)) {
    console.error(`${name} not found at path: ${path}`);
    process.exit(1);
  }
});

// Create backups
Object.entries(filePaths).forEach(([name, path]) => {
  const backupPath = `${path}.aws-backup`;
  fs.copyFileSync(path, backupPath);
  console.log(`Created backup of ${name} at ${backupPath}`);
});

// 1. Update AuthContext.tsx to remove all AWS/Cognito code
let authContextContent = fs.readFileSync(filePaths.authContext, 'utf8');

// Remove Cognito imports and type definitions
authContextContent = authContextContent.replace(
  `// Import CognitoUser type
import type { CognitoUser } from '@/lib/auth/cognitoAuth';`,
  
  `// Cognito removed - Firebase only authentication`
);

// Update AuthContextType to remove Cognito references
authContextContent = authContextContent.replace(
  `interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User | CognitoUser>;
  signInWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<User | any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  authProvider: string;
  firebaseError: boolean;
}`,
  
  `interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  authProvider: string;
  firebaseError: boolean;
}`
);

// Remove Cognito availability check variables and functions
authContextContent = authContextContent.replace(
  `// COGNITO DISABLED - Using Firebase authentication only
let isCognitoEnabled = false;
let cognitoAvailabilityChecked = true;

// Force Firebase authentication
const AUTH_PROVIDER = 'firebase';
const USE_COGNITO = false;

// Explicitly disable Cognito credentials check
const hasCognitoCredentials = false;

// Cognito availability check - always returns false since Cognito is disabled
const checkCognitoAvailability = async () => {
  // Always return false - Cognito is disabled
  return false;
};`,
  
  `// Firebase-only authentication
const AUTH_PROVIDER = 'firebase';`
);

// Simplify signIn function to remove Cognito code
authContextContent = authContextContent.replace(
  `// Sign in with email and password
  const signIn = async (email: string, password: string) => {
    // Debug logging
    console.log('%c[AUTH] Sign In Attempt', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;');
    console.log('%c[AUTH] Credentials:', 'color: #1a365d;', { email, passwordLength: password?.length });
    console.log('%c[AUTH] Auth state before sign in:', 'color: #1a365d;', { 
      currentUser: currentUser?.email || null,
      loading,
      error,
      authProvider
    });
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        const user = await cognitoAuth.signIn(email, password);
        setAuthProvider('cognito');
        return user;
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        const result = await signInWithEmailAndPassword(auth, email, password);
        setAuthProvider('firebase');
        return result.user;
      }
    } catch (error: any) {
      console.error('%c[AUTH] Sign in error:', 'background: red; color: white; padding: 2px 4px; border-radius: 2px;', {
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
  };`,
  
  `// Sign in with email and password
  const signIn = async (email: string, password: string) => {
    // Debug logging
    console.log('%c[AUTH] Sign In Attempt', 'background: #1a365d; color: white; padding: 2px 4px; border-radius: 2px;');
    console.log('%c[AUTH] Credentials:', 'color: #1a365d;', { email, passwordLength: password?.length });
    console.log('%c[AUTH] Auth state before sign in:', 'color: #1a365d;', { 
      currentUser: currentUser?.email || null,
      loading,
      error,
      authProvider
    });
    setLoading(true);
    setError(null);
    
    try {
      // Use Firebase auth
      if (!auth || !isValidConfig) {
        const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      setAuthProvider('firebase');
      return result.user;
    } catch (error: any) {
      console.error('%c[AUTH] Sign in error:', 'background: red; color: white; padding: 2px 4px; border-radius: 2px;', {
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
  };`
);

// Simplify signUp function to remove Cognito code
authContextContent = authContextContent.replace(
  `// Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string, role: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        const user = await cognitoAuth.signUp(email, password, { given_name: displayName, role });
        setAuthProvider('cognito');
        
        // Create user profile
        await safeUpdateDocument('users', user.uid, {
          email,
          displayName,
          role,
          approved: false,
          createdAt: new Date().toISOString()
        });
        
        return user;
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await firebaseUpdateProfile(result.user, { displayName });
        
        // Create user profile
        await safeUpdateDocument('users', result.user.uid, {
          email,
          displayName,
          role,
          approved: false,
          createdAt: new Date().toISOString()
        });
        
        return result.user;
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };`,
  
  `// Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string, role: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Firebase auth
      if (!auth || !isValidConfig) {
        const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await firebaseUpdateProfile(result.user, { displayName });
      
      // Create user profile
      await safeUpdateDocument('users', result.user.uid, {
        email,
        displayName,
        role,
        approved: false,
        createdAt: new Date().toISOString()
      });
      
      return result.user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };`
);

// Simplify signOut function to remove Cognito code
authContextContent = authContextContent.replace(
  `// Sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (authProvider === 'cognito') {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        await cognitoAuth.signOut();
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        await firebaseSignOut(auth);
      }
      
      setCurrentUser(null);
      setUserProfile(null);
      
      // Clear session timeout
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };`,
  
  `// Sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Firebase auth
      if (!auth || !isValidConfig) {
        const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      await firebaseSignOut(auth);
      
      setCurrentUser(null);
      setUserProfile(null);
      
      // Clear session timeout
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };`
);

// Simplify resetPassword function to remove Cognito code
authContextContent = authContextContent.replace(
  `// Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Cognito is available
      const useCognito = await checkCognitoAvailability();
      
      if (useCognito) {
        // Use Cognito auth
        const { cognitoAuth } = await import('@/lib/auth/cognitoAuth');
        await cognitoAuth.forgotPassword(email);
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        await sendPasswordResetEmail(auth, email);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };`,
  
  `// Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Firebase auth
      if (!auth || !isValidConfig) {
        const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };`
);

// Remove Cognito check from useEffect
authContextContent = authContextContent.replace(
  `// Check if Cognito is available
    checkCognitoAvailability().then(available => {
      if (available) {
        // Set up Cognito auth listener
        import('@/lib/auth/cognitoAuth').then(({ cognitoAuth }) => {
          // Check for existing Cognito session
          cognitoAuth.getCurrentUser().then(user => {
            if (user) {
              setCurrentUser(user as unknown as User);
              setAuthProvider('cognito');
            }
            setLoading(false);
          });
        });
      }
    });`,
  
  `// Firebase-only authentication - no Cognito check needed`
);

// 2. Update package.json to remove AWS dependencies
let packageJsonContent = fs.readFileSync(filePaths.packageJson, 'utf8');
const packageJson = JSON.parse(packageJsonContent);

// List of AWS/Cognito related dependencies to remove
const awsDependencies = [
  'amazon-cognito-identity-js',
  'aws-amplify',
  'aws-sdk',
  '@aws-sdk/client-cognito-identity-provider',
  '@aws-sdk/client-s3',
  '@aws-amplify/auth'
];

// Remove AWS dependencies
let dependenciesRemoved = false;
awsDependencies.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    dependenciesRemoved = true;
    console.log(`Removed dependency: ${dep}`);
  }
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep];
    dependenciesRemoved = true;
    console.log(`Removed dev dependency: ${dep}`);
  }
});

// Write updated package.json
fs.writeFileSync(filePaths.packageJson, JSON.stringify(packageJson, null, 2));

// 3. Update .env.template to remove AWS environment variables
let envTemplateContent = fs.readFileSync(filePaths.envTemplate, 'utf8');

// Remove AWS/Cognito related environment variables
envTemplateContent = envTemplateContent.replace(/# AWS Cognito Configuration[\s\S]*?(?=\n\n|$)/g, '');
envTemplateContent = envTemplateContent.replace(/# AWS S3 Configuration[\s\S]*?(?=\n\n|$)/g, '');
envTemplateContent = envTemplateContent.replace(/NEXT_PUBLIC_AUTH_PROVIDER=.*\n/, '');

// Write updated .env.template
fs.writeFileSync(filePaths.envTemplate, envTemplateContent);

// 4. Create a .env.local update script
const envLocalScript = `
# This script will update your .env.local file to remove AWS settings
# Run this script with: source ./update-env-local.sh

# Create backup of current .env.local
cp .env.local .env.local.aws-backup

# Remove AWS/Cognito related environment variables
sed -i '/^AWS_/d' .env.local
sed -i '/^NEXT_PUBLIC_AWS_/d' .env.local
sed -i '/^NEXT_PUBLIC_AUTH_PROVIDER=/d' .env.local
sed -i '/^COGNITO_/d' .env.local
sed -i '/^NEXT_PUBLIC_COGNITO_/d' .env.local

echo "Updated .env.local to remove AWS settings"
`;

fs.writeFileSync(path.resolve(process.cwd(), 'update-env-local.sh'), envLocalScript);
console.log('Created update-env-local.sh script to update your .env.local file');

// 5. Create a Windows batch version of the env update script
const envLocalBatchScript = `
@echo off
REM This script will update your .env.local file to remove AWS settings

REM Create backup of current .env.local
copy .env.local .env.local.aws-backup

REM Create a temporary file
type .env.local | findstr /v "^AWS_ ^NEXT_PUBLIC_AWS_ ^NEXT_PUBLIC_AUTH_PROVIDER= ^COGNITO_ ^NEXT_PUBLIC_COGNITO_" > .env.local.temp

REM Replace the original file
move /y .env.local.temp .env.local

echo Updated .env.local to remove AWS settings
`;

fs.writeFileSync(path.resolve(process.cwd(), 'update-env-local.bat'), envLocalBatchScript);
console.log('Created update-env-local.bat script to update your .env.local file');

// Write the modified content back to the files
fs.writeFileSync(filePaths.authContext, authContextContent);

console.log('\nSuccessfully removed AWS/Cognito code from the project');
console.log('\nNext steps:');
console.log('1. Run the update-env-local.bat script to update your .env.local file');
console.log('2. If you installed AWS dependencies, run: npm uninstall amazon-cognito-identity-js aws-amplify aws-sdk @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3 @aws-amplify/auth');
console.log('3. Restart your development server');
