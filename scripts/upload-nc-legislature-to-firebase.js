/**
 * Upload NC Legislature data to Firebase
 * 
 * This script reads the scraped JSON files and uploads them to Firebase
 * Run this after the scraper has completed.
 * 
 * Usage: node scripts/upload-nc-legislature-to-firebase.js
 */

const fs = require('fs');
const path = require('path');

// Firebase client SDK (for browser-compatible upload)
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, writeBatch } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DATA_DIR = path.join(__dirname, '../datafiles/nc-legislature');
const COLLECTION_NAME = 'nc_representatives';
const SEARCH_INDEX_COLLECTION = 'nc_representatives_search';

async function uploadRepresentatives() {
  console.log('Starting upload to Firebase...');
  console.log('Project ID:', firebaseConfig.projectId);
  
  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error('Data directory not found. Run the scraper first.');
    process.exit(1);
  }
  
  // Read all representative JSON files
  const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('rep-') && f.endsWith('.json'));
  console.log(`Found ${files.length} representative files`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const docId = `${data.chamber}-${data.id}`;
      
      // Upload main document
      const docRef = doc(db, COLLECTION_NAME, docId);
      await setDoc(docRef, data, { merge: true });
      
      // Create and upload search index
      const searchIndex = {
        id: docId,
        name: data.name,
        party: data.party,
        district: data.district,
        counties: data.counties || [],
        occupation: data.biography?.occupation || '',
        committees: (data.committees || []).map(c => c.committeeName.split('\n')[0].trim()),
        keywords: data.searchKeywords || [],
        summary: generateSummary(data),
        lastUpdated: new Date().toISOString()
      };
      
      const searchDocRef = doc(db, SEARCH_INDEX_COLLECTION, docId);
      await setDoc(searchDocRef, searchIndex, { merge: true });
      
      console.log(`✓ Uploaded ${data.name}`);
      successCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`✗ Error uploading ${file}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Upload complete!');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(50));
}

function generateSummary(rep) {
  const partyName = rep.party === 'R' ? 'Republican' : rep.party === 'D' ? 'Democrat' : 'Independent';
  const counties = (rep.counties || []).join(', ');
  const committees = (rep.committees || []).slice(0, 3).map(c => c.committeeName.split('\n')[0].trim()).join(', ');
  
  let summary = `${rep.name} is a ${partyName} member of the North Carolina House of Representatives, representing District ${rep.district}`;
  
  if (counties) {
    summary += ` (${counties})`;
  }
  summary += '.';
  
  if (rep.biography?.occupation) {
    summary += ` Their occupation is ${rep.biography.occupation}.`;
  }
  
  if (committees) {
    summary += ` They serve on committees including ${committees}.`;
  }
  
  if (rep.termsInHouse) {
    summary += ` They have served ${rep.termsInHouse} terms in the House.`;
  }
  
  return summary;
}

// Run the upload
uploadRepresentatives().catch(console.error);
