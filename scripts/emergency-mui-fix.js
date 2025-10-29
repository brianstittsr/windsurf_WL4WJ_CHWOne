/**
 * Emergency fix for MUI vendor chunk issues
 * This script directly creates the missing vendor chunk file
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Paths
const rootDir = path.resolve(__dirname, '..');
const vendorChunkDir = path.join(rootDir, '.next', 'server', 'vendor-chunks');
const muiChunkPath = path.join(vendorChunkDir, '@mui.js');

console.log(chalk.blue('🚨 Starting emergency MUI vendor chunk fix...'));

// Check if the vendor-chunks directory exists
if (!fs.existsSync(vendorChunkDir)) {
  console.log(chalk.yellow('📁 Creating vendor-chunks directory...'));
  fs.mkdirSync(vendorChunkDir, { recursive: true });
}

// Create a minimal MUI vendor chunk file
const minimalMuiChunk = `
// Minimal MUI vendor chunk to fix build error
// This is a temporary fix until a proper build can be done
module.exports = {};
`;

try {
  console.log(chalk.yellow('📝 Creating minimal @mui.js vendor chunk...'));
  fs.writeFileSync(muiChunkPath, minimalMuiChunk);
  console.log(chalk.green('✅ Created minimal @mui.js vendor chunk at:'));
  console.log(chalk.green(muiChunkPath));
} catch (err) {
  console.error(chalk.red('❌ Failed to create MUI vendor chunk:'), err);
  process.exit(1);
}

console.log(chalk.blue('🎉 Emergency fix applied!'));
console.log(chalk.yellow('⚠️ Note: This is a temporary fix. Run npm run fix-mui-build for a permanent solution.'));
