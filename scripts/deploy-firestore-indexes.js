/**
 * Deploy Firestore Indexes
 * 
 * This script deploys the Firestore indexes to Firebase.
 * It uses the Firebase CLI to deploy the indexes from the firestore.indexes.json file.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Check if the firestore.indexes.json file exists
const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
if (!fs.existsSync(indexesPath)) {
  console.error('Error: firestore.indexes.json file not found!');
  process.exit(1);
}

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for confirmation before deploying to production
rl.question('Are you sure you want to deploy Firestore indexes to production? (y/N) ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Deployment cancelled.');
    rl.close();
    process.exit(0);
  }

  console.log('Deploying Firestore indexes...');
  
  try {
    // Deploy the indexes using the Firebase CLI
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    console.log('Firestore indexes deployed successfully!');
  } catch (error) {
    console.error('Error deploying Firestore indexes:', error.message);
    process.exit(1);
  }
  
  rl.close();
});
