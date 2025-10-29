/**
 * Script to clear Next.js cache and rebuild
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to delete a directory recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    console.log(`Deleting folder: ${folderPath}`);
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Deleted folder: ${folderPath}`);
  } else {
    console.log(`Folder does not exist: ${folderPath}`);
  }
}

try {
  console.log('Starting cache clear and rebuild process...');
  
  // Delete .next directory
  const nextDir = path.join(__dirname, '.next');
  deleteFolderRecursive(nextDir);
  
  // Clear npm cache
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  
  // Install dependencies
  console.log('Reinstalling dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build the application
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Process completed successfully!');
} catch (error) {
  console.error('Error during process:', error);
  process.exit(1);
}
