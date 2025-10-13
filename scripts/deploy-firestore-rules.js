/**
 * Deploy Firestore Security Rules
 * 
 * This script deploys the Firestore security rules to Firebase.
 * It uses the Firebase CLI to deploy the rules from the firestore.rules file.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Check if the firestore.rules file exists
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('Error: firestore.rules file not found!');
  process.exit(1);
}

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for confirmation before deploying to production
rl.question('Are you sure you want to deploy Firestore security rules to production? (y/N) ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Deployment cancelled.');
    rl.close();
    process.exit(0);
  }

  console.log('Deploying Firestore security rules...');
  
  try {
    // Deploy the rules using the Firebase CLI
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('Firestore security rules deployed successfully!');
  } catch (error) {
    console.error('Error deploying Firestore security rules:', error.message);
    process.exit(1);
  }
  
  rl.close();
});
