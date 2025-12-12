import { NextResponse } from 'next/server';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';

export const dynamic = 'force-dynamic';

// County mapping for legacy data
const COUNTY_MAPPING: Record<string, string[]> = {
  // Direct mappings
  "Moore": ["Moore"],
  "Cumberland": ["Cumberland"],
  "Harnett": ["Harnett"],
  "Lee": ["Lee"],
  "Robeson": ["Robeson"],
  "Wake": ["Wake"],
  "Durham": ["Durham"],
  "Johnston": ["Johnston"],
  "Sampson": ["Sampson"],
  
  // Combined county mappings
  "Cum/Har/Moore": ["Cumberland", "Harnett", "Moore"],
  "Cumb/surr. counties": ["Cumberland"],
  "Cumberland/Sampson": ["Cumberland", "Sampson"],
  "Harn/Lee/Johnston": ["Harnett", "Lee", "Johnston"],
  "Harnett/Lee": ["Harnett", "Lee"],
  "Harnett/Lee/Moore & Cumberland": ["Harnett", "Lee", "Moore", "Cumberland"],
  "Harnett/Lee/Moore": ["Harnett", "Lee", "Moore"],
  
  // Statewide/All counties
  "All Counties": ["All NC Counties"],
  "All NC Counties": ["All NC Counties"],
};

/**
 * POST /api/sandhills-resources/migrate-counties
 * Migrates legacy county strings to the new counties array format
 */
export async function POST() {
  try {
    const resourcesRef = collection(db, 'sandhillsResources');
    const snapshot = await getDocs(resourcesRef);
    
    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const legacyCounty = data.county;
      
      // Skip if already has counties array
      if (data.counties && data.counties.length > 0) {
        skippedCount++;
        continue;
      }
      
      // Parse the legacy county string
      let counties: string[] = [];
      
      if (legacyCounty) {
        // Check direct mapping first
        if (COUNTY_MAPPING[legacyCounty]) {
          counties = COUNTY_MAPPING[legacyCounty];
        } else {
          // Try to parse the string
          counties = parseCountyString(legacyCounty);
        }
      }
      
      // Update the document
      try {
        const docRef = doc(db, 'sandhillsResources', docSnapshot.id);
        await updateDoc(docRef, { counties });
        migratedCount++;
      } catch (err) {
        errors.push(`Failed to update ${docSnapshot.id}: ${err}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration complete`,
      migratedCount,
      skippedCount,
      totalProcessed: snapshot.docs.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error migrating counties:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to migrate counties',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to parse county strings
function parseCountyString(countyStr: string): string[] {
  if (!countyStr) return [];
  
  const VALID_COUNTIES = [
    "Cumberland", "Durham", "Harnett", "Johnston", 
    "Lee", "Moore", "Robeson", "Sampson", "Wake"
  ];
  
  // Handle special cases
  if (countyStr === "All Counties" || countyStr === "All NC Counties") {
    return ["All NC Counties"];
  }
  
  // Parse combined county strings
  const normalized = countyStr
    .replace(/Cum\b/gi, "Cumberland")
    .replace(/Har\b/gi, "Harnett")
    .replace(/Cumb\b/gi, "Cumberland")
    .replace(/surr\. counties/gi, "")
    .replace(/&/g, "/")
    .replace(/,/g, "/");
  
  // Split by / and clean up
  const counties = normalized
    .split("/")
    .map(c => c.trim())
    .filter(c => c.length > 0)
    .map(c => {
      // Capitalize properly
      const lower = c.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });
  
  // Validate against known counties
  return counties.filter(c => 
    VALID_COUNTIES.includes(c) || c === "All NC Counties"
  );
}

/**
 * GET /api/sandhills-resources/migrate-counties
 * Preview what the migration would do
 */
export async function GET() {
  try {
    const resourcesRef = collection(db, 'sandhillsResources');
    const snapshot = await getDocs(resourcesRef);
    
    const preview: Array<{
      id: string;
      organization: string;
      legacyCounty: string;
      newCounties: string[];
    }> = [];
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const legacyCounty = data.county || '';
      
      let counties: string[] = [];
      if (COUNTY_MAPPING[legacyCounty]) {
        counties = COUNTY_MAPPING[legacyCounty];
      } else if (legacyCounty) {
        counties = parseCountyString(legacyCounty);
      }
      
      preview.push({
        id: docSnapshot.id,
        organization: data.organization,
        legacyCounty,
        newCounties: counties
      });
    }
    
    return NextResponse.json({
      totalRecords: preview.length,
      preview: preview.slice(0, 20), // Show first 20
      uniqueLegacyCounties: [...new Set(preview.map(p => p.legacyCounty))].sort()
    });
  } catch (error) {
    console.error('Error previewing migration:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
