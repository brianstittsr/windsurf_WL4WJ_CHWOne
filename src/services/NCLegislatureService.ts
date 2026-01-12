/**
 * NC Legislature Service
 * Firebase service for storing and retrieving NC Representative data
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  NCRepresentative, 
  NCBillReference, 
  NCCommitteeMembership, 
  NCVoteRecord,
  NCRepresentativeSearchIndex 
} from '@/types/ncleg/representative';

const COLLECTION_NAME = 'nc_representatives';
const SEARCH_INDEX_COLLECTION = 'nc_representatives_search';

export class NCLegislatureService {
  /**
   * Save or update a representative
   */
  static async saveRepresentative(rep: NCRepresentative): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, `${rep.chamber}-${rep.id}`);
    await setDoc(docRef, {
      ...rep,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    
    // Also update search index
    await this.updateSearchIndex(rep);
  }

  /**
   * Save multiple representatives in a batch
   */
  static async saveRepresentativesBatch(reps: NCRepresentative[]): Promise<void> {
    const batch = writeBatch(db);
    
    for (const rep of reps) {
      const docRef = doc(db, COLLECTION_NAME, `${rep.chamber}-${rep.id}`);
      batch.set(docRef, {
        ...rep,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
    }
    
    await batch.commit();
    
    // Update search indices
    for (const rep of reps) {
      await this.updateSearchIndex(rep);
    }
  }

  /**
   * Get a representative by ID
   */
  static async getRepresentative(chamber: 'H' | 'S', id: string): Promise<NCRepresentative | null> {
    const docRef = doc(db, COLLECTION_NAME, `${chamber}-${id}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as NCRepresentative;
    }
    return null;
  }

  /**
   * Get all representatives
   */
  static async getAllRepresentatives(chamber?: 'H' | 'S'): Promise<NCRepresentative[]> {
    let q;
    if (chamber) {
      q = query(collection(db, COLLECTION_NAME), where('chamber', '==', chamber));
    } else {
      q = query(collection(db, COLLECTION_NAME));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NCRepresentative);
  }

  /**
   * Get representatives by party
   */
  static async getRepresentativesByParty(party: 'R' | 'D' | 'I'): Promise<NCRepresentative[]> {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('party', '==', party),
      orderBy('lastName')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NCRepresentative);
  }

  /**
   * Get representatives by county
   */
  static async getRepresentativesByCounty(county: string): Promise<NCRepresentative[]> {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('counties', 'array-contains', county)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NCRepresentative);
  }

  /**
   * Get representatives by district
   */
  static async getRepresentativesByDistrict(district: number, chamber?: 'H' | 'S'): Promise<NCRepresentative[]> {
    let q;
    if (chamber) {
      q = query(
        collection(db, COLLECTION_NAME), 
        where('district', '==', district),
        where('chamber', '==', chamber)
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME), 
        where('district', '==', district)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as NCRepresentative);
  }

  /**
   * Search representatives by keyword
   */
  static async searchRepresentatives(keyword: string): Promise<NCRepresentative[]> {
    // First search the search index
    const searchQ = query(
      collection(db, SEARCH_INDEX_COLLECTION),
      where('keywords', 'array-contains', keyword.toLowerCase())
    );
    
    const searchSnapshot = await getDocs(searchQ);
    const ids = searchSnapshot.docs.map(doc => doc.id);
    
    // Then fetch full representative data
    const reps: NCRepresentative[] = [];
    for (const id of ids) {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        reps.push(docSnap.data() as NCRepresentative);
      }
    }
    
    return reps;
  }

  /**
   * Update search index for a representative
   */
  private static async updateSearchIndex(rep: NCRepresentative): Promise<void> {
    const searchIndex: NCRepresentativeSearchIndex = {
      id: `${rep.chamber}-${rep.id}`,
      name: rep.name,
      party: rep.party,
      district: rep.district,
      counties: rep.counties,
      occupation: rep.biography.occupation,
      committees: rep.committees.map(c => c.committeeName),
      keywords: this.generateKeywords(rep),
      summary: this.generateSummary(rep),
    };
    
    const docRef = doc(db, SEARCH_INDEX_COLLECTION, `${rep.chamber}-${rep.id}`);
    await setDoc(docRef, searchIndex);
  }

  /**
   * Generate search keywords for a representative
   */
  private static generateKeywords(rep: NCRepresentative): string[] {
    const keywords = new Set<string>();
    
    // Name parts
    keywords.add(rep.firstName.toLowerCase());
    keywords.add(rep.lastName.toLowerCase());
    keywords.add(rep.name.toLowerCase());
    
    // Party
    keywords.add(rep.party.toLowerCase());
    keywords.add(rep.party === 'R' ? 'republican' : rep.party === 'D' ? 'democrat' : 'independent');
    
    // District
    keywords.add(`district ${rep.district}`);
    keywords.add(`district${rep.district}`);
    
    // Counties
    rep.counties.forEach(county => keywords.add(county.toLowerCase()));
    
    // Occupation
    if (rep.biography.occupation) {
      rep.biography.occupation.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }
    
    // Committees
    rep.committees.forEach(c => {
      c.committeeName.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    });
    
    return Array.from(keywords);
  }

  /**
   * Generate AI-friendly summary for a representative
   */
  private static generateSummary(rep: NCRepresentative): string {
    const partyName = rep.party === 'R' ? 'Republican' : rep.party === 'D' ? 'Democrat' : 'Independent';
    const counties = rep.counties.join(', ');
    const committees = rep.committees.slice(0, 3).map(c => c.committeeName).join(', ');
    
    let summary = `${rep.name} is a ${partyName} member of the North Carolina House of Representatives, representing District ${rep.district} (${counties}).`;
    
    if (rep.biography.occupation) {
      summary += ` Their occupation is ${rep.biography.occupation}.`;
    }
    
    if (committees) {
      summary += ` They serve on committees including ${committees}.`;
    }
    
    summary += ` They have served ${rep.termsInHouse} terms in the House.`;
    
    return summary;
  }

  /**
   * Delete a representative
   */
  static async deleteRepresentative(chamber: 'H' | 'S', id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, `${chamber}-${id}`);
    await deleteDoc(docRef);
    
    const searchDocRef = doc(db, SEARCH_INDEX_COLLECTION, `${chamber}-${id}`);
    await deleteDoc(searchDocRef);
  }

  /**
   * Get representatives for AI chat context
   */
  static async getRepresentativesForAI(options?: {
    party?: 'R' | 'D' | 'I';
    county?: string;
    district?: number;
    limit?: number;
  }): Promise<{ summary: string; representatives: NCRepresentativeSearchIndex[] }> {
    let q = query(collection(db, SEARCH_INDEX_COLLECTION));
    
    if (options?.party) {
      q = query(q, where('party', '==', options.party));
    }
    if (options?.county) {
      q = query(q, where('counties', 'array-contains', options.county));
    }
    if (options?.district) {
      q = query(q, where('district', '==', options.district));
    }
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    const representatives = snapshot.docs.map(doc => doc.data() as NCRepresentativeSearchIndex);
    
    const summary = `Found ${representatives.length} NC Representatives matching your criteria. ` +
      `Party breakdown: ${representatives.filter(r => r.party === 'R').length} Republicans, ` +
      `${representatives.filter(r => r.party === 'D').length} Democrats.`;
    
    return { summary, representatives };
  }
}

export default NCLegislatureService;
