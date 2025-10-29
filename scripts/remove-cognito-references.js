/**
 * Remove Cognito References from AuthContext
 * 
 * This script removes all Cognito auth references that are causing build errors
 */

const fs = require('fs');
const path = require('path');

console.log('Removing Cognito references from AuthContext...');

const authContextPath = path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx');

if (fs.existsSync(authContextPath)) {
  let content = fs.readFileSync(authContextPath, 'utf8');
  
  // Remove import statement for CognitoUser type
  content = content.replace(/import type \{ CognitoUser \} from '@\/lib\/auth\/cognitoAuth';\n/g, '');
  
  // Remove cognitoAuth imports
  content = content.replace(/import \{ cognitoAuth \} from '@\/lib\/auth\/cognitoAuth';\n/g, '');
  
  // Remove any dynamic imports of cognitoAuth
  content = content.replace(/const \{ cognitoAuth \} = await import\('@\/lib\/auth\/cognitoAuth'\);/g, '// Cognito removed');
  content = content.replace(/const \{ checkCognitoAvailability \} = await import\('@\/lib\/auth\/cognitoAuth'\);/g, '// Cognito removed');
  content = content.replace(/const \{ signIn: cognitoSignIn \} = await import\('@\/lib\/auth\/cognitoAuth'\);/g, '// Cognito removed');
  content = content.replace(/const \{ signUp: cognitoSignUp \} = await import\('@\/lib\/auth\/cognitoAuth'\);/g, '// Cognito removed');
  content = content.replace(/const \{ signOut: cognitoSignOut \} = await import\('@\/lib\/auth\/cognitoAuth'\);/g, '// Cognito removed');
  content = content.replace(/const \{ resetPassword: cognitoResetPassword \} = await import\('@\/lib\/auth\/cognitoAuth'\);/g, '// Cognito removed');
  content = content.replace(/import\('@\/lib\/auth\/cognitoAuth'\)\.then\([^)]+\);/g, '// Cognito removed');
  
  fs.writeFileSync(authContextPath, content);
  console.log('✓ Removed Cognito references');
} else {
  console.log('✗ AuthContext file not found');
}

console.log('\nDone!');
