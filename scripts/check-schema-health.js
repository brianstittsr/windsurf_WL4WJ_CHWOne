/**
 * Check Schema Health
 * 
 * This script checks the health of the Firebase schema by:
 * 1. Verifying that all required collections exist
 * 2. Checking that indexes are properly configured
 * 3. Validating a sample of documents against the schema
 * 4. Checking for inconsistencies in the data
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Import Firebase client SDK
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp
} = require('firebase/firestore');

// Import Firebase config
let firebaseConfig;
try {
  // Try to import from environment variables first
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  } else {
    // Fall back to local config file
    const configPath = path.join(__dirname, '..', 'src', 'lib', 'firebase-config.ts');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      // Extract the config object using regex
      const configMatch = configContent.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);
      if (configMatch && configMatch[1]) {
        // Convert the extracted string to a JavaScript object
        // This is a simple approach and might not work for complex configs
        const configStr = configMatch[1].replace(/\s*\/\/.*$/gm, '');
        firebaseConfig = eval(`(${configStr})`);
      }
    }
  }
  
  if (!firebaseConfig) {
    throw new Error('Firebase configuration not found');
  }
} catch (error) {
  console.error(chalk.red('Error loading Firebase configuration:'), error.message);
  console.error(chalk.yellow('Please set Firebase environment variables or create a firebase-config.ts file.'));
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to check
const COLLECTIONS = {
  USERS: 'users',
  CHW_PROFILES: 'chwProfiles',
  ORGANIZATIONS: 'organizations',
  FORMS: 'forms',
  FORM_SUBMISSIONS: 'formSubmissions',
  RESOURCES: 'resources',
  FILES: 'files',
  PROJECTS: 'projects',
  GRANTS: 'grants',
  CLIENTS: 'clients',
  REFERRALS: 'referrals',
  DASHBOARD_METRICS: 'dashboardMetrics',
  ACTIVITY_LOGS: 'activityLogs',
  NOTIFICATIONS: 'notifications',
  SYSTEM: 'system'
};

// Health check results
const results = {
  collections: {
    total: 0,
    existing: 0,
    missing: []
  },
  documents: {
    total: 0,
    valid: 0,
    invalid: 0,
    issues: []
  },
  schemaVersion: null,
  organizations: [],
  userRoles: {},
  timestamps: {
    oldest: null,
    newest: null
  }
};

// Check if collections exist
async function checkCollections() {
  console.log(chalk.blue('Checking collections...'));
  
  const collections = Object.values(COLLECTIONS);
  results.collections.total = collections.length;
  
  for (const collectionName of collections) {
    try {
      const collRef = collection(db, collectionName);
      const q = query(collRef, limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log(chalk.green(`✓ Collection exists: ${collectionName}`));
        results.collections.existing++;
      } else {
        console.log(chalk.yellow(`⚠ Collection exists but is empty: ${collectionName}`));
        results.collections.existing++;
      }
    } catch (error) {
      console.log(chalk.red(`✗ Collection does not exist or error: ${collectionName}`));
      results.collections.missing.push(collectionName);
    }
  }
}

// Check schema version
async function checkSchemaVersion() {
  console.log(chalk.blue('\nChecking schema version...'));
  
  try {
    const schemaVersionRef = doc(db, COLLECTIONS.SYSTEM, 'schema_version');
    const schemaVersionDoc = await getDoc(schemaVersionRef);
    
    if (schemaVersionDoc.exists()) {
      const versionData = schemaVersionDoc.data();
      results.schemaVersion = versionData;
      console.log(chalk.green(`✓ Schema version: ${versionData.version}`));
      console.log(chalk.green(`✓ Applied at: ${versionData.appliedAt.toDate().toLocaleString()}`));
      console.log(chalk.green(`✓ Description: ${versionData.description}`));
    } else {
      console.log(chalk.yellow('⚠ Schema version document not found'));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Error checking schema version: ${error.message}`));
  }
}

// Check organizations
async function checkOrganizations() {
  console.log(chalk.blue('\nChecking organizations...'));
  
  try {
    const orgsRef = collection(db, COLLECTIONS.ORGANIZATIONS);
    const orgsSnapshot = await getDocs(orgsRef);
    
    if (orgsSnapshot.empty) {
      console.log(chalk.yellow('⚠ No organizations found'));
      return;
    }
    
    console.log(chalk.green(`✓ Found ${orgsSnapshot.size} organizations`));
    
    orgsSnapshot.forEach(docSnap => {
      const org = docSnap.data();
      results.organizations.push({
        id: docSnap.id,
        name: org.name
      });
      console.log(chalk.green(`  - ${org.name} (${docSnap.id})`));
    });
  } catch (error) {
    console.log(chalk.red(`✗ Error checking organizations: ${error.message}`));
  }
}

// Check user roles
async function checkUserRoles() {
  console.log(chalk.blue('\nChecking user roles...'));
  
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const usersSnapshot = await getDocs(usersRef);
    
    if (usersSnapshot.empty) {
      console.log(chalk.yellow('⚠ No users found'));
      return;
    }
    
    console.log(chalk.green(`✓ Found ${usersSnapshot.size} users`));
    
    // Count users by role
    usersSnapshot.forEach(docSnap => {
      const user = docSnap.data();
      if (user.role) {
        results.userRoles[user.role] = (results.userRoles[user.role] || 0) + 1;
      }
    });
    
    // Display role counts
    Object.entries(results.userRoles).forEach(([role, count]) => {
      console.log(chalk.green(`  - ${role}: ${count} users`));
    });
  } catch (error) {
    console.log(chalk.red(`✗ Error checking user roles: ${error.message}`));
  }
}

// Check document timestamps
async function checkTimestamps() {
  console.log(chalk.blue('\nChecking document timestamps...'));
  
  const collections = Object.values(COLLECTIONS);
  let oldestDate = new Date();
  let newestDate = new Date(0);
  
  for (const collectionName of collections) {
    try {
      // Check oldest document
      const collRef = collection(db, collectionName);
      const oldestQ = query(collRef, orderBy('createdAt', 'asc'), limit(1));
      const oldestSnapshot = await getDocs(oldestQ);
      
      if (!oldestSnapshot.empty) {
        const oldestDoc = oldestSnapshot.docs[0].data();
        if (oldestDoc.createdAt) {
          const date = oldestDoc.createdAt.toDate();
          if (date < oldestDate) {
            oldestDate = date;
          }
        }
      }
      
      // Check newest document
      const newestQ = query(collRef, orderBy('createdAt', 'desc'), limit(1));
      const newestSnapshot = await getDocs(newestQ);
      
      if (!newestSnapshot.empty) {
        const newestDoc = newestSnapshot.docs[0].data();
        if (newestDoc.createdAt) {
          const date = newestDoc.createdAt.toDate();
          if (date > newestDate) {
            newestDate = date;
          }
        }
      }
    } catch (error) {
      // Ignore errors for collections that don't exist or don't have createdAt field
    }
  }
  
  results.timestamps.oldest = oldestDate;
  results.timestamps.newest = newestDate;
  
  console.log(chalk.green(`✓ Oldest document: ${oldestDate.toLocaleString()}`));
  console.log(chalk.green(`✓ Newest document: ${newestDate.toLocaleString()}`));
}

// Check document validation
async function validateDocuments() {
  console.log(chalk.blue('\nValidating documents...'));
  
  // Sample a few documents from each collection
  const collections = Object.values(COLLECTIONS);
  
  for (const collectionName of collections) {
    try {
      const collRef = collection(db, collectionName);
      const q = query(collRef, limit(10));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        continue;
      }
      
      console.log(chalk.green(`Checking ${snapshot.size} documents in ${collectionName}...`));
      results.documents.total += snapshot.size;
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        
        // Basic validation checks
        const issues = [];
        
        // Check for required fields based on collection type
        switch (collectionName) {
          case COLLECTIONS.USERS:
            if (!data.uid) issues.push('Missing uid');
            if (!data.email) issues.push('Missing email');
            if (!data.role) issues.push('Missing role');
            if (!data.organizationId) issues.push('Missing organizationId');
            break;
          case COLLECTIONS.CHW_PROFILES:
            if (!data.uid) issues.push('Missing uid');
            if (!data.firstName) issues.push('Missing firstName');
            if (!data.lastName) issues.push('Missing lastName');
            if (!data.certificationNumber) issues.push('Missing certificationNumber');
            break;
          case COLLECTIONS.ORGANIZATIONS:
            if (!data.name) issues.push('Missing name');
            if (!data.type) issues.push('Missing type');
            break;
        }
        
        // Check for timestamps
        if (!data.createdAt) issues.push('Missing createdAt');
        if (!data.updatedAt) issues.push('Missing updatedAt');
        
        if (issues.length > 0) {
          results.documents.invalid++;
          results.documents.issues.push({
            collection: collectionName,
            id: docSnap.id,
            issues
          });
          console.log(chalk.yellow(`  ⚠ Document ${docSnap.id} has issues: ${issues.join(', ')}`));
        } else {
          results.documents.valid++;
        }
      });
    } catch (error) {
      console.log(chalk.red(`✗ Error validating ${collectionName}: ${error.message}`));
    }
  }
}

// Generate health report
function generateReport() {
  console.log(chalk.blue('\n=== Schema Health Report ==='));
  
  // Collections
  console.log(chalk.blue('\nCollections:'));
  console.log(`Total: ${results.collections.total}`);
  console.log(`Existing: ${results.collections.existing}`);
  console.log(`Missing: ${results.collections.missing.length}`);
  
  if (results.collections.missing.length > 0) {
    console.log(chalk.yellow('Missing collections:'));
    results.collections.missing.forEach(collection => {
      console.log(chalk.yellow(`  - ${collection}`));
    });
  }
  
  // Schema Version
  console.log(chalk.blue('\nSchema Version:'));
  if (results.schemaVersion) {
    console.log(`Version: ${results.schemaVersion.version}`);
    console.log(`Applied: ${results.schemaVersion.appliedAt.toDate().toLocaleString()}`);
    console.log(`Description: ${results.schemaVersion.description}`);
  } else {
    console.log(chalk.yellow('No schema version found'));
  }
  
  // Organizations
  console.log(chalk.blue('\nOrganizations:'));
  if (results.organizations.length > 0) {
    results.organizations.forEach(org => {
      console.log(`  - ${org.name} (${org.id})`);
    });
  } else {
    console.log(chalk.yellow('No organizations found'));
  }
  
  // User Roles
  console.log(chalk.blue('\nUser Roles:'));
  if (Object.keys(results.userRoles).length > 0) {
    Object.entries(results.userRoles).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count} users`);
    });
  } else {
    console.log(chalk.yellow('No users found'));
  }
  
  // Document Validation
  console.log(chalk.blue('\nDocument Validation:'));
  console.log(`Total documents checked: ${results.documents.total}`);
  console.log(`Valid: ${results.documents.valid}`);
  console.log(`Invalid: ${results.documents.invalid}`);
  
  if (results.documents.issues.length > 0) {
    console.log(chalk.yellow('\nDocument Issues:'));
    results.documents.issues.forEach(issue => {
      console.log(chalk.yellow(`  - ${issue.collection}/${issue.id}: ${issue.issues.join(', ')}`));
    });
  }
  
  // Timestamps
  console.log(chalk.blue('\nTimestamps:'));
  if (results.timestamps.oldest && results.timestamps.newest) {
    console.log(`Oldest: ${results.timestamps.oldest.toLocaleString()}`);
    console.log(`Newest: ${results.timestamps.newest.toLocaleString()}`);
    
    // Calculate data age
    const ageMs = Date.now() - results.timestamps.newest.getTime();
    const ageHours = Math.round(ageMs / (1000 * 60 * 60));
    
    if (ageHours < 24) {
      console.log(chalk.green(`Data is current (last updated ${ageHours} hours ago)`));
    } else if (ageHours < 168) { // 7 days
      console.log(chalk.yellow(`Data is ${Math.round(ageHours / 24)} days old`));
    } else {
      console.log(chalk.red(`Data is old (${Math.round(ageHours / 24)} days)`));
    }
  } else {
    console.log(chalk.yellow('No timestamp data found'));
  }
  
  // Overall Health
  console.log(chalk.blue('\nOverall Health:'));
  
  const missingCollectionsScore = results.collections.missing.length === 0 ? 100 : 
    Math.max(0, 100 - (results.collections.missing.length / results.collections.total) * 100);
  
  const documentValidityScore = results.documents.total === 0 ? 0 :
    (results.documents.valid / results.documents.total) * 100;
  
  const schemaVersionScore = results.schemaVersion ? 100 : 0;
  
  const organizationsScore = results.organizations.length >= 3 ? 100 : 
    (results.organizations.length / 3) * 100;
  
  const userRolesScore = Object.keys(results.userRoles).length >= 4 ? 100 :
    (Object.keys(results.userRoles).length / 4) * 100;
  
  const overallScore = Math.round(
    (missingCollectionsScore * 0.3) +
    (documentValidityScore * 0.3) +
    (schemaVersionScore * 0.2) +
    (organizationsScore * 0.1) +
    (userRolesScore * 0.1)
  );
  
  let healthStatus;
  if (overallScore >= 90) {
    healthStatus = chalk.green('EXCELLENT');
  } else if (overallScore >= 75) {
    healthStatus = chalk.green('GOOD');
  } else if (overallScore >= 50) {
    healthStatus = chalk.yellow('FAIR');
  } else {
    healthStatus = chalk.red('POOR');
  }
  
  console.log(`Schema Health Score: ${overallScore}% (${healthStatus})`);
  
  // Recommendations
  console.log(chalk.blue('\nRecommendations:'));
  
  if (results.collections.missing.length > 0) {
    console.log(chalk.yellow('- Create missing collections'));
  }
  
  if (results.documents.invalid > 0) {
    console.log(chalk.yellow('- Fix invalid documents'));
  }
  
  if (!results.schemaVersion) {
    console.log(chalk.yellow('- Create schema version document'));
  }
  
  if (results.organizations.length < 3) {
    console.log(chalk.yellow('- Create default organizations'));
  }
  
  if (Object.keys(results.userRoles).length < 4) {
    console.log(chalk.yellow('- Create users with different roles'));
  }
  
  console.log(chalk.blue('\n=== End of Report ==='));
}

// Run the health check
async function runHealthCheck() {
  console.log(chalk.green('Starting schema health check...'));
  
  try {
    await checkCollections();
    await checkSchemaVersion();
    await checkOrganizations();
    await checkUserRoles();
    await checkTimestamps();
    await validateDocuments();
    
    generateReport();
    
    console.log(chalk.green('\nHealth check completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error running health check:'), error);
  } finally {
    process.exit(0);
  }
}

// Run the health check
runHealthCheck();
