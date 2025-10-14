// This script helps clear the Next.js build cache
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Clearing Next.js build cache...');

// Path to .next directory
const nextDir = path.join(__dirname, '.next');

// Check if .next directory exists
if (fs.existsSync(nextDir)) {
  try {
    // Remove .next directory
    if (process.platform === 'win32') {
      // Windows
      execSync(`rmdir /s /q "${nextDir}"`, { stdio: 'inherit' });
    } else {
      // Unix-like
      execSync(`rm -rf "${nextDir}"`, { stdio: 'inherit' });
    }
    console.log('.next directory removed successfully.');
  } catch (error) {
    console.error('Error removing .next directory:', error);
  }
} else {
  console.log('.next directory does not exist.');
}

// Clear node_modules/.cache
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  try {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cacheDir}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cacheDir}"`, { stdio: 'inherit' });
    }
    console.log('node_modules/.cache directory removed successfully.');
  } catch (error) {
    console.error('Error removing node_modules/.cache directory:', error);
  }
} else {
  console.log('node_modules/.cache directory does not exist.');
}

console.log('Cache clearing complete. Please restart your development server with:');
console.log('npm run dev');
