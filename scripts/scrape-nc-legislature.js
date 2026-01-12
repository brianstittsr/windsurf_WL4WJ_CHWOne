/**
 * NC Legislature Web Scraper
 * Extracts representative data from ncleg.gov and stores in Firebase
 * 
 * Usage: node scripts/scrape-nc-legislature.js
 * 
 * Requires: cheerio, node-fetch, firebase-admin
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin (use service account in production)
let db;
try {
  // Try to use existing app or initialize
  if (!admin.apps.length) {
    // For local development, use the Firebase config from environment
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Use default credentials (for local development with emulator)
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chwone-platform'
      });
    }
  }
  db = admin.firestore();
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
  console.log('Will save data to JSON files instead');
}

const BASE_URL = 'https://www.ncleg.gov';
const MEMBER_LIST_URL = `${BASE_URL}/Members/MemberList/H`;
const OUTPUT_DIR = path.join(__dirname, '../datafiles/nc-legislature');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Fetch HTML content from a URL
 */
async function fetchPage(url) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.text();
}

/**
 * Fetch image and convert to base64
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${imageUrl}`);
      return null;
    }
    
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = buffer.toString('base64');
    
    return {
      base64: base64,
      mimeType: contentType
    };
  } catch (error) {
    console.warn(`Error fetching image ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Parse the member list page to get all representative links
 */
async function getMemberList() {
  const html = await fetchPage(MEMBER_LIST_URL);
  const $ = cheerio.load(html);
  
  const members = [];
  
  // Find all member links - they follow pattern /Members/Biography/H/{id}
  $('a[href*="/Members/Biography/H/"]').each((i, elem) => {
    const href = $(elem).attr('href');
    const name = $(elem).text().trim();
    
    // Extract member ID from URL
    const match = href.match(/\/Members\/Biography\/H\/(\d+)/);
    if (match && name) {
      members.push({
        id: match[1],
        name: name,
        url: `${BASE_URL}${href}`
      });
    }
  });
  
  // Remove duplicates
  const uniqueMembers = [];
  const seenIds = new Set();
  for (const member of members) {
    if (!seenIds.has(member.id)) {
      seenIds.add(member.id);
      uniqueMembers.push(member);
    }
  }
  
  console.log(`Found ${uniqueMembers.length} unique representatives`);
  return uniqueMembers;
}

/**
 * Parse a representative's biography page
 */
async function parseBiographyPage(memberId) {
  const url = `${BASE_URL}/Members/Biography/H/${memberId}`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  
  const rep = {
    id: memberId,
    chamber: 'H',
    session: '2025-2026',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  // Extract name from page title or header
  const pageTitle = $('h1').first().text().trim();
  const nameMatch = pageTitle.match(/Representative\s+(.+?)\s*\(/);
  if (nameMatch) {
    rep.name = nameMatch[1].trim();
  }
  
  // Parse name parts
  if (rep.name) {
    const nameParts = rep.name.split(/\s+/);
    rep.firstName = nameParts[0];
    rep.lastName = nameParts[nameParts.length - 1];
    
    // Check for suffix
    const suffixes = ['Jr.', 'Jr', 'Sr.', 'Sr', 'II', 'III', 'IV', 'V', 'MD', 'Ph.D.'];
    if (suffixes.includes(rep.lastName)) {
      rep.suffix = rep.lastName;
      rep.lastName = nameParts[nameParts.length - 2];
    }
  }
  
  // Extract party from page
  const partyMatch = pageTitle.match(/\((Rep|Dem|Ind)\)/i) || 
                     $('body').text().match(/Republican|Democrat|Independent/i);
  if (partyMatch) {
    const partyText = partyMatch[0].toLowerCase();
    if (partyText.includes('rep')) rep.party = 'R';
    else if (partyText.includes('dem')) rep.party = 'D';
    else rep.party = 'I';
  }
  
  // Extract district
  const districtMatch = $('body').text().match(/District\s+(\d+)/i);
  if (districtMatch) {
    rep.district = parseInt(districtMatch[1]);
  }
  
  // Extract counties
  rep.counties = [];
  $('a[href*="/Members/CountyRepresentation/"]').each((i, elem) => {
    const county = $(elem).text().trim();
    if (county && !rep.counties.includes(county)) {
      rep.counties.push(county);
    }
  });
  
  // Extract contact info
  rep.contact = {
    legislativeOffice: {
      address: '',
      room: '',
      city: 'Raleigh',
      state: 'NC',
      zip: ''
    }
  };
  
  // Look for room number
  const roomMatch = $('body').text().match(/Rm\.?\s*(\d+[A-Z]?)/i);
  if (roomMatch) {
    rep.contact.legislativeOffice.room = roomMatch[1];
    rep.contact.legislativeOffice.address = `16 West Jones Street, Rm. ${roomMatch[1]}`;
  }
  
  // Look for phone
  const phoneMatch = $('body').text().match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/);
  if (phoneMatch) {
    rep.contact.mainPhone = phoneMatch[1];
  }
  
  // Look for terms
  const termsMatch = $('body').text().match(/Terms in House:\s*(\d+)/i);
  if (termsMatch) {
    rep.termsInHouse = parseInt(termsMatch[1]);
  } else {
    rep.termsInHouse = 0;
  }
  
  const senateTermsMatch = $('body').text().match(/(\d+)\s*in Senate/i);
  if (senateTermsMatch) {
    rep.termsInSenate = parseInt(senateTermsMatch[1]);
  } else {
    rep.termsInSenate = 0;
  }
  
  // Extract occupation
  const occupationMatch = $('body').text().match(/Occupation:\s*([^\n]+)/i);
  rep.biography = {
    occupation: occupationMatch ? occupationMatch[1].trim() : undefined
  };
  
  // Check for status (resigned, appointed)
  rep.status = 'active';
  const resignedMatch = $('body').text().match(/Resigned\s+(\d+\/\d+\/\d+)/i);
  if (resignedMatch) {
    rep.status = 'resigned';
    rep.statusDate = resignedMatch[1];
  }
  const appointedMatch = $('body').text().match(/Appointed\s+(\d+\/\d+\/\d+)/i);
  if (appointedMatch) {
    rep.status = 'appointed';
    rep.statusDate = appointedMatch[1];
  }
  
  // Extract photo
  const photoImg = $('img[src*="/Members/"]').first();
  if (photoImg.length) {
    rep.photoUrl = BASE_URL + photoImg.attr('src');
  }
  
  // Initialize empty arrays for bills, votes, committees
  rep.introducedBills = [];
  rep.votes = [];
  rep.committees = [];
  rep.searchKeywords = [];
  
  return rep;
}

/**
 * Parse introduced bills for a representative
 */
async function parseIntroducedBills(memberId) {
  const url = `${BASE_URL}/Members/IntroducedBills/H/${memberId}`;
  
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    
    const bills = [];
    
    // Look for bill links
    $('a[href*="/BillLookUp/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const billText = $(elem).text().trim();
      
      // Extract bill ID (e.g., HB123)
      const billMatch = billText.match(/([HS]B?\s*\d+)/i);
      if (billMatch) {
        const row = $(elem).closest('tr');
        const cells = row.find('td');
        
        bills.push({
          billId: billMatch[1].replace(/\s+/g, ''),
          session: '2025-2026',
          title: cells.eq(1).text().trim() || billText,
          status: cells.eq(2).text().trim() || 'Unknown',
          introducedDate: cells.eq(3).text().trim() || '',
          url: `${BASE_URL}${href}`,
          isPrimarySponsor: true
        });
      }
    });
    
    return bills;
  } catch (error) {
    console.warn(`Error fetching bills for member ${memberId}:`, error.message);
    return [];
  }
}

/**
 * Parse committees for a representative
 */
async function parseCommittees(memberId) {
  const url = `${BASE_URL}/Members/Committees/H/${memberId}`;
  
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    
    const committees = [];
    
    // Look for committee links
    $('a[href*="/Committees/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const committeeName = $(elem).text().trim();
      
      if (committeeName && !committeeName.includes('Committees')) {
        const row = $(elem).closest('tr, li, div');
        const roleText = row.text();
        
        let role = 'Member';
        if (roleText.includes('Chair') && !roleText.includes('Vice')) {
          role = 'Chair';
        } else if (roleText.includes('Vice Chair')) {
          role = 'Vice Chair';
        }
        
        // Determine chamber
        let chamber = 'H';
        if (href.includes('/S/') || committeeName.toLowerCase().includes('senate')) {
          chamber = 'S';
        } else if (committeeName.toLowerCase().includes('joint')) {
          chamber = 'Joint';
        }
        
        committees.push({
          committeeId: href.split('/').pop() || committeeName.replace(/\s+/g, '-'),
          committeeName: committeeName,
          chamber: chamber,
          role: role,
          session: '2025-2026',
          url: `${BASE_URL}${href}`
        });
      }
    });
    
    return committees;
  } catch (error) {
    console.warn(`Error fetching committees for member ${memberId}:`, error.message);
    return [];
  }
}

/**
 * Parse votes for a representative (limited sample)
 */
async function parseVotes(memberId) {
  const url = `${BASE_URL}/Members/Votes/H/${memberId}`;
  
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    
    const votes = [];
    
    // Look for vote records - typically in a table
    $('table tr').each((i, elem) => {
      if (i === 0) return; // Skip header
      
      const cells = $(elem).find('td');
      if (cells.length >= 3) {
        const billLink = cells.eq(0).find('a');
        const billId = billLink.text().trim();
        const voteText = cells.eq(2).text().trim();
        const dateText = cells.eq(1).text().trim();
        
        if (billId && voteText) {
          let vote = 'Not Voting';
          if (voteText.toLowerCase().includes('aye') || voteText.toLowerCase().includes('yes')) {
            vote = 'Aye';
          } else if (voteText.toLowerCase().includes('no') || voteText.toLowerCase().includes('nay')) {
            vote = 'No';
          } else if (voteText.toLowerCase().includes('absent')) {
            vote = 'Absent';
          } else if (voteText.toLowerCase().includes('excused')) {
            vote = 'Excused';
          }
          
          votes.push({
            billId: billId,
            session: '2025-2026',
            voteDate: dateText,
            vote: vote,
            url: billLink.attr('href') ? `${BASE_URL}${billLink.attr('href')}` : undefined
          });
        }
      }
    });
    
    // Limit to recent votes
    return votes.slice(0, 50);
  } catch (error) {
    console.warn(`Error fetching votes for member ${memberId}:`, error.message);
    return [];
  }
}

/**
 * Generate search keywords for a representative
 */
function generateSearchKeywords(rep) {
  const keywords = new Set();
  
  // Name parts
  if (rep.firstName) keywords.add(rep.firstName.toLowerCase());
  if (rep.lastName) keywords.add(rep.lastName.toLowerCase());
  if (rep.name) keywords.add(rep.name.toLowerCase());
  
  // Party
  keywords.add(rep.party.toLowerCase());
  keywords.add(rep.party === 'R' ? 'republican' : rep.party === 'D' ? 'democrat' : 'independent');
  
  // District
  keywords.add(`district ${rep.district}`);
  
  // Counties
  if (rep.counties) {
    rep.counties.forEach(county => keywords.add(county.toLowerCase()));
  }
  
  // Occupation
  if (rep.biography?.occupation) {
    rep.biography.occupation.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  }
  
  // Committees
  if (rep.committees) {
    rep.committees.forEach(c => {
      c.committeeName.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    });
  }
  
  return Array.from(keywords);
}

/**
 * Save representative to Firebase
 */
async function saveToFirebase(rep) {
  if (!db) {
    console.log('Firebase not available, skipping database save');
    return;
  }
  
  try {
    const docRef = db.collection('nc_representatives').doc(`H-${rep.id}`);
    await docRef.set(rep, { merge: true });
    
    // Also save to search index
    const searchIndex = {
      id: `H-${rep.id}`,
      name: rep.name,
      party: rep.party,
      district: rep.district,
      counties: rep.counties,
      occupation: rep.biography?.occupation,
      committees: rep.committees.map(c => c.committeeName),
      keywords: rep.searchKeywords,
      summary: `${rep.name} is a ${rep.party === 'R' ? 'Republican' : 'Democrat'} representing District ${rep.district} (${rep.counties.join(', ')}).`
    };
    
    const searchDocRef = db.collection('nc_representatives_search').doc(`H-${rep.id}`);
    await searchDocRef.set(searchIndex);
    
    console.log(`Saved ${rep.name} to Firebase`);
  } catch (error) {
    console.error(`Error saving ${rep.name} to Firebase:`, error.message);
  }
}

/**
 * Save representative to JSON file
 */
function saveToJson(rep) {
  const filename = path.join(OUTPUT_DIR, `rep-${rep.id}.json`);
  fs.writeFileSync(filename, JSON.stringify(rep, null, 2));
  console.log(`Saved ${rep.name} to ${filename}`);
}

/**
 * Main scraping function
 */
async function scrapeNCLegislature() {
  console.log('Starting NC Legislature scrape...');
  console.log('='.repeat(50));
  
  // Get list of all members
  const members = await getMemberList();
  
  const allRepresentatives = [];
  
  // Process each member
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    console.log(`\n[${i + 1}/${members.length}] Processing ${member.name}...`);
    
    try {
      // Parse biography
      const rep = await parseBiographyPage(member.id);
      
      // Parse additional data
      rep.introducedBills = await parseIntroducedBills(member.id);
      rep.committees = await parseCommittees(member.id);
      rep.votes = await parseVotes(member.id);
      
      // Fetch and convert image to base64
      if (rep.photoUrl) {
        console.log(`  Fetching photo...`);
        const imageData = await fetchImageAsBase64(rep.photoUrl);
        if (imageData) {
          rep.photoBase64 = imageData.base64;
          rep.photoMimeType = imageData.mimeType;
        }
      }
      
      // Generate search keywords
      rep.searchKeywords = generateSearchKeywords(rep);
      
      // Save to Firebase and JSON
      await saveToFirebase(rep);
      saveToJson(rep);
      
      allRepresentatives.push(rep);
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing ${member.name}:`, error.message);
    }
  }
  
  // Save summary file
  const summaryFile = path.join(OUTPUT_DIR, 'all-representatives.json');
  fs.writeFileSync(summaryFile, JSON.stringify(allRepresentatives, null, 2));
  console.log(`\nSaved all ${allRepresentatives.length} representatives to ${summaryFile}`);
  
  // Generate stats
  const stats = {
    total: allRepresentatives.length,
    republicans: allRepresentatives.filter(r => r.party === 'R').length,
    democrats: allRepresentatives.filter(r => r.party === 'D').length,
    active: allRepresentatives.filter(r => r.status === 'active').length,
    resigned: allRepresentatives.filter(r => r.status === 'resigned').length,
    appointed: allRepresentatives.filter(r => r.status === 'appointed').length,
    withPhotos: allRepresentatives.filter(r => r.photoBase64).length,
    scrapedAt: new Date().toISOString()
  };
  
  const statsFile = path.join(OUTPUT_DIR, 'scrape-stats.json');
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  
  console.log('\n' + '='.repeat(50));
  console.log('Scrape complete!');
  console.log(`Total: ${stats.total}`);
  console.log(`Republicans: ${stats.republicans}`);
  console.log(`Democrats: ${stats.democrats}`);
  console.log(`With photos: ${stats.withPhotos}`);
  console.log('='.repeat(50));
}

// Run the scraper
scrapeNCLegislature().catch(console.error);
