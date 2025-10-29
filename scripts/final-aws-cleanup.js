/**
 * Final AWS Cleanup
 * 
 * This script removes all remaining AWS/Cognito code from AuthContext.tsx
 * and ensures the application uses only Firebase authentication.
 */

const fs = require('fs');
const path = require('path');

// Path to AuthContext.tsx
const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');

// Check if file exists
if (!fs.existsSync(authContextPath)) {
  console.error('AuthContext.tsx not found at path:', authContextPath);
  process.exit(1);
}

// Create backup
const backupPath = `${authContextPath}.final-backup`;
fs.copyFileSync(authContextPath, backupPath);
console.log(`Created backup of AuthContext.tsx at ${backupPath}`);

// Read file content
let content = fs.readFileSync(authContextPath, 'utf8');

// 1. Remove checkCognitoAvailability function and references
content = content.replace(/const checkCognitoAvailability = async \(\) => {[\s\S]*?};/g, '');

// 2. Replace the signIn function with a Firebase-only version
content = content.replace(
  /const signIn = async \(email: string, password: string\) => {[\s\S]*?try {[\s\S]*?\/\/ Check if Cognito is available[\s\S]*?const useCognito = await checkCognitoAvailability\(\);[\s\S]*?if \(useCognito\) {[\s\S]*?\/\/ Use Cognito auth[\s\S]*?\/\/ Cognito import removed[\s\S]*?const user = await cognitoAuth\.signIn\(email, password\);[\s\S]*?setAuthProvider\('cognito'\);[\s\S]*?return user;[\s\S]*?} else {[\s\S]*?(\/\/ Use Firebase auth[\s\S]*?})[\s\S]*?} catch/,
  
  `const signIn = async (email: string, password: string) => {
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
      $1
    } catch`
);

// 3. Remove Cognito check from useEffect
content = content.replace(
  /\/\/ Firebase-only authentication - no Cognito check needed/g,
  '// Firebase-only authentication'
);

// Write modified content back to file
fs.writeFileSync(authContextPath, content);
console.log('Successfully removed all AWS login code from AuthContext.tsx');

console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Test the login functionality');
