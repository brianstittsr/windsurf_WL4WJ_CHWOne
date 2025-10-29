/**
 * Script to disable auto-login functionality
 * This script will update the .env.local file to set NEXT_PUBLIC_BYPASS_AUTH to false
 */

const fs = require('fs');
const path = require('path');

// Path to .env.local file
const envFilePath = path.resolve(process.cwd(), '.env.local');

console.log('Disabling auto-login...');

// Read the current .env.local file
try {
  let envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Check if NEXT_PUBLIC_BYPASS_AUTH exists
  if (envContent.includes('NEXT_PUBLIC_BYPASS_AUTH=')) {
    // Replace the value with false
    envContent = envContent.replace(/NEXT_PUBLIC_BYPASS_AUTH=.*/, 'NEXT_PUBLIC_BYPASS_AUTH=false');
    console.log('Setting NEXT_PUBLIC_BYPASS_AUTH to false');
  } else {
    // Add the variable if it doesn't exist
    envContent += '\nNEXT_PUBLIC_BYPASS_AUTH=false\n';
    console.log('Adding NEXT_PUBLIC_BYPASS_AUTH=false');
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(envFilePath, envContent);
  console.log('Auto-login successfully disabled!');
  console.log('Please restart your development server for changes to take effect.');
} catch (error) {
  console.error('Error updating .env.local file:', error);
  process.exit(1);
}
