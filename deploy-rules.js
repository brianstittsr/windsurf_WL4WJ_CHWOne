/**
 * Script to deploy Firestore rules
 * 
 * This script deploys the Firestore security rules to your Firebase project.
 * It can be used to quickly switch between development and production rules.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths to rules files
const rulesPath = path.join(__dirname, 'firestore.rules');
const rulesBackupPath = path.join(__dirname, 'firestore.rules.backup');

// Function to backup current rules
function backupRules() {
  if (fs.existsSync(rulesPath)) {
    fs.copyFileSync(rulesPath, rulesBackupPath);
    console.log('Current rules backed up to firestore.rules.backup');
  }
}

// Function to restore rules from backup
function restoreRules() {
  if (fs.existsSync(rulesBackupPath)) {
    fs.copyFileSync(rulesBackupPath, rulesPath);
    console.log('Rules restored from backup');
  } else {
    console.error('No backup file found');
  }
}

// Function to deploy rules
function deployRules() {
  try {
    console.log('Deploying Firestore rules...');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('Rules deployed successfully');
  } catch (error) {
    console.error('Error deploying rules:', error);
  }
}

// Function to toggle between development and production rules
function toggleRules() {
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Check if development rules are active (uncommented)
  const isDevelopmentActive = rulesContent.includes('match /{document=**} {') && 
                             rulesContent.includes('allow read, write: if true;') &&
                             !rulesContent.includes('// match /{document=**} {');
  
  if (isDevelopmentActive) {
    // Switch to production rules
    console.log('Switching to PRODUCTION rules...');
    const newContent = rulesContent
      .replace(/match \/{document=\*\*} \{\n\s*allow read, write: if true;\n\s*\}/m, 
               '// match /{document=**} {\n//   allow read, write: if true;\n// }')
      .replace(/\/\* /g, '') // Remove comment start from production rules
      .replace(/ \*\//g, ''); // Remove comment end from production rules
    
    fs.writeFileSync(rulesPath, newContent);
    console.log('Switched to PRODUCTION rules');
  } else {
    // Switch to development rules
    console.log('Switching to DEVELOPMENT rules...');
    const newContent = rulesContent
      .replace(/\/\/ match \/{document=\*\*} \{\n\/\/\s*allow read, write: if true;\n\/\/\s*\}/m, 
               'match /{document=**} {\n      allow read, write: if true;\n    }')
      .replace(/^([ \t]*)(?!\/\/)([^\n\/]*)(\/\/ Comment out the line below.*$)/gm, '$1/* $2$3')
      .replace(/^([ \t]*)(?!\/\/)([^\n\/]*)(\/\/ Uncomment for production.*$)/gm, '$1/* $2$3');
    
    fs.writeFileSync(rulesPath, newContent);
    console.log('Switched to DEVELOPMENT rules');
  }
}

// Main menu
function showMenu() {
  console.log('\n=== Firestore Rules Management ===');
  console.log('1. Deploy current rules');
  console.log('2. Toggle between development and production rules');
  console.log('3. Backup current rules');
  console.log('4. Restore rules from backup');
  console.log('5. Exit');
  
  rl.question('\nSelect an option (1-5): ', (answer) => {
    switch (answer) {
      case '1':
        deployRules();
        showMenu();
        break;
      case '2':
        toggleRules();
        showMenu();
        break;
      case '3':
        backupRules();
        showMenu();
        break;
      case '4':
        restoreRules();
        showMenu();
        break;
      case '5':
        rl.close();
        break;
      default:
        console.log('Invalid option');
        showMenu();
    }
  });
}

// Start the script
console.log('Firestore Rules Management Tool');
showMenu();
