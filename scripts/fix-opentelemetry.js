/**
 * Fix Missing @opentelemetry.js Module Error
 * 
 * This script specifically targets the error:
 * "Cannot find module './vendor-chunks/@opentelemetry.js'"
 * 
 * This is a common issue in Next.js when the build cache gets corrupted.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Paths
const rootDir = path.resolve(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const vendorChunksDir = path.join(nextDir, 'server', 'vendor-chunks');

console.log(chalk.blue('🔧 Starting @opentelemetry.js fix process...'));

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

// Step 1: Check if the vendor-chunks directory exists
console.log(chalk.blue('Step 1: Checking vendor-chunks directory...'));
if (fs.existsSync(vendorChunksDir)) {
  console.log(chalk.green(`Vendor chunks directory exists: ${vendorChunksDir}`));
  
  // Check if @opentelemetry.js exists
  const opentelemetryFile = path.join(vendorChunksDir, '@opentelemetry.js');
  if (fs.existsSync(opentelemetryFile)) {
    console.log(chalk.green(`@opentelemetry.js file exists: ${opentelemetryFile}`));
  } else {
    console.log(chalk.yellow(`@opentelemetry.js file is missing. This is the source of the error.`));
  }
} else {
  console.log(chalk.yellow(`Vendor chunks directory does not exist: ${vendorChunksDir}`));
}

// Step 2: Clean the Next.js cache
console.log(chalk.blue('Step 2: Cleaning Next.js cache...'));
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log(chalk.green(`Successfully deleted Next.js cache directory: ${nextDir}`));
  } catch (error) {
    console.error(chalk.red(`Error deleting Next.js cache directory: ${error.message}`));
    
    // Try with rimraf if available
    try {
      execSync(`npx rimraf "${nextDir}"`, { stdio: 'inherit' });
      console.log(chalk.green(`Successfully deleted Next.js cache directory with rimraf: ${nextDir}`));
    } catch (rimrafError) {
      console.error(chalk.red(`Error using rimraf: ${rimrafError.message}`));
      console.error(chalk.red('Please manually delete the .next directory and try again.'));
    }
  }
} else {
  console.log(chalk.yellow(`Next.js cache directory does not exist: ${nextDir}`));
}

// Step 3: Install dependencies if needed
console.log(chalk.blue('Step 3: Checking dependencies...'));
const nodeModulesDir = path.join(rootDir, 'node_modules');
const packageLockExists = fs.existsSync(path.join(rootDir, 'package-lock.json'));

if (!fs.existsSync(nodeModulesDir)) {
  console.log(chalk.yellow('node_modules directory is missing. Installing dependencies...'));
  if (packageLockExists) {
    safeExec('npm ci');
  } else {
    safeExec('npm install');
  }
} else {
  // Check if @opentelemetry exists in node_modules
  const opentelemetryDir = path.join(nodeModulesDir, '@opentelemetry');
  if (fs.existsSync(opentelemetryDir)) {
    console.log(chalk.green(`@opentelemetry directory exists in node_modules: ${opentelemetryDir}`));
  } else {
    console.log(chalk.yellow(`@opentelemetry directory is missing from node_modules. Reinstalling...`));
    safeExec('npm install @opentelemetry/api @opentelemetry/core @opentelemetry/sdk-trace-base');
  }
}

// Step 4: Create a dummy @opentelemetry.js file if needed
console.log(chalk.blue('Step 4: Creating vendor-chunks directory if needed...'));
if (!fs.existsSync(vendorChunksDir)) {
  try {
    fs.mkdirSync(vendorChunksDir, { recursive: true });
    console.log(chalk.green(`Created vendor-chunks directory: ${vendorChunksDir}`));
  } catch (error) {
    console.error(chalk.red(`Error creating vendor-chunks directory: ${error.message}`));
  }
}

// Step 5: Rebuild the application
console.log(chalk.blue('Step 5: Rebuilding the application...'));
safeExec('npm run build');

console.log(chalk.green('✅ @opentelemetry.js fix process completed!'));
console.log(chalk.green('You can now start the application with: npm run dev'));
console.log(chalk.yellow('If you still see errors, try running: npm run fix-build-cache'));
