const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const db = admin.firestore();

// Database schema initialization
async function initializeFirestore() {
  console.log('🚀 Initializing CHWOne Firestore Database Schema...');

  try {
    // 1. Create initial collections with sample documents
    await createUsersCollection();
    await createCHWsCollection();
    await createProjectsCollection();
    await createGrantsCollection();
    await createResourcesCollection();
    await createReferralsCollection();
    await createSurveyResultsCollection();
    await createAuditLogsCollection();
    await createAPIKeysCollection();

    console.log('✅ Database schema initialized successfully!');
    console.log('📋 Next steps:');
    console.log('1. Set up Firestore security rules');
    console.log('2. Create your first admin user');
    console.log('3. Start adding CHWs and resources');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Users Collection
async function createUsersCollection() {
  console.log('👥 Creating users collection...');
  
  const users = [
    {
      id: 'admin-user-456',
      email: 'admin@example.com',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      organization: 'CHWOne Platform',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    },
    {
      id: 'user1',
      email: 'coordinator@chwone.org',
      role: 'CHW_COORDINATOR',
      firstName: 'Sarah',
      lastName: 'Johnson',
      organization: 'Women Leading for Wellness and Justice',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    },
    {
      email: 'admin@chwone.org',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      organization: 'Women Leading for Wellness and Justice',
      phone: '+1-555-0100',
      address: {
        street: '123 Community Health Way',
        city: 'Charlotte',
        state: 'NC',
        zipCode: '28202'
      },
      isActive: true,
      hipaaAcknowledged: true,
      hipaaAcknowledgedDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];
    hipaaAcknowledged: true,
    hipaaAcknowledgedDate: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('users').doc('sample-admin').set(sampleUser);
  console.log('  ✓ Sample admin user created');
}

// Community Health Workers Collection
async function createCHWsCollection() {
  console.log('🏥 Creating CHWs collection...');
  
  const sampleCHW = {
    userId: 'sample-chw-user',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@chwone.org',
    phone: '+1-555-0101',
    certificationNumber: 'NC-CHW-2024-001',
    certificationDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
    certificationExpiry: admin.firestore.Timestamp.fromDate(new Date('2026-01-15')),
    specializations: ['Diabetes Management', 'Maternal Health', 'Mental Health'],
    languages: ['English', 'Spanish'],
    serviceArea: {
      counties: ['Mecklenburg', 'Union'],
      zipCodes: ['28202', '28203', '28204', '28205']
    },
    caseLoad: {
      current: 25,
      maximum: 50
    },
    status: 'active',
    assignedProjects: [],
    completedTraining: [
      {
        name: 'HIPAA Compliance',
        completedDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-20')),
        certificateUrl: ''
      }
    ],
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('chws').doc('sample-chw').set(sampleCHW);
  console.log('  ✓ Sample CHW created');
}

// Projects Collection
async function createProjectsCollection() {
  console.log('📊 Creating projects collection...');
  
  const sampleProject = {
    name: 'Diabetes Prevention Initiative',
    description: 'Community-based diabetes prevention program targeting high-risk populations in Mecklenburg County.',
    grantId: 'sample-grant',
    status: 'active',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
    endDate: admin.firestore.Timestamp.fromDate(new Date('2024-12-31')),
    targetPopulation: 'Adults 18-65 with pre-diabetes',
    goals: [
      'Reduce diabetes incidence by 20%',
      'Increase healthy lifestyle adoption',
      'Improve community health literacy'
    ],
    budget: 150000,
    spentAmount: 45000,
    assignedCHWs: ['sample-chw'],
    outcomes: [
      {
        metric: 'Participants Enrolled',
        target: 200,
        current: 156,
        unit: 'people'
      }
    ],
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('projects').doc('sample-project').set(sampleProject);
  console.log('  ✓ Sample project created');
}

// Grants Collection
async function createGrantsCollection() {
  console.log('💰 Creating grants collection...');
  
  const sampleGrant = {
    title: 'CDC Diabetes Prevention Grant 2024',
    description: 'Federal funding for community diabetes prevention programs',
    fundingSource: 'Centers for Disease Control and Prevention',
    amount: 500000,
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
    endDate: admin.firestore.Timestamp.fromDate(new Date('2026-12-31')),
    status: 'active',
    requirements: [
      'Quarterly progress reports',
      'Annual financial audit',
      'Community engagement metrics'
    ],
    contactPerson: 'Dr. Sarah Johnson, Program Officer',
    projectIds: ['sample-project'],
    reportingSchedule: [
      {
        type: 'quarterly',
        dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-04-01')),
        completed: false
      }
    ],
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('grants').doc('sample-grant').set(sampleGrant);
  console.log('  ✓ Sample grant created');
}

// Resources Collection (Region 5 Directory)
async function createResourcesCollection() {
  console.log('📋 Creating resources collection...');
  
  const sampleResource = {
    name: 'Mecklenburg County Health Department',
    type: 'Healthcare Provider',
    category: 'Primary Care',
    description: 'Comprehensive primary healthcare services for uninsured and underinsured residents',
    address: {
      street: '249 Billingsley Rd',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28211'
    },
    contact: {
      phone: '+1-980-314-9400',
      email: 'health.info@mecklenburgcountync.gov',
      website: 'https://www.mecknc.gov/healthdepartment'
    },
    services: [
      'Primary Care',
      'Immunizations',
      'STD Testing',
      'Family Planning',
      'WIC Program'
    ],
    eligibility: 'Uninsured and underinsured residents of Mecklenburg County',
    hours: {
      monday: '8:00 AM - 5:00 PM',
      tuesday: '8:00 AM - 5:00 PM',
      wednesday: '8:00 AM - 5:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 5:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    },
    languages: ['English', 'Spanish'],
    region5Certified: true,
    ncCare360Id: 'MCHD-001',
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('resources').doc('sample-resource').set(sampleResource);
  console.log('  ✓ Sample resource created');
}

// Referrals Collection (HIPAA Protected)
async function createReferralsCollection() {
  console.log('🔒 Creating referrals collection (HIPAA protected)...');
  
  const sampleReferral = {
    clientId: 'encrypted-client-id-123',
    chwId: 'sample-chw',
    resourceId: 'sample-resource',
    projectId: 'sample-project',
    referralReason: 'Primary care needs assessment',
    urgency: 'routine',
    status: 'pending',
    notes: 'Client needs diabetes screening and nutrition counseling',
    followUpDate: admin.firestore.Timestamp.fromDate(new Date('2024-02-15')),
    consentGiven: true,
    consentDate: admin.firestore.Timestamp.now(),
    hipaaAuthorization: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    // Encrypted client information
    clientInfo: {
      encrypted: true,
      encryptionMethod: 'AES-256',
      // In production, this would be encrypted
      firstName: '[ENCRYPTED]',
      lastName: '[ENCRYPTED]',
      phone: '[ENCRYPTED]',
      email: '[ENCRYPTED]'
    }
  };

  await db.collection('referrals').doc('sample-referral').set(sampleReferral);
  console.log('  ✓ Sample referral created (HIPAA compliant)');
}

// Survey Results Collection (Empower Project Integration)
async function createSurveyResultsCollection() {
  console.log('📊 Creating survey results collection...');
  
  const sampleSurveyResult = {
    projectId: 'sample-project',
    surveyType: 'empower_baseline',
    participantId: 'encrypted-participant-456',
    responses: {
      healthLiteracy: 7,
      selfEfficacy: 8,
      socialSupport: 6,
      accessToCare: 5,
      qualityOfLife: 7
    },
    completedDate: admin.firestore.Timestamp.now(),
    chwId: 'sample-chw',
    empowerProjectId: 'EMP-2024-001',
    isBaseline: true,
    followUpScheduled: admin.firestore.Timestamp.fromDate(new Date('2024-06-01')),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('surveyResults').doc('sample-survey').set(sampleSurveyResult);
  console.log('  ✓ Sample survey result created');
}

// Audit Logs Collection (HIPAA Compliance)
async function createAuditLogsCollection() {
  console.log('📝 Creating audit logs collection...');
  
  const sampleAuditLog = {
    userId: 'sample-admin',
    action: 'DATA_ACCESS',
    resourceType: 'referral',
    resourceId: 'sample-referral',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: admin.firestore.Timestamp.now(),
    changes: {
      field: 'status',
      oldValue: 'pending',
      newValue: 'completed'
    }
  };

  await db.collection('auditLogs').doc('sample-audit').set(sampleAuditLog);
  console.log('  ✓ Sample audit log created');
}

// API Keys Collection
async function createAPIKeysCollection() {
  console.log('🔑 Creating API keys collection...');
  
  const sampleAPIKey = {
    name: 'CHWOne Dashboard API',
    keyHash: 'sha256-hashed-api-key',
    userId: 'sample-admin',
    permissions: ['read:chws', 'read:projects', 'write:referrals'],
    isActive: true,
    lastUsed: null,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01')),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  await db.collection('apiKeys').doc('sample-api-key').set(sampleAPIKey);
  console.log('  ✓ Sample API key created');
}

// Run initialization
initializeFirestore().then(() => {
  console.log('🎉 CHWOne database schema deployment complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Deployment failed:', error);
  process.exit(1);
});
