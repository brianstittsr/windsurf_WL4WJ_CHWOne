/**
 * Next.js Rebuild Script
 * 
 * This script performs a complete rebuild of the Next.js application:
 * 1. Deletes the .next directory to clear the build cache
 * 2. Deletes node_modules/.cache to clear module cache
 * 3. Runs next build to create a fresh build
 * 
 * Usage: node scripts/rebuild-nextjs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const rimraf = require('rimraf');

console.log('Starting Next.js rebuild process...');

// Function to delete directory if it exists
function deleteDirectory(dirPath) {
  const fullPath = path.resolve(process.cwd(), dirPath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Deleting ${dirPath}...`);
    rimraf.sync(fullPath);
    console.log(`Successfully deleted ${dirPath}`);
  } else {
    console.log(`Directory ${dirPath} does not exist, skipping`);
  }
}

try {
  // Step 1: Delete .next directory
  deleteDirectory('.next');
  
  // Step 2: Delete node_modules/.cache
  deleteDirectory('node_modules/.cache');
  
  // Step 3: Run next build
  console.log('Running next build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\nRebuild completed successfully!');
  console.log('You can now run npm run dev to start the development server');
} catch (error) {
  console.error('Error during rebuild process:', error.message);
  process.exit(1);
}
