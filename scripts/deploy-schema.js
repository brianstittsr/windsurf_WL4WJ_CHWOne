#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CHWOne Database Schema Deployment Script');
console.log('==========================================\n');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI detected');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI not found');
    console.log('📦 Installing Firebase CLI...');
    try {
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
      console.log('✅ Firebase CLI installed successfully');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Firebase CLI:', installError.message);
      return false;
    }
  }
}

// Check if user is logged in to Firebase
function checkFirebaseAuth() {
  try {
    const result = execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase authentication verified');
    return true;
  } catch (error) {
    console.log('❌ Not logged in to Firebase');
    console.log('🔐 Please run: firebase login');
    return false;
  }
}

// Deploy Firestore security rules
function deployFirestoreRules() {
  try {
    console.log('📋 Deploying Firestore security rules...');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Firestore security rules deployed');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy Firestore rules:', error.message);
    return false;
  }
}

// Initialize database with sample data
function initializeDatabase() {
  const initScript = path.join(__dirname, 'init-firestore.js');
  
  if (!fs.existsSync(initScript)) {
    console.error('❌ Database initialization script not found');
    return false;
  }

  try {
    console.log('🗄️  Initializing database with sample data...');
    execSync(`node "${initScript}"`, { stdio: 'inherit' });
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    return false;
  }
}

// Main deployment function
async function deploySchema() {
  console.log('Starting CHWOne database schema deployment...\n');

  // Step 1: Check Firebase CLI
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }

  // Step 2: Check Firebase authentication
  if (!checkFirebaseAuth()) {
    console.log('\n📝 To authenticate with Firebase:');
    console.log('   1. Run: firebase login');
    console.log('   2. Follow the browser authentication flow');
    console.log('   3. Run this script again');
    process.exit(1);
  }

  // Step 3: Deploy Firestore security rules
  if (!deployFirestoreRules()) {
    console.log('\n❌ Security rules deployment failed');
    process.exit(1);
  }

  // Step 4: Initialize database (optional)
  const args = process.argv.slice(2);
  if (args.includes('--init-data')) {
    if (!initializeDatabase()) {
      console.log('\n⚠️  Database initialization failed, but rules were deployed');
      process.exit(1);
    }
  } else {
    console.log('\n💡 To initialize with sample data, run:');
    console.log('   npm run deploy-schema -- --init-data');
  }

  console.log('\n🎉 Database schema deployment completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Create your first admin user in the Firebase Console');
  console.log('   2. Update user role to "admin" in Firestore');
  console.log('   3. Start using the CHWOne platform');
  console.log('\n🔗 Useful links:');
  console.log('   • Firebase Console: https://console.firebase.google.com');
  console.log('   • CHWOne Platform: http://localhost:3000');
}

// Run deployment
deploySchema().catch((error) => {
  console.error('💥 Deployment failed:', error);
  process.exit(1);
});
