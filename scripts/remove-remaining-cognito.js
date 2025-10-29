/**
 * Remove Remaining Cognito References
 * 
 * This script searches for and removes any remaining Cognito references
 * in the codebase using a Windows-friendly approach.
 */

const fs = require('fs');
const path = require('path');

// Main directories to check
const directories = [
  'src/contexts',
  'src/lib/auth',
  'src/components',
  'src/app',
  'src/services',
  'src/utils'
];

console.log('Starting removal of remaining Cognito references...');

// Function to search for files with Cognito references
function searchForCognitoReferences() {
  const filesWithCognitoReferences = [];
  
  // Manual search
  const searchDirectory = (dir) => {
    const fullDir = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) {
      console.log(`Directory not found: ${fullDir}`);
      return;
    }
    
    console.log(`Searching directory: ${dir}`);
    
    try {
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(fullDir, entry.name);
        
        if (entry.isDirectory()) {
          searchDirectory(path.join(dir, entry.name));
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('cognito')) {
              console.log(`Found Cognito reference in: ${fullPath}`);
              filesWithCognitoReferences.push(fullPath);
            }
          } catch (err) {
            console.error(`Error reading file ${fullPath}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${fullDir}:`, err.message);
    }
  };
  
  directories.forEach(searchDirectory);
  return filesWithCognitoReferences;
}

// Process found files
const filesWithCognitoReferences = searchForCognitoReferences();
console.log(`Found ${filesWithCognitoReferences.length} files with Cognito references`);

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
    
    // Replace any mentions of Cognito with Firebase
    content = content.replace(/cognito/gi, 'firebase');
    
    // Write the updated content back
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
});

// Check and update .env.template file
const envTemplatePath = path.resolve(process.cwd(), '.env.template');
if (fs.existsSync(envTemplatePath)) {
  try {
    console.log('Updating .env.template...');
    let envContent = fs.readFileSync(envTemplatePath, 'utf8');
    
    // Remove Cognito-related environment variables
    envContent = envContent.replace(/NEXT_PUBLIC_AUTH_PROVIDER=.*\n/g, 'NEXT_PUBLIC_AUTH_PROVIDER=firebase\n');
    envContent = envContent.replace(/NEXT_PUBLIC_COGNITO_.*=.*\n/g, '');
    envContent = envContent.replace(/COGNITO_.*=.*\n/g, '');
    
    fs.writeFileSync(envTemplatePath, envContent);
    console.log('Updated .env.template to remove Cognito variables');
  } catch (error) {
    console.error('Error updating .env.template:', error.message);
  }
}

// Check for any AWS-related packages in package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const packagesToRemove = [
      'amazon-cognito-identity-js',
      'aws-amplify',
      '@aws-amplify/auth',
      '@aws-sdk/client-cognito-identity-provider'
    ];
    
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
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Updated package.json to remove Cognito dependencies');
    } else {
      console.log('No Cognito dependencies found in package.json');
    }
  } catch (error) {
    console.error('Error updating package.json:', error.message);
  }
}

// Check for auth-test page that might reference Cognito
const authTestPath = path.resolve(process.cwd(), 'src/app/auth-test/page.tsx');
if (fs.existsSync(authTestPath)) {
  try {
    console.log('Updating auth-test page...');
    let authTestContent = fs.readFileSync(authTestPath, 'utf8');
    
    // Create backup
    const backupPath = `${authTestPath}.cognito-removal-backup`;
    fs.copyFileSync(authTestPath, backupPath);
    
    // Replace Cognito references with Firebase
    authTestContent = authTestContent.replace(/cognito/gi, 'firebase');
    authTestContent = authTestContent.replace(/aws/gi, 'firebase');
    
    fs.writeFileSync(authTestPath, authTestContent);
    console.log('Updated auth-test page to remove Cognito references');
  } catch (error) {
    console.error('Error updating auth-test page:', error.message);
  }
}

console.log('\nRemoval of remaining Cognito references completed successfully!');
console.log('\nNext steps:');
console.log('1. Run "npm install" to update dependencies');
console.log('2. Start your development server to test the changes');
console.log('3. Test the login functionality to ensure it works with Firebase only');
