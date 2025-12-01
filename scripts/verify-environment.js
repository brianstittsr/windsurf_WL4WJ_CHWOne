/**
 * Environment Verification Script
 * Checks that all required environment variables and dependencies are configured
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  log('\n📋 Checking Environment Files...', 'cyan');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local not found!', 'red');
    log('   Create .env.local with your Firebase credentials', 'yellow');
    return false;
  }
  
  log('✅ .env.local exists', 'green');
  
  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      log(`✅ ${varName} found`, 'green');
    } else {
      log(`❌ ${varName} missing`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function checkFirebaseConfig() {
  log('\n🔥 Checking Firebase Configuration...', 'cyan');
  
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
  
  if (!fs.existsSync(rulesPath)) {
    log('❌ firestore.rules not found', 'red');
    return false;
  }
  log('✅ firestore.rules exists', 'green');
  
  if (!fs.existsSync(indexesPath)) {
    log('❌ firestore.indexes.json not found', 'red');
    return false;
  }
  log('✅ firestore.indexes.json exists', 'green');
  
  // Check if Datasets Admin rules are present
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  if (rulesContent.includes('DATASETS ADMIN PLATFORM RULES')) {
    log('✅ Datasets Admin security rules configured', 'green');
  } else {
    log('⚠️  Datasets Admin security rules not found', 'yellow');
  }
  
  // Check if indexes are present
  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  if (indexesContent.includes('datasets')) {
    log('✅ Datasets Admin indexes configured', 'green');
  } else {
    log('⚠️  Datasets Admin indexes not found', 'yellow');
  }
  
  return true;
}

function checkRequiredFiles() {
  log('\n📁 Checking Required Files...', 'cyan');
  
  const requiredFiles = [
    'src/types/dataset.types.ts',
    'src/services/DatasetService.ts',
    'src/services/QRWizardDatasetIntegration.ts',
    'src/hooks/useQRWizardDataset.ts',
    'src/components/Datasets/DatasetsDashboard.tsx',
    'src/components/Datasets/DataCollectionList.tsx',
    'src/components/Datasets/CreateDataCollectionDialog.tsx',
    'src/components/Datasets/DataCollectionDetail.tsx',
    'src/app/api/datasets/route.ts'
  ];
  
  let allPresent = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'cyan');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json not found', 'red');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'firebase',
    '@mui/material',
    '@emotion/react',
    '@emotion/styled'
  ];
  
  let allPresent = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log(`✅ ${dep} installed`, 'green');
    } else {
      log(`❌ ${dep} not installed`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function printSummary(results) {
  log('\n' + '='.repeat(50), 'blue');
  log('📊 VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(50), 'blue');
  
  const allPassed = Object.values(results).every(r => r);
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${check}`, color);
  });
  
  log('='.repeat(50), 'blue');
  
  if (allPassed) {
    log('\n🎉 All checks passed! Environment is ready.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Run: npm run dev', 'yellow');
    log('2. Navigate to: http://localhost:3000/datasets', 'yellow');
    log('3. Test the platform', 'yellow');
  } else {
    log('\n⚠️  Some checks failed. Please fix the issues above.', 'red');
  }
}

// Run all checks
async function main() {
  log('\n🚀 Datasets Admin Platform - Environment Verification', 'cyan');
  log('='.repeat(50), 'blue');
  
  const results = {
    'Environment Variables': checkEnvFile(),
    'Firebase Configuration': checkFirebaseConfig(),
    'Required Files': checkRequiredFiles(),
    'Dependencies': checkDependencies()
  };
  
  printSummary(results);
}

main().catch(console.error);
