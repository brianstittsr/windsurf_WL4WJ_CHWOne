/**
 * Script to fix MUI vendor chunk issues in Next.js
 * 
 * This script:
 * 1. Cleans the .next build directory
 * 2. Updates next.config.mjs with proper MUI chunking
 * 3. Runs a clean build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Paths
const rootDir = path.resolve(__dirname, '..');
const nextConfigPath = path.join(rootDir, 'next.config.mjs');
const nextConfigFixPath = path.join(rootDir, 'next.config.mui-fix.mjs');
const nextBuildDir = path.join(rootDir, '.next');

console.log(chalk.blue('🔧 Starting MUI build fix process...'));

// Step 1: Backup the original next.config.mjs
try {
  console.log(chalk.yellow('📑 Backing up original next.config.mjs...'));
  if (fs.existsSync(nextConfigPath)) {
    fs.copyFileSync(nextConfigPath, `${nextConfigPath}.backup`);
    console.log(chalk.green('✅ Backup created at next.config.mjs.backup'));
  } else {
    console.log(chalk.yellow('⚠️ No next.config.mjs found, will use the fixed version directly'));
  }
} catch (err) {
  console.error(chalk.red('❌ Failed to backup next.config.mjs:'), err);
  process.exit(1);
}

// Step 2: Copy the fixed next.config.mjs
try {
  console.log(chalk.yellow('📝 Applying fixed next.config.mjs...'));
  if (fs.existsSync(nextConfigFixPath)) {
    fs.copyFileSync(nextConfigFixPath, nextConfigPath);
    console.log(chalk.green('✅ Applied fixed next.config.mjs'));
  } else {
    console.error(chalk.red('❌ Fixed config not found at:', nextConfigFixPath));
    process.exit(1);
  }
} catch (err) {
  console.error(chalk.red('❌ Failed to apply fixed next.config.mjs:'), err);
  process.exit(1);
}

// Step 3: Clean the .next directory
try {
  console.log(chalk.yellow('🧹 Cleaning .next directory...'));
  if (fs.existsSync(nextBuildDir)) {
    fs.rmSync(nextBuildDir, { recursive: true, force: true });
    console.log(chalk.green('✅ Cleaned .next directory'));
  } else {
    console.log(chalk.green('✅ No .next directory found, nothing to clean'));
  }
} catch (err) {
  console.error(chalk.red('❌ Failed to clean .next directory:'), err);
  process.exit(1);
}

// Step 4: Run a clean build
try {
  console.log(chalk.yellow('🏗️ Running clean build...'));
  execSync('npm run build', { stdio: 'inherit' });
  console.log(chalk.green('✅ Build completed successfully'));
} catch (err) {
  console.error(chalk.red('❌ Build failed:'), err);
  process.exit(1);
}

console.log(chalk.blue('🎉 MUI build fix process completed!'));
console.log(chalk.blue('You can now start the application with: npm run dev'));
