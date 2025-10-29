/**
 * Remove CognitoAuthProvider References
 * 
 * This script removes all references to CognitoAuthProvider from layout files
 * and replaces them with direct children rendering.
 */

const fs = require('fs');
const path = require('path');

// Paths to files that need modification
const filePaths = {
  layoutTsx: path.resolve(process.cwd(), 'src/app/layout.tsx'),
  localeLayoutTsx: path.resolve(process.cwd(), 'src/app/locale-layout.tsx'),
  localeLayoutNewTsx: path.resolve(process.cwd(), 'src/app/locale-layout-new.tsx'),
  layoutTsxNew: path.resolve(process.cwd(), 'src/app/layout.tsx.new')
};

// Check if files exist and create backups
Object.entries(filePaths).forEach(([name, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.cognito-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${name} at ${backupPath}`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove import statement
    content = content.replace(/import\s+{\s*CognitoAuthProvider\s*}\s*from\s+['"]@\/lib\/auth\/CognitoAuthContext['"];?\n?/g, '');
    
    // Replace CognitoAuthProvider tags with their children
    content = content.replace(/<CognitoAuthProvider>\s*([\s\S]*?)\s*<\/CognitoAuthProvider>/g, '$1');
    
    // Write modified content back to file
    fs.writeFileSync(filePath, content);
    console.log(`Removed CognitoAuthProvider references from ${name}`);
  } else {
    console.log(`File ${name} not found at ${filePath}`);
  }
});

console.log('\nSuccessfully removed CognitoAuthProvider references');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Test the application to ensure everything works correctly');
