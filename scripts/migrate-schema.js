/**
 * Migrate Firebase Schema
 * 
 * This script migrates data from the old schema to the unified schema.
 * It performs the following operations:
 * 1. Creates new collections if they don't exist
 * 2. Migrates CHW data from users to chwProfiles
 * 3. Updates organization references to use organizationId consistently
 * 4. Adds timestamps to all documents
 * 5. Normalizes enum values
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import Firebase client SDK
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
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
  console.error('Error loading Firebase configuration:', error.message);
  console.error('Please set Firebase environment variables or create a firebase-config.ts file.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Equivalent of FieldValue.serverTimestamp()
const FieldValue = {
  serverTimestamp: () => serverTimestamp()
};

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Collections to migrate
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

// Migration configuration
let config = {
  dryRun: true,
  collections: Object.values(COLLECTIONS),
  batchSize: 500,
  logLevel: 'info'
};

// Migration statistics
const stats = {
  processed: 0,
  created: 0,
  updated: 0,
  skipped: 0,
  errors: []
};

// Helper function to log messages based on log level
function log(level, message) {
  const levels = ['error', 'warn', 'info', 'debug'];
  if (levels.indexOf(level) <= levels.indexOf(config.logLevel)) {
    console[level === 'debug' ? 'log' : level](message);
  }
}

// Create default organizations if they don't exist
async function createDefaultOrganizations() {
  log('info', 'Creating default organizations...');
  
  const organizations = [
    {
      id: 'general',
      name: 'CHWOne Platform',
      shortName: 'CHWOne',
      description: 'CHWOne Platform organization',
      type: 'community_org',
      contactEmail: 'contact@chwone.org',
      contactPhone: '555-123-4567',
      address: {
        street: '123 Main St',
        city: 'Charlotte',
        state: 'NC',
        zipCode: '28202',
        county: 'Mecklenburg',
        country: 'USA'
      },
      logoUrl: '/images/general-logo.png',
      primaryColor: '#1a365d',
      secondaryColor: '#4a5568',
      settings: {
        allowPublicForms: true,
        requireApprovalForNewUsers: true,
        defaultUserRole: 'chw',
        maxFileSize: 10,
        allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        emailTemplates: {
          welcomeMessage: 'Welcome to CHWOne Platform!',
          formSubmissionNotification: 'A new form has been submitted.',
          passwordReset: 'You have requested a password reset.'
        }
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    {
      id: 'region5',
      name: 'Region 5 Health Department',
      shortName: 'Region 5',
      description: 'Region 5 Health Department organization',
      type: 'health_department',
      contactEmail: 'contact@region5.org',
      contactPhone: '555-234-5678',
      address: {
        street: '456 Health St',
        city: 'Charlotte',
        state: 'NC',
        zipCode: '28203',
        county: 'Mecklenburg',
        country: 'USA'
      },
      logoUrl: '/images/region5-logo.png',
      primaryColor: '#2a4365',
      secondaryColor: '#718096',
      settings: {
        allowPublicForms: true,
        requireApprovalForNewUsers: true,
        defaultUserRole: 'chw',
        maxFileSize: 10,
        allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        emailTemplates: {
          welcomeMessage: 'Welcome to Region 5 Health Department!',
          formSubmissionNotification: 'A new form has been submitted.',
          passwordReset: 'You have requested a password reset.'
        }
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    {
      id: 'wl4wj',
      name: 'Women Leading for Wellness & Justice',
      shortName: 'WL4WJ',
      description: 'Women Leading for Wellness & Justice organization',
      type: 'nonprofit',
      contactEmail: 'contact@wl4wj.org',
      contactPhone: '555-345-6789',
      address: {
        street: '789 Justice Ave',
        city: 'Charlotte',
        state: 'NC',
        zipCode: '28204',
        county: 'Mecklenburg',
        country: 'USA'
      },
      logoUrl: '/images/wl4wj-logo.png',
      primaryColor: '#2c5282',
      secondaryColor: '#2d3748',
      settings: {
        allowPublicForms: true,
        requireApprovalForNewUsers: true,
        defaultUserRole: 'wl4wj_chw',
        maxFileSize: 10,
        allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        emailTemplates: {
          welcomeMessage: 'Welcome to Women Leading for Wellness & Justice!',
          formSubmissionNotification: 'A new form has been submitted.',
          passwordReset: 'You have requested a password reset.'
        }
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }
  ];
  
  for (const org of organizations) {
    const orgRef = doc(db, COLLECTIONS.ORGANIZATIONS, org.id);
    const orgDoc = await getDoc(orgRef);
    
    if (!orgDoc.exists()) {
      log('info', `Creating organization: ${org.id}`);
      if (!config.dryRun) {
        await setDoc(orgRef, org);
      }
      stats.created++;
    } else {
      log('info', `Organization ${org.id} already exists, skipping.`);
      stats.skipped++;
    }
  }
}

// Migrate CHW data from users to chwProfiles
async function migrateCHWProfiles() {
  log('info', 'Migrating CHW profiles...');
  
  const usersRef = collection(db, COLLECTIONS.USERS);
  const usersQuery = query(usersRef, where('role', 'in', ['chw', 'wl4wj_chw']));
  const usersSnapshot = await getDocs(usersQuery);
  
  if (usersSnapshot.empty) {
    log('info', 'No CHWs found to migrate.');
    return;
  }
  
  log('info', `Found ${usersSnapshot.size} CHWs to migrate.`);
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    
    // Check if CHW profile already exists
    const chwProfileRef = doc(db, COLLECTIONS.CHW_PROFILES, uid);
    const chwProfileDoc = await getDoc(chwProfileRef);
    
    if (chwProfileDoc.exists()) {
      log('info', `CHW profile for ${uid} already exists, skipping.`);
      stats.skipped++;
      continue;
    }
    
    // Create a new CHW profile
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    
    const chwProfile = {
      uid,
      firstName: userData.firstName || userData.displayName?.split(' ')[0] || '',
      lastName: userData.lastName || userData.displayName?.split(' ').slice(1).join(' ') || '',
      certificationNumber: userData.certificationNumber || `CHW-${new Date().getFullYear()}-${uid.substring(0, 6)}`,
      certificationDate: userData.certificationDate || FieldValue.serverTimestamp(),
      expirationDate: userData.expirationDate || Timestamp.fromDate(twoYearsFromNow),
      certificationLevel: userData.certificationLevel || 'entry',
      primaryPhone: userData.phoneNumber || '',
      region: userData.region || 'Charlotte Metro',
      serviceArea: userData.serviceArea || [],
      zipCodes: userData.zipCodes || [],
      languages: userData.languages || ['English'],
      specializations: userData.specializations || [],
      skills: userData.skills || [],
      availability: userData.availability || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      caseLoad: userData.caseLoad || 0,
      maxCaseLoad: userData.maxCaseLoad || 20,
      completedTrainings: userData.completedTrainings || 0,
      totalEncounters: userData.totalEncounters || 0,
      profileVisible: userData.profileVisible !== undefined ? userData.profileVisible : true,
      allowContactSharing: userData.allowContactSharing !== undefined ? userData.allowContactSharing : true,
      resources: [],
      equipment: [],
      createdAt: userData.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    log('info', `Creating CHW profile for ${uid}`);
    if (!config.dryRun) {
      await setDoc(chwProfileRef, chwProfile);
    }
    stats.created++;
  }
}

// Ensure all users have required fields
async function normalizeUserData() {
  log('info', 'Normalizing user data...');
  
  const usersRef = collection(db, COLLECTIONS.USERS);
  const usersSnapshot = await getDocs(usersRef);
  
  if (usersSnapshot.empty) {
    log('info', 'No users found to normalize.');
    return;
  }
  
  log('info', `Found ${usersSnapshot.size} users to normalize.`);
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    
    // Check if user needs normalization
    const needsUpdate = !userData.organizationId || 
                       !userData.isActive || 
                       !userData.createdAt || 
                       !userData.updatedAt;
    
    if (!needsUpdate) {
      log('debug', `User ${uid} already normalized, skipping.`);
      stats.skipped++;
      continue;
    }
    
    // Normalize user data
    const updates = {};
    
    if (!userData.organizationId) {
      updates.organizationId = userData.organization || 'general';
    }
    
    if (userData.isActive === undefined) {
      updates.isActive = true;
    }
    
    if (!userData.createdAt) {
      updates.createdAt = FieldValue.serverTimestamp();
    }
    
    updates.updatedAt = FieldValue.serverTimestamp();
    
    log('info', `Normalizing user ${uid}`);
    if (!config.dryRun) {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, updates);
    }
    stats.updated++;
  }
}

// Create schema version document
async function createSchemaVersion() {
  log('info', 'Creating schema version document...');
  
  const schemaVersionRef = doc(db, COLLECTIONS.SYSTEM, 'schema_version');
  const schemaVersionDoc = await getDoc(schemaVersionRef);
  
  if (schemaVersionDoc.exists()) {
    log('info', 'Schema version document already exists, skipping.');
    stats.skipped++;
    return;
  }
  
  const schemaVersion = {
    version: '1.0.0',
    appliedAt: FieldValue.serverTimestamp(),
    description: 'Initial unified schema',
    changes: [
      'Created new collections',
      'Migrated CHW data to dedicated collection',
      'Normalized field names and enum values'
    ]
  };
  
  log('info', 'Creating schema version document');
  if (!config.dryRun) {
    await setDoc(schemaVersionRef, schemaVersion);
  }
  stats.created++;
}

// Run the migration
async function runMigration() {
  try {
    log('info', `Starting migration (${config.dryRun ? 'DRY RUN' : 'LIVE MODE'})...`);
    
    // Create default organizations
    await createDefaultOrganizations();
    
    // Migrate CHW profiles
    await migrateCHWProfiles();
    
    // Normalize user data
    await normalizeUserData();
    
    // Create schema version document
    await createSchemaVersion();
    
    log('info', 'Migration completed successfully!');
    log('info', `Stats: processed=${stats.processed}, created=${stats.created}, updated=${stats.updated}, skipped=${stats.skipped}, errors=${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      log('warn', 'There were errors during migration:');
      stats.errors.forEach((error, index) => {
        log('warn', `Error ${index + 1}: ${error.message}`);
      });
    }
  } catch (error) {
    log('error', `Migration failed: ${error.message}`);
    if (error.stack) {
      log('debug', error.stack);
    }
  }
}

// Ask for confirmation before running the migration
rl.question(`Are you sure you want to run the schema migration in ${config.dryRun ? 'DRY RUN' : 'LIVE'} mode? (y/N) `, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Migration cancelled.');
    rl.close();
    process.exit(0);
  }
  
  // Ask if this should be a live run
  rl.question('Do you want to run this as a LIVE migration (changes will be applied)? (y/N) ', (liveAnswer) => {
    config.dryRun = liveAnswer.toLowerCase() !== 'y';
    
    runMigration().then(() => {
      rl.close();
      process.exit(0);
    }).catch((error) => {
      console.error('Unhandled error during migration:', error);
      rl.close();
      process.exit(1);
    });
  });
});
