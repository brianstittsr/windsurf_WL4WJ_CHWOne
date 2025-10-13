import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  COLLECTIONS, 
  Organization,
  UserRole,
  SchemaVersion,
  CURRENT_SCHEMA_VERSION
} from './unified-schema';

/**
 * Initialize the Firebase database schema
 * This function creates the necessary collections and documents
 * for the application to function properly
 */
export async function initializeFirebaseSchema() {
  try {
    console.log('Starting Firebase schema initialization...');
    
    // Check if schema is already initialized
    const schemaVersionRef = doc(db, 'system', 'schema_version');
    const schemaVersionDoc = await getDoc(schemaVersionRef);
    
    if (schemaVersionDoc.exists()) {
      const currentVersion = schemaVersionDoc.data().version;
      console.log(`Schema already initialized (version ${currentVersion})`);
      
      // Check if we need to upgrade
      if (currentVersion !== CURRENT_SCHEMA_VERSION) {
        console.log(`Schema upgrade needed: ${currentVersion} -> ${CURRENT_SCHEMA_VERSION}`);
        await upgradeSchema(currentVersion);
      }
      
      return true;
    }
    
    // Initialize organizations
    await initializeOrganizations();
    
    // Create schema version document
    await setDoc(schemaVersionRef, {
      version: CURRENT_SCHEMA_VERSION,
      appliedAt: Timestamp.now(),
      description: 'Initial schema creation',
      changes: ['Created default organizations', 'Set up initial collections']
    } as SchemaVersion);
    
    // Create a connection test document
    await setDoc(doc(db, 'system', 'connection_test'), {
      timestamp: Timestamp.now(),
      status: 'active'
    });
    
    console.log(`Schema initialization complete (version ${CURRENT_SCHEMA_VERSION})`);
    return true;
  } catch (error) {
    console.error('Error initializing Firebase schema:', error);
    return false;
  }
}

/**
 * Initialize organizations collection with default organizations
 */
async function initializeOrganizations() {
  // Check if the organizations collection exists and has the required documents
  const organizationsRef = collection(db, COLLECTIONS.ORGANIZATIONS);
  const organizationsSnapshot = await getDocs(organizationsRef);
  
  if (organizationsSnapshot.empty) {
    // Create default organizations
    await Promise.all([
      createDefaultOrganization('general', 'CHWOne Platform', 'CHWOne'),
      createDefaultOrganization('region5', 'Region 5 Health Department', 'Region 5'),
      createDefaultOrganization('wl4wj', 'Women Leading for Wellness & Justice', 'WL4WJ')
    ]);
    
    console.log('Created default organizations');
  } else {
    console.log(`Found ${organizationsSnapshot.size} existing organizations`);
  }
}

/**
 * Create a default organization
 */
async function createDefaultOrganization(id: string, name: string, shortName: string) {
  const organization: Organization = {
    id,
    name,
    shortName,
    description: `${name} organization for CHWOne platform`,
    type: id === 'general' ? 'community_org' : (id === 'region5' ? 'health_department' : 'nonprofit'),
    
    // Contact Information
    contactEmail: `contact@${id}.org`,
    contactPhone: '555-123-4567',
    website: `https://www.${id}.org`,
    address: {
      street: '123 Main St',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      county: 'Mecklenburg',
      country: 'USA'
    },
    
    // Branding
    logoUrl: `/images/${id}-logo.png`,
    faviconUrl: `/images/${id}-favicon.ico`,
    primaryColor: id === 'general' ? '#1a365d' : (id === 'region5' ? '#2a4365' : '#2c5282'),
    secondaryColor: id === 'general' ? '#4a5568' : (id === 'region5' ? '#718096' : '#2d3748'),
    fontFamily: 'Inter, sans-serif',
    
    // Settings
    settings: {
      allowPublicForms: true,
      requireApprovalForNewUsers: true,
      defaultUserRole: UserRole.CHW,
      maxFileSize: 10, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      emailTemplates: {
        welcomeMessage: `Welcome to ${name}! We're excited to have you join our platform.`,
        formSubmissionNotification: `A new form has been submitted on the ${name} platform.`,
        passwordReset: `You have requested a password reset for your ${name} account.`
      }
    },
    
    // Timestamps
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(doc(db, COLLECTIONS.ORGANIZATIONS, id), organization);
}

/**
 * Upgrade schema from previous version to current version
 */
async function upgradeSchema(fromVersion: string) {
  // Implement version-specific upgrade paths here
  console.log(`Upgrading schema from ${fromVersion} to ${CURRENT_SCHEMA_VERSION}`);
  
  // Example upgrade path
  if (fromVersion === '0.9.0') {
    // Perform upgrade steps
    console.log('Applying schema changes for 0.9.0 -> 1.0.0');
    
    // Update schema version document
    await setDoc(doc(db, 'system', 'schema_version'), {
      version: CURRENT_SCHEMA_VERSION,
      appliedAt: Timestamp.now(),
      description: 'Upgrade from 0.9.0 to 1.0.0',
      changes: ['Updated organization structure', 'Added new collections']
    } as SchemaVersion);
  }
  
  return true;
}

// Export a function to check schema version
export async function getSchemaVersion() {
  try {
    const schemaVersionRef = doc(db, 'system', 'schema_version');
    const schemaVersionDoc = await getDoc(schemaVersionRef);
    
    if (schemaVersionDoc.exists()) {
      return schemaVersionDoc.data() as SchemaVersion;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting schema version:', error);
    return null;
  }
}
