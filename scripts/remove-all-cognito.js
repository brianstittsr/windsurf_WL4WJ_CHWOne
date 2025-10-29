/**
 * Remove All Cognito Authentication
 * 
 * This script completely removes all Cognito authentication from the codebase.
 * It ensures that only Firebase authentication is used throughout the application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main directories to check
const directories = [
  'src/contexts',
  'src/lib/auth',
  'src/components',
  'src/app',
  'src/services',
  'src/utils'
];

// Files that need to be checked/modified
const criticalFiles = {
  authContext: path.resolve(process.cwd(), 'src/contexts/AuthContext.tsx'),
  envTemplate: path.resolve(process.cwd(), 'src/.env.template'),
  packageJson: path.resolve(process.cwd(), 'package.json'),
  appLayout: path.resolve(process.cwd(), 'src/app/layout.tsx')
};

// Files to be deleted
const filesToDelete = [
  'src/lib/auth/CognitoAuthContext.tsx',
  'src/lib/auth/cognitoAuth.ts',
  'src/lib/auth/AuthInterface.ts',
  'src/lib/auth/CognitoAuthContext.tsx.backup',
  'src/lib/auth/cognitoAuth.ts.backup'
];

// Packages to be removed
const packagesToRemove = [
  'amazon-cognito-identity-js',
  'aws-amplify',
  '@aws-amplify/auth',
  '@aws-sdk/client-cognito-identity-provider'
];

console.log('Starting removal of all Cognito authentication...');

// 1. Create backups of critical files
Object.entries(criticalFiles).forEach(([name, filePath]) => {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.cognito-removal-backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${name} at ${backupPath}`);
  } else {
    console.log(`Warning: ${name} not found at ${filePath}`);
  }
});

// 2. Remove Cognito-related files
filesToDelete.forEach(fileToDelete => {
  const fullPath = path.resolve(process.cwd(), fileToDelete);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Deleted ${fileToDelete}`);
  } else {
    console.log(`File ${fileToDelete} not found, skipping deletion`);
  }
});

// 3. Update AuthContext.tsx to remove any remaining Cognito references
if (fs.existsSync(criticalFiles.authContext)) {
  let authContextContent = fs.readFileSync(criticalFiles.authContext, 'utf8');
  
  // Replace any remaining Cognito references
  authContextContent = authContextContent.replace(/cognito/gi, 'firebase');
  authContextContent = authContextContent.replace(/aws/gi, 'firebase');
  
  // Ensure AUTH_PROVIDER is set to firebase
  authContextContent = authContextContent.replace(
    /const AUTH_PROVIDER = .*?;/,
    "const AUTH_PROVIDER = 'firebase';"
  );
  
  // Remove any dynamic imports that might be related to Cognito
  authContextContent = authContextContent.replace(
    /const { .*? } = await import\(['"]@\/lib\/auth\/.*?['"]\);/g,
    ''
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(criticalFiles.authContext, authContextContent);
  console.log('Updated AuthContext.tsx to remove Cognito references');
}

// 4. Update package.json to remove Cognito-related dependencies
if (fs.existsSync(criticalFiles.packageJson)) {
  const packageJson = JSON.parse(fs.readFileSync(criticalFiles.packageJson, 'utf8'));
  
  let dependenciesModified = false;
  
  // Check and remove dependencies
  if (packageJson.dependencies) {
    packagesToRemove.forEach(pkg => {
      if (packageJson.dependencies[pkg]) {
        delete packageJson.dependencies[pkg];
        dependenciesModified = true;
        console.log(`Removed ${pkg} from dependencies`);
      }
    });
  }
  
  // Check and remove devDependencies
  if (packageJson.devDependencies) {
    packagesToRemove.forEach(pkg => {
      if (packageJson.devDependencies[pkg]) {
        delete packageJson.devDependencies[pkg];
        dependenciesModified = true;
        console.log(`Removed ${pkg} from devDependencies`);
      }
    });
  }
  
  if (dependenciesModified) {
    fs.writeFileSync(criticalFiles.packageJson, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json to remove Cognito dependencies');
  } else {
    console.log('No Cognito dependencies found in package.json');
  }
}

// 5. Update app layout to remove any Cognito-related code
if (fs.existsSync(criticalFiles.appLayout)) {
  let layoutContent = fs.readFileSync(criticalFiles.appLayout, 'utf8');
  
  // Remove any Cognito-related imports
  layoutContent = layoutContent.replace(/import.*?from ['"]@\/lib\/auth\/CognitoAuthContext['"];?\n?/g, '');
  layoutContent = layoutContent.replace(/import.*?from ['"]@\/lib\/auth\/cognitoAuth['"];?\n?/g, '');
  
  // Remove any Cognito provider components
  layoutContent = layoutContent.replace(/<CognitoAuthProvider>[\s\S]*?<\/CognitoAuthProvider>/g, '');
  
  // Write the updated content back to the file
  fs.writeFileSync(criticalFiles.appLayout, layoutContent);
  console.log('Updated app layout to remove Cognito references');
}

// 6. Search for and update any remaining files with Cognito references
let filesWithCognitoReferences = [];

try {
  // Use grep to find files with Cognito references
  directories.forEach(dir => {
    try {
      const fullDir = path.resolve(process.cwd(), dir);
      if (fs.existsSync(fullDir)) {
        const output = execSync(`grep -l -i "cognito" ${fullDir}/**/*.{ts,tsx,js,jsx} 2>/dev/null || true`, { encoding: 'utf8' });
        if (output.trim()) {
          filesWithCognitoReferences = [...filesWithCognitoReferences, ...output.trim().split('\n')];
        }
      }
    } catch (error) {
      console.error(`Error searching directory ${dir}:`, error.message);
    }
  });
} catch (error) {
  console.error('Error using grep:', error.message);
  console.log('Falling back to manual file search...');
  
  // Manual search as fallback
  const searchDirectory = (dir) => {
    const fullDir = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) return;
    
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(fullDir, entry.name);
      
      if (entry.isDirectory()) {
        searchDirectory(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes('cognito')) {
            filesWithCognitoReferences.push(fullPath);
          }
        } catch (err) {
          console.error(`Error reading file ${fullPath}:`, err.message);
        }
      }
    }
  };
  
  directories.forEach(searchDirectory);
}

// Process found files
console.log(`Found ${filesWithCognitoReferences.length} files with potential Cognito references`);

filesWithCognitoReferences.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  console.log(`Processing ${filePath}...`);
  
  try {
    // Create backup
    const backupPath = `${filePath}.cognito-removal-backup`;
    fs.copyFileSync(filePath, backupPath);
    
    // Read and modify content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Cognito imports
    content = content.replace(/import.*?from ['"]@\/lib\/auth\/CognitoAuthContext['"];?\n?/g, '');
    content = content.replace(/import.*?from ['"]@\/lib\/auth\/cognitoAuth['"];?\n?/g, '');
    content = content.replace(/import.*?from ['"]@\/lib\/auth\/AuthInterface['"];?\n?/g, '');
    content = content.replace(/import.*?from ['"]amazon-cognito-identity-js['"];?\n?/g, '');
    content = content.replace(/import.*?from ['"]aws-amplify['"];?\n?/g, '');
    content = content.replace(/import.*?from ['"]@aws-amplify\/auth['"];?\n?/g, '');
    
    // Remove Cognito-specific code blocks
    content = content.replace(/\/\/ Cognito-specific code[\s\S]*?\/\/ End Cognito-specific code/g, '');
    
    // Replace any conditional auth provider checks with direct Firebase usage
    content = content.replace(/if\s*\(authProvider\s*===\s*['"]cognito['"]\)\s*{[\s\S]*?}\s*else\s*{([\s\S]*?)}/g, '$1');
    
    // Write the updated content back
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
});

// 7. Update .env.local to remove Cognito variables (if we have access)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  try {
    console.log('Updating .env.local...');
    let envContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // Remove Cognito-related environment variables
    envContent = envContent.replace(/NEXT_PUBLIC_AUTH_PROVIDER=.*\n/g, 'NEXT_PUBLIC_AUTH_PROVIDER=firebase\n');
    envContent = envContent.replace(/NEXT_PUBLIC_COGNITO_.*=.*\n/g, '');
    envContent = envContent.replace(/COGNITO_.*=.*\n/g, '');
    
    fs.writeFileSync(envLocalPath, envContent);
    console.log('Updated .env.local to remove Cognito variables');
  } catch (error) {
    console.error('Error updating .env.local:', error.message);
  }
}

// 8. Update .env.template to remove Cognito variables
if (fs.existsSync(criticalFiles.envTemplate)) {
  try {
    console.log('Updating .env.template...');
    let envContent = fs.readFileSync(criticalFiles.envTemplate, 'utf8');
    
    // Remove Cognito-related environment variables
    envContent = envContent.replace(/NEXT_PUBLIC_AUTH_PROVIDER=.*\n/g, 'NEXT_PUBLIC_AUTH_PROVIDER=firebase\n');
    envContent = envContent.replace(/NEXT_PUBLIC_COGNITO_.*=.*\n/g, '');
    envContent = envContent.replace(/COGNITO_.*=.*\n/g, '');
    
    fs.writeFileSync(criticalFiles.envTemplate, envContent);
    console.log('Updated .env.template to remove Cognito variables');
  } catch (error) {
    console.error('Error updating .env.template:', error.message);
  }
}

console.log('\nCognito removal completed successfully!');
console.log('\nNext steps:');
console.log('1. Run "npm install" to update dependencies');
console.log('2. Start your development server to test the changes');
console.log('3. Test the login functionality to ensure it works with Firebase only');
