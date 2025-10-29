/**
 * Fix Build Cache Corruption in Next.js
 * 
 * This script:
 * 1. Cleans the Next.js build cache (.next directory)
 * 2. Cleans node_modules/.cache directory
 * 3. Reinstalls dependencies if needed
 * 4. Rebuilds the application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Paths
const rootDir = path.resolve(__dirname, '..');
const nextCacheDir = path.join(rootDir, '.next');
const nodeModulesCacheDir = path.join(rootDir, 'node_modules', '.cache');

console.log(chalk.blue('🔧 Starting build cache fix process...'));

// Function to safely execute commands
function safeExec(command, options = {}) {
  try {
    console.log(chalk.yellow(`Executing: ${command}`));
    execSync(command, { 
      stdio: 'inherit',
      cwd: rootDir,
      ...options
    });
    return true;
  } catch (error) {
    console.error(chalk.red(`Error executing command: ${command}`));
    console.error(chalk.red(error.message));
    return false;
  }
}

// Function to safely delete a directory
function safeDeleteDir(dir) {
  if (fs.existsSync(dir)) {
    try {
      console.log(chalk.yellow(`Deleting directory: ${dir}`));
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(chalk.green(`✅ Successfully deleted: ${dir}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error deleting directory: ${dir}`));
      console.error(chalk.red(error.message));
      
      // Try with rimraf if available
      try {
        execSync(`npx rimraf "${dir}"`, { stdio: 'inherit' });
        console.log(chalk.green(`✅ Successfully deleted with rimraf: ${dir}`));
        return true;
      } catch (rimrafError) {
        console.error(chalk.red(`Error using rimraf: ${rimrafError.message}`));
        return false;
      }
    }
  } else {
    console.log(chalk.yellow(`Directory does not exist: ${dir}`));
    return true;
  }
}

// Step 1: Stop any running Next.js processes
console.log(chalk.blue('Step 1: Stopping any running Next.js processes...'));
safeExec('npx kill-port 3000 3001 3002 3003');

// Step 2: Clean Next.js build cache
console.log(chalk.blue('Step 2: Cleaning Next.js build cache...'));
const nextCacheCleaned = safeDeleteDir(nextCacheDir);

// Step 3: Clean node_modules/.cache directory
console.log(chalk.blue('Step 3: Cleaning node_modules/.cache directory...'));
const nodeModulesCacheCleaned = safeDeleteDir(nodeModulesCacheDir);

// Step 4: Check if dependencies need reinstallation
console.log(chalk.blue('Step 4: Checking if dependencies need reinstallation...'));
const packageLockExists = fs.existsSync(path.join(rootDir, 'package-lock.json'));
const nodeModulesExists = fs.existsSync(path.join(rootDir, 'node_modules'));

if (!nodeModulesExists || !nextCacheCleaned || !nodeModulesCacheCleaned) {
  console.log(chalk.yellow('Node modules missing or cache cleaning failed. Reinstalling dependencies...'));
  
  if (packageLockExists) {
    safeExec('npm ci');
  } else {
    safeExec('npm install');
  }
} else {
  console.log(chalk.green('Dependencies look good. No need to reinstall.'));
}

// Step 5: Rebuild the application
console.log(chalk.blue('Step 5: Rebuilding the application...'));
safeExec('npm run build');

// Step 6: Start the development server
console.log(chalk.blue('Step 6: Starting the development server...'));
console.log(chalk.green('✅ Build cache fix process completed!'));
console.log(chalk.green('You can now start the application with: npm run dev'));
console.log(chalk.yellow('If you still see errors, try running: npm run fix-build-cache'));
