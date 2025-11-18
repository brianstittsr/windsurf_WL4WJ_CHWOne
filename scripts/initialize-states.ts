import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// All 50 US States with their data
const states = [
  { name: 'Alabama', abbreviation: 'AL', region: 'South', population: 5024279 },
  { name: 'Alaska', abbreviation: 'AK', region: 'West', population: 733391 },
  { name: 'Arizona', abbreviation: 'AZ', region: 'West', population: 7151502 },
  { name: 'Arkansas', abbreviation: 'AR', region: 'South', population: 3011524 },
  { name: 'California', abbreviation: 'CA', region: 'West', population: 39538223 },
  { name: 'Colorado', abbreviation: 'CO', region: 'West', population: 5773714 },
  { name: 'Connecticut', abbreviation: 'CT', region: 'Northeast', population: 3605944 },
  { name: 'Delaware', abbreviation: 'DE', region: 'South', population: 989948 },
  { name: 'Florida', abbreviation: 'FL', region: 'South', population: 21538187 },
  { name: 'Georgia', abbreviation: 'GA', region: 'South', population: 10711908 },
  { name: 'Hawaii', abbreviation: 'HI', region: 'West', population: 1455271 },
  { name: 'Idaho', abbreviation: 'ID', region: 'West', population: 1839106 },
  { name: 'Illinois', abbreviation: 'IL', region: 'Midwest', population: 12812508 },
  { name: 'Indiana', abbreviation: 'IN', region: 'Midwest', population: 6785528 },
  { name: 'Iowa', abbreviation: 'IA', region: 'Midwest', population: 3190369 },
  { name: 'Kansas', abbreviation: 'KS', region: 'Midwest', population: 2937880 },
  { name: 'Kentucky', abbreviation: 'KY', region: 'South', population: 4505836 },
  { name: 'Louisiana', abbreviation: 'LA', region: 'South', population: 4657757 },
  { name: 'Maine', abbreviation: 'ME', region: 'Northeast', population: 1362359 },
  { name: 'Maryland', abbreviation: 'MD', region: 'South', population: 6177224 },
  { name: 'Massachusetts', abbreviation: 'MA', region: 'Northeast', population: 7029917 },
  { name: 'Michigan', abbreviation: 'MI', region: 'Midwest', population: 10077331 },
  { name: 'Minnesota', abbreviation: 'MN', region: 'Midwest', population: 5706494 },
  { name: 'Mississippi', abbreviation: 'MS', region: 'South', population: 2961279 },
  { name: 'Missouri', abbreviation: 'MO', region: 'Midwest', population: 6154913 },
  { name: 'Montana', abbreviation: 'MT', region: 'West', population: 1084225 },
  { name: 'Nebraska', abbreviation: 'NE', region: 'Midwest', population: 1961504 },
  { name: 'Nevada', abbreviation: 'NV', region: 'West', population: 3104614 },
  { name: 'New Hampshire', abbreviation: 'NH', region: 'Northeast', population: 1377529 },
  { name: 'New Jersey', abbreviation: 'NJ', region: 'Northeast', population: 9288994 },
  { name: 'New Mexico', abbreviation: 'NM', region: 'West', population: 2117522 },
  { name: 'New York', abbreviation: 'NY', region: 'Northeast', population: 20201249 },
  { name: 'North Carolina', abbreviation: 'NC', region: 'South', population: 10439388 },
  { name: 'North Dakota', abbreviation: 'ND', region: 'Midwest', population: 779094 },
  { name: 'Ohio', abbreviation: 'OH', region: 'Midwest', population: 11799448 },
  { name: 'Oklahoma', abbreviation: 'OK', region: 'South', population: 3959353 },
  { name: 'Oregon', abbreviation: 'OR', region: 'West', population: 4237256 },
  { name: 'Pennsylvania', abbreviation: 'PA', region: 'Northeast', population: 13002700 },
  { name: 'Rhode Island', abbreviation: 'RI', region: 'Northeast', population: 1097379 },
  { name: 'South Carolina', abbreviation: 'SC', region: 'South', population: 5118425 },
  { name: 'South Dakota', abbreviation: 'SD', region: 'Midwest', population: 886667 },
  { name: 'Tennessee', abbreviation: 'TN', region: 'South', population: 6910840 },
  { name: 'Texas', abbreviation: 'TX', region: 'South', population: 29145505 },
  { name: 'Utah', abbreviation: 'UT', region: 'West', population: 3271616 },
  { name: 'Vermont', abbreviation: 'VT', region: 'Northeast', population: 643077 },
  { name: 'Virginia', abbreviation: 'VA', region: 'South', population: 8631393 },
  { name: 'Washington', abbreviation: 'WA', region: 'West', population: 7705281 },
  { name: 'West Virginia', abbreviation: 'WV', region: 'South', population: 1793716 },
  { name: 'Wisconsin', abbreviation: 'WI', region: 'Midwest', population: 5893718 },
  { name: 'Wyoming', abbreviation: 'WY', region: 'West', population: 576851 }
];

async function initializeStates() {
  console.log('Starting state initialization...');
  
  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const state of states) {
      const stateId = `state-${state.abbreviation.toLowerCase()}`;
      const stateRef = db.collection('states').doc(stateId);
      
      // Check if state already exists
      const stateDoc = await stateRef.get();
      
      if (stateDoc.exists) {
        console.log(`⏭️  Skipping ${state.name} (${state.abbreviation}) - already exists`);
        skippedCount++;
        continue;
      }

      // Create state record
      const stateData = {
        id: stateId,
        name: state.name,
        abbreviation: state.abbreviation,
        region: state.region,
        population: state.population,
        status: 'active',
        hasAssociation: false,
        associationId: null,
        contactEmail: '',
        contactPhone: '',
        website: '',
        description: `State of ${state.name}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          chwCount: 0,
          nonprofitCount: 0,
          certifiedCHWCount: 0
        }
      };

      await stateRef.set(stateData);
      console.log(`✅ Added ${state.name} (${state.abbreviation})`);
      addedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Added: ${addedCount} states`);
    console.log(`⏭️  Skipped: ${skippedCount} states (already existed)`);
    console.log(`📝 Total: ${states.length} states`);
    console.log('\n✨ State initialization complete!');

  } catch (error) {
    console.error('❌ Error initializing states:', error);
    throw error;
  }
}

// Run the initialization
initializeStates()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
