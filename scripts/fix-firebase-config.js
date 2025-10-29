/**
 * Fix Firebase Configuration Script
 * 
 * This script fixes the Firebase configuration issues shown in the error message:
 * - Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - Missing NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - Missing NEXT_PUBLIC_FIREBASE_APP_ID
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to .env.local file
const envFilePath = path.resolve(process.cwd(), '.env.local');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function to fix Firebase configuration
async function fixFirebaseConfig() {
  console.log('Starting Firebase configuration fix...');
  
  try {
    // Check if .env.local exists
    if (!fs.existsSync(envFilePath)) {
      console.error('.env.local file not found. Please create it first.');
      return;
    }
    
    // Read current .env.local content
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Check for required Firebase configuration variables
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];
    
    // Check which variables are missing
    const missingVars = [];
    for (const varName of requiredVars) {
      if (!envContent.includes(`${varName}=`)) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length === 0) {
      console.log('All Firebase configuration variables are already set in .env.local');
      
      // Ask if user wants to update existing values
      const updateExisting = await prompt('Do you want to update existing Firebase configuration values? (y/n): ');
      if (updateExisting.toLowerCase() !== 'y') {
        console.log('No changes made to Firebase configuration.');
        return;
      }
    } else {
      console.log('Missing Firebase configuration variables:');
      missingVars.forEach(varName => console.log(`- ${varName}`));
    }
    
    console.log('\nPlease provide the Firebase configuration values:');
    console.log('(You can find these in your Firebase project settings)\n');
    
    // Prompt for Firebase configuration values
    const configValues = {};
    
    // API Key
    if (missingVars.includes('NEXT_PUBLIC_FIREBASE_API_KEY') || envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY=')) {
      configValues.NEXT_PUBLIC_FIREBASE_API_KEY = await prompt('Firebase API Key: ');
    }
    
    // Auth Domain
    if (missingVars.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || envContent.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=')) {
      configValues.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = await prompt('Firebase Auth Domain (e.g., your-project-id.firebaseapp.com): ');
    }
    
    // Project ID
    if (missingVars.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || envContent.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID=')) {
      configValues.NEXT_PUBLIC_FIREBASE_PROJECT_ID = await prompt('Firebase Project ID: ');
    }
    
    // Storage Bucket
    if (missingVars.includes('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || envContent.includes('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=')) {
      configValues.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = await prompt('Firebase Storage Bucket (e.g., your-project-id.appspot.com): ');
    }
    
    // Messaging Sender ID
    if (missingVars.includes('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || envContent.includes('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=')) {
      configValues.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = await prompt('Firebase Messaging Sender ID: ');
    }
    
    // App ID
    if (missingVars.includes('NEXT_PUBLIC_FIREBASE_APP_ID') || envContent.includes('NEXT_PUBLIC_FIREBASE_APP_ID=')) {
      configValues.NEXT_PUBLIC_FIREBASE_APP_ID = await prompt('Firebase App ID: ');
    }
    
    // Update .env.local file
    for (const [key, value] of Object.entries(configValues)) {
      if (envContent.includes(`${key}=`)) {
        // Replace existing value
        envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
      } else {
        // Add new value
        envContent += `\n${key}=${value}`;
      }
    }
    
    // Write updated content back to .env.local
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('\nFirebase configuration updated successfully!');
    console.log('Please restart your development server for changes to take effect.');
    
  } catch (error) {
    console.error('Error updating Firebase configuration:', error);
  } finally {
    rl.close();
  }
}

// Run the script
fixFirebaseConfig();
