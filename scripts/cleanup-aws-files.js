/**
 * Cleanup AWS Files
 * 
 * This script removes AWS/Cognito related files that are no longer needed
 * after removing AWS integration from the project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of directories and files to remove
const pathsToRemove = [
  // AWS deployment directory
  'aws-deployment',
  
  // Cognito auth files
  'src/lib/auth/cognitoAuth.ts',
  'src/lib/auth/CognitoAuthContext.tsx',
  
  // S3 service
  'src/services/s3Service.ts',
  
  // Auth interface (only needed for multi-provider support)
  'src/lib/auth/AuthInterface.ts',
  
  // AWS-specific scripts
  'scripts/disable-cognito.js'
];

// Check each path and remove if it exists
pathsToRemove.forEach(relativePath => {
  const fullPath = path.resolve(process.cwd(), relativePath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Create a backup of the directory
      const backupPath = `${fullPath}.backup`;
      
      try {
        // Use robocopy for directory backup on Windows
        execSync(`robocopy "${fullPath}" "${backupPath}" /E /NFL /NDL /NJH /NJS /nc /ns /np`);
        console.log(`Created backup of directory: ${relativePath} at ${backupPath}`);
        
        // Remove the directory
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed directory: ${relativePath}`);
      } catch (error) {
        console.error(`Error processing directory ${relativePath}:`, error);
      }
    } else {
      // Create a backup of the file
      const backupPath = `${fullPath}.backup`;
      fs.copyFileSync(fullPath, backupPath);
      console.log(`Created backup of file: ${relativePath} at ${backupPath}`);
      
      // Remove the file
      fs.unlinkSync(fullPath);
      console.log(`Removed file: ${relativePath}`);
    }
  } else {
    console.log(`Path not found (skipping): ${relativePath}`);
  }
});

console.log('\nSuccessfully cleaned up AWS/Cognito related files');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Test the application to ensure everything works correctly');
