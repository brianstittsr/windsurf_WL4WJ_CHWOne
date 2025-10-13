/**
 * Migration Tool for CHWOne Unified Schema
 * 
 * This tool helps migrate existing data to the new unified schema.
 * It provides functions to:
 * 1. Validate existing data against the new schema
 * 2. Migrate data from old schema to new schema
 * 3. Generate reports on data that needs manual intervention
 */

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  writeBatch,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as schema from './unified-schema';

// Migration configuration
interface MigrationConfig {
  dryRun: boolean;  // If true, don't actually write any changes
  batchSize: number; // Number of documents to process in a single batch
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  collections: string[]; // Collections to migrate
}

// Default configuration
const DEFAULT_CONFIG: MigrationConfig = {
  dryRun: true,
  batchSize: 100,
  logLevel: 'info',
  collections: Object.values(schema.COLLECTIONS)
};

// Migration result
interface MigrationResult {
  collection: string;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: Array<{
    docId: string;
    error: string;
    data?: any;
  }>;
}

/**
 * Validate a document against the schema
 */
function validateDocument(collectionName: string, data: DocumentData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation based on collection type
  switch (collectionName) {
    case schema.COLLECTIONS.USERS:
      if (!data.uid) errors.push('Missing uid');
      if (!data.email) errors.push('Missing email');
      if (!data.role) errors.push('Missing role');
      break;
    case schema.COLLECTIONS.CHW_PROFILES:
      if (!data.uid) errors.push('Missing uid');
      if (!data.firstName) errors.push('Missing firstName');
      if (!data.lastName) errors.push('Missing lastName');
      if (!data.certificationNumber) errors.push('Missing certificationNumber');
      break;
    case schema.COLLECTIONS.ORGANIZATIONS:
      if (!data.id) errors.push('Missing id');
      if (!data.name) errors.push('Missing name');
      break;
    case schema.COLLECTIONS.FORMS:
      if (!data.title) errors.push('Missing title');
      if (!data.fields) errors.push('Missing fields');
      break;
    case schema.COLLECTIONS.GRANTS:
      if (!data.title) errors.push('Missing title');
      if (!data.amount) errors.push('Missing amount');
      if (!data.startDate) errors.push('Missing startDate');
      if (!data.endDate) errors.push('Missing endDate');
      break;
    case schema.COLLECTIONS.PROJECTS:
      if (!data.name) errors.push('Missing name');
      if (!data.status) errors.push('Missing status');
      break;
    case schema.COLLECTIONS.CLIENTS:
      if (!data.firstName) errors.push('Missing firstName');
      if (!data.lastName) errors.push('Missing lastName');
      break;
    case schema.COLLECTIONS.REFERRALS:
      if (!data.clientId) errors.push('Missing clientId');
      if (!data.resourceId) errors.push('Missing resourceId');
      break;
    // Add more collection validations as needed
  }

  // Common validations for all documents
  if (collectionName !== schema.COLLECTIONS.DASHBOARD_METRICS) {
    if (!data.createdAt) errors.push('Missing createdAt');
    if (!data.updatedAt) errors.push('Missing updatedAt');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Migrate a document to the new schema
 */
function migrateDocument(collectionName: string, docId: string, data: DocumentData): DocumentData {
  const migratedData = { ...data };

  // Common migrations for all documents
  if (!migratedData.createdAt) {
    migratedData.createdAt = Timestamp.now();
  }
  if (!migratedData.updatedAt) {
    migratedData.updatedAt = Timestamp.now();
  }

  // Collection-specific migrations
  switch (collectionName) {
    case schema.COLLECTIONS.USERS:
      // Migrate user role if needed
      if (migratedData.role === 'admin') migratedData.role = schema.UserRole.ADMIN;
      if (migratedData.role === 'chw') migratedData.role = schema.UserRole.CHW;
      if (migratedData.role === 'chw_coordinator') migratedData.role = schema.UserRole.CHW_COORDINATOR;
      if (migratedData.role === 'nonprofit_staff') migratedData.role = schema.UserRole.NONPROFIT_STAFF;
      
      // Add organizationId if missing
      if (!migratedData.organizationId) {
        migratedData.organizationId = 'general';
      }
      break;
    
    case schema.COLLECTIONS.GRANTS:
      // Convert dates to Timestamps if they're not already
      if (migratedData.startDate && !(migratedData.startDate instanceof Timestamp)) {
        migratedData.startDate = Timestamp.fromDate(new Date(migratedData.startDate));
      }
      if (migratedData.endDate && !(migratedData.endDate instanceof Timestamp)) {
        migratedData.endDate = Timestamp.fromDate(new Date(migratedData.endDate));
      }
      
      // Add organizationId if missing
      if (!migratedData.organizationId) {
        migratedData.organizationId = 'general';
      }
      break;
    
    // Add more collection-specific migrations as needed
  }

  return migratedData;
}

/**
 * Migrate a single collection
 */
async function migrateCollection(collectionName: string, config: MigrationConfig): Promise<MigrationResult> {
  console.log(`Migrating collection: ${collectionName}`);
  
  const result: MigrationResult = {
    collection: collectionName,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Get all documents in the collection
    const querySnapshot = await getDocs(collection(db, collectionName));
    result.processed = querySnapshot.size;
    
    // Process documents in batches
    const batches: Array<{ id: string; data: DocumentData }> = [];
    querySnapshot.forEach(doc => {
      batches.push({ id: doc.id, data: doc.data() });
    });

    // Process each batch
    for (let i = 0; i < batches.length; i += config.batchSize) {
      const batch = writeBatch(db);
      const currentBatch = batches.slice(i, i + config.batchSize);
      
      for (const { id, data } of currentBatch) {
        // Validate document
        const validation = validateDocument(collectionName, data);
        
        if (!validation.valid) {
          if (config.logLevel === 'debug' || config.logLevel === 'info') {
            console.warn(`Document ${id} in ${collectionName} has validation errors:`, validation.errors);
          }
          
          // Try to migrate the document
          const migratedData = migrateDocument(collectionName, id, data);
          const migratedValidation = validateDocument(collectionName, migratedData);
          
          if (migratedValidation.valid) {
            // Migration fixed the validation issues
            if (!config.dryRun) {
              batch.set(doc(db, collectionName, id), migratedData);
            }
            result.succeeded++;
          } else {
            // Migration couldn't fix all issues
            result.failed++;
            result.errors.push({
              docId: id,
              error: `Validation failed: ${migratedValidation.errors.join(', ')}`,
              data: migratedData
            });
          }
        } else {
          // Document is already valid
          result.skipped++;
        }
      }
      
      // Commit the batch if not in dry run mode
      if (!config.dryRun) {
        await batch.commit();
      }
      
      if (config.logLevel === 'debug' || config.logLevel === 'info') {
        console.log(`Processed batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(batches.length / config.batchSize)}`);
      }
    }
  } catch (error) {
    console.error(`Error migrating collection ${collectionName}:`, error);
    result.failed = result.processed - result.succeeded - result.skipped;
  }
  
  return result;
}

/**
 * Run the migration for all specified collections
 */
export async function runMigration(config: Partial<MigrationConfig> = {}): Promise<MigrationResult[]> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const results: MigrationResult[] = [];
  
  console.log(`Starting migration with config:`, fullConfig);
  console.log(`Dry run mode: ${fullConfig.dryRun ? 'ON' : 'OFF'}`);
  
  for (const collectionName of fullConfig.collections) {
    const result = await migrateCollection(collectionName, fullConfig);
    results.push(result);
    
    console.log(`Migration results for ${collectionName}:`);
    console.log(`- Processed: ${result.processed}`);
    console.log(`- Succeeded: ${result.succeeded}`);
    console.log(`- Failed: ${result.failed}`);
    console.log(`- Skipped: ${result.skipped}`);
    
    if (result.errors.length > 0 && (fullConfig.logLevel === 'debug' || fullConfig.logLevel === 'info')) {
      console.log(`- Errors: ${result.errors.length}`);
      if (fullConfig.logLevel === 'debug') {
        console.log(result.errors);
      }
    }
  }
  
  return results;
}

/**
 * Generate a migration report
 */
export function generateMigrationReport(results: MigrationResult[]): string {
  let report = '# Migration Report\n\n';
  
  // Summary
  report += '## Summary\n\n';
  const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
  const totalSucceeded = results.reduce((sum, r) => sum + r.succeeded, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  
  report += `- Total documents processed: ${totalProcessed}\n`;
  report += `- Successfully migrated: ${totalSucceeded}\n`;
  report += `- Failed to migrate: ${totalFailed}\n`;
  report += `- Already valid (skipped): ${totalSkipped}\n\n`;
  
  // Collection details
  report += '## Collection Details\n\n';
  
  for (const result of results) {
    report += `### ${result.collection}\n\n`;
    report += `- Processed: ${result.processed}\n`;
    report += `- Succeeded: ${result.succeeded}\n`;
    report += `- Failed: ${result.failed}\n`;
    report += `- Skipped: ${result.skipped}\n\n`;
    
    if (result.errors.length > 0) {
      report += '#### Errors\n\n';
      for (const error of result.errors) {
        report += `- Document ID: ${error.docId}\n`;
        report += `  - Error: ${error.error}\n\n`;
      }
    }
  }
  
  return report;
}

/**
 * Migration CLI interface
 */
export async function runMigrationCLI() {
  // This function would be used in a Node.js script to run the migration from the command line
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--commit');
  const verbose = args.includes('--verbose');
  
  const config: MigrationConfig = {
    ...DEFAULT_CONFIG,
    dryRun,
    logLevel: verbose ? 'debug' : 'info'
  };
  
  // Filter collections if specified
  const collectionArg = args.find(arg => arg.startsWith('--collections='));
  if (collectionArg) {
    const collections = collectionArg.replace('--collections=', '').split(',');
    config.collections = collections;
  }
  
  const results = await runMigration(config);
  const report = generateMigrationReport(results);
  
  console.log(report);
  
  // Save report to file
  if (args.includes('--save-report')) {
    const fs = require('fs');
    fs.writeFileSync('migration-report.md', report);
    console.log('Report saved to migration-report.md');
  }
}
