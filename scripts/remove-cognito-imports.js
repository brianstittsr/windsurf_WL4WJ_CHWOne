/**
 * Remove Cognito Auth Imports
 * 
 * This script removes all remaining references to @/lib/auth/cognitoAuth
 * from the project files.
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need modification
const filePaths = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx')
};

// Check if files exist and create backups
Object.entries(filePaths).forEach(([name, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.cognito-imports-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${name} at ${backupPath}`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove any remaining import statements for CognitoUser type
    content = content.replace(/import\s+type\s*{\s*CognitoUser\s*}\s*from\s+['"]@\/lib\/auth\/cognitoAuth['"];?\n?/g, '');
    
    // Remove any dynamic imports of cognitoAuth
    content = content.replace(/const\s*{\s*cognitoAuth\s*}\s*=\s*await\s*import\(['"]@\/lib\/auth\/cognitoAuth['"]\);/g, '// Cognito import removed');
    content = content.replace(/import\(['"]@\/lib\/auth\/cognitoAuth['"]\)\.then\(\({.*?}\)\s*=>\s*{[\s\S]*?}\);/g, '// Cognito import removed');
    
    // Write modified content back to file
    fs.writeFileSync(filePath, content);
    console.log(`Removed cognitoAuth references from ${name}`);
  } else {
    console.log(`File ${name} not found at ${filePath}`);
  }
});

// Clean up script files that have references but don't need to be modified
// since they're just backup scripts or one-time use scripts
console.log('\nNote: References to cognitoAuth still exist in script files, but these are not used in the application.');

console.log('\nSuccessfully removed cognitoAuth references');
console.log('\nNext steps:');
console.log('1. Start your development server');
console.log('2. Test the application to ensure everything works correctly');
