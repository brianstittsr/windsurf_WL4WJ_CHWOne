/**
 * Fix Auth Redirect Issues
 * 
 * This script modifies the AuthContext.tsx file to fix issues with login redirects
 * by adding console logs and ensuring the router navigation works correctly.
 */

const fs = require('fs');
const path = require('path');

// Path to AuthContext.tsx
const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');

// Check if the file exists
if (!fs.existsSync(authContextPath)) {
  console.error('AuthContext.tsx not found at path:', authContextPath);
  process.exit(1);
}

// Read the current content
let content = fs.readFileSync(authContextPath, 'utf8');

// Find the signIn function and add debugging
const signInFunctionRegex = /const signIn = async \(email: string, password: string\) => \{[\s\S]*?finally \{[\s\S]*?\}/g;
const updatedSignInFunction = `const signIn = async (email: string, password: string) => {
    // Debug logging
    console.log('Auth attempt with:', email);
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
        console.log('Cognito auth successful:', user);
        return user;
      } else {
        // Use Firebase auth
        if (!auth || !isValidConfig) {
          const errorMessage = 'Firebase authentication is not properly configured. Please check your environment variables.';
          console.error(errorMessage);
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        
        console.log('Attempting Firebase auth with:', auth);
        const result = await signInWithEmailAndPassword(auth, email, password);
        setAuthProvider('firebase');
        console.log('Firebase auth successful:', result.user.email);
        return result.user;
      }
    } catch (error: any) {
      console.error('Sign in error:', error.code, error.message, error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };`;

// Replace the signIn function
content = content.replace(signInFunctionRegex, updatedSignInFunction);

// Find the login page handleSubmit function and modify it
const loginPagePath = path.resolve(process.cwd(), 'src/app/login/page.tsx');

if (fs.existsSync(loginPagePath)) {
  let loginContent = fs.readFileSync(loginPagePath, 'utf8');
  
  // Find the handleSubmit function
  const handleSubmitRegex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{[\s\S]*?\}/g;
  const updatedHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Login attempt with:', email);

    try {
      const user = await signIn(email, password);
      console.log('Login successful, user:', user?.email);
      
      // Check if there's a redirect URL in session storage
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      console.log('Redirect URL:', redirectUrl || '/dashboard');
      
      // Force a small delay to ensure auth state is updated
      setTimeout(() => {
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/dashboard';
        }
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };`;
  
  // Replace the handleSubmit function
  loginContent = loginContent.replace(handleSubmitRegex, updatedHandleSubmit);
  
  // Write the updated content back to the file
  fs.writeFileSync(loginPagePath, loginContent);
  console.log('Updated login page with improved redirect handling');
}

// Write the updated content back to the file
fs.writeFileSync(authContextPath, content);

console.log('Updated AuthContext.tsx with improved debugging and error handling');
console.log('Please restart your development server for changes to take effect');
