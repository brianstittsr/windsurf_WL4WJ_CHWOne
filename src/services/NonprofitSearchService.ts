import { 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { NonprofitOrganization, IRSData, NONPROFIT_COLLECTIONS, MedicaidRegion } from '@/types/nonprofit.types';

export interface NonprofitSearchResult {
  ein: string;
  name: string;
  city: string;
  state: string;
  nteeCode: string;
  subsectionCode: number;
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
}

export interface NonprofitDetails {
  ein: string;
  name: string;
  careOfName?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  nteeCode: string;
  subsectionCode: number;
  rulingDate: string;
  assetAmount: number;
  incomeAmount: number;
  revenueAmount: number;
  haveFilings: boolean;
  filings: Array<{
    taxPeriod: number;
    taxYear: number;
    formType: number;
    pdfUrl: string;
    totalRevenue: number;
    totalExpenses: number;
    totalAssets: number;
    totalLiabilities: number;
  }>;
}

class NonprofitSearchService {
  /**
   * Search for nonprofits using ProPublica API
   */
  static async searchNonprofits(
    query: string, 
    state: string = 'NC',
    page: number = 0
  ): Promise<{ nonprofits: NonprofitSearchResult[]; totalResults: number }> {
    try {
      const response = await fetch(
        `/api/nonprofits/search?q=${encodeURIComponent(query)}&state=${state}&page=${page}`
      );

      if (!response.ok) {
        throw new Error('Failed to search nonprofits');
      }

      const data = await response.json();
      return {
        nonprofits: data.nonprofits,
        totalResults: data.totalResults,
      };
    } catch (error) {
      console.error('Error searching nonprofits:', error);
      throw error;
    }
  }

  /**
   * Get detailed nonprofit information by EIN
   */
  static async getNonprofitDetails(ein: string | number | undefined | null): Promise<NonprofitDetails> {
    try {
      if (ein === undefined || ein === null) {
        throw new Error('EIN is required');
      }
      const einString = String(ein);
      const cleanEin = einString.replace(/\D/g, '');
      const response = await fetch(`/api/nonprofits/${cleanEin}`);

      if (!response.ok) {
        throw new Error('Failed to fetch nonprofit details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching nonprofit details:', error);
      throw error;
    }
  }

  /**
   * Check if a nonprofit already exists in our system by EIN
   */
  static async findNonprofitByEin(ein: string | number | undefined | null): Promise<NonprofitOrganization | null> {
    try {
      // Ensure ein is a string before calling replace
      if (ein === undefined || ein === null) {
        console.warn('findNonprofitByEin called with undefined/null EIN');
        return null;
      }
      const einString = String(ein);
      const cleanEin = einString.replace(/\D/g, '');
      const q = query(
        collection(db, NONPROFIT_COLLECTIONS.ORGANIZATIONS),
        where('ein', '==', cleanEin)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as NonprofitOrganization;
    } catch (error) {
      console.error('Error finding nonprofit by EIN:', error);
      throw error;
    }
  }

  /**
   * Get all nonprofits in the system
   */
  static async getAllNonprofits(): Promise<NonprofitOrganization[]> {
    try {
      const querySnapshot = await getDocs(
        collection(db, NONPROFIT_COLLECTIONS.ORGANIZATIONS)
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NonprofitOrganization[];
    } catch (error) {
      console.error('Error getting all nonprofits:', error);
      throw error;
    }
  }

  /**
   * Save a nonprofit from ProPublica search results to our system
   */
  static async saveNonprofitFromSearch(
    details: NonprofitDetails,
    userId: string,
    additionalData?: {
      medicaidRegion?: MedicaidRegion;
      serviceCounties?: string[];
      primaryContact?: string;
      contactEmail?: string;
      contactPhone?: string;
    }
  ): Promise<NonprofitOrganization> {
    try {
      // Check if already exists
      const existing = await this.findNonprofitByEin(details.ein);
      if (existing) {
        return existing;
      }

      // Create IRS data from ProPublica response
      const irsData: IRSData = {
        ein: details.ein,
        organizationName: details.name,
        careOfName: details.careOfName,
        irsAddress: details.address,
        nteeCode: details.nteeCode,
        subsectionCode: details.subsectionCode,
        rulingDate: details.rulingDate,
        assetAmount: details.assetAmount,
        incomeAmount: details.incomeAmount,
        revenueAmount: details.revenueAmount,
        latestFiling: details.filings?.[0] ? {
          taxPeriod: details.filings[0].taxPeriod,
          taxYear: details.filings[0].taxYear,
          formType: details.filings[0].formType,
          pdfUrl: details.filings[0].pdfUrl,
          totalRevenue: details.filings[0].totalRevenue,
          totalExpenses: details.filings[0].totalExpenses,
          totalAssets: details.filings[0].totalAssets,
          totalLiabilities: details.filings[0].totalLiabilities,
        } : undefined,
        filingHistory: details.filings?.map(f => ({
          taxPeriod: f.taxPeriod,
          taxYear: f.taxYear,
          formType: f.formType,
          pdfUrl: f.pdfUrl,
          totalRevenue: f.totalRevenue,
          totalExpenses: f.totalExpenses,
          totalAssets: f.totalAssets,
          totalLiabilities: f.totalLiabilities,
        })),
        dataSource: 'propublica',
        lastUpdated: Timestamp.now(),
      };

      // Create nonprofit organization document
      const nonprofitData: Omit<NonprofitOrganization, 'id' | 'createdAt' | 'updatedAt'> = {
        name: details.name,
        ein: String(details.ein || '').replace(/\D/g, ''),
        description: '',
        address: details.address,
        medicaidRegion: additionalData?.medicaidRegion || MedicaidRegion.STATEWIDE,
        serviceCounties: additionalData?.serviceCounties || [],
        contactInfo: {
          primaryContact: additionalData?.primaryContact || '',
          email: additionalData?.contactEmail || '',
          phone: additionalData?.contactPhone || '',
        },
        adminUserIds: [],
        chwIds: [],
        staffIds: [],
        partnershipIds: [],
        hasActiveLicense: false,
        irsData,
        irsVerified: true,
        irsClaimedAt: Timestamp.now(),
        createdBy: userId,
        isActive: true,
      };

      const docRef = await addDoc(
        collection(db, NONPROFIT_COLLECTIONS.ORGANIZATIONS),
        {
          ...nonprofitData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      return {
        id: docRef.id,
        ...nonprofitData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      } as NonprofitOrganization;
    } catch (error) {
      console.error('Error saving nonprofit:', error);
      throw error;
    }
  }

  /**
   * Link a CHW to a nonprofit organization
   */
  static async linkCHWToNonprofit(
    chwUserId: string,
    nonprofitId: string
  ): Promise<void> {
    try {
      const nonprofitRef = doc(db, NONPROFIT_COLLECTIONS.ORGANIZATIONS, nonprofitId);
      const nonprofitDoc = await getDoc(nonprofitRef);

      if (!nonprofitDoc.exists()) {
        throw new Error('Nonprofit not found');
      }

      // Add CHW to nonprofit's chwIds array
      const currentChwIds = nonprofitDoc.data().chwIds || [];
      if (!currentChwIds.includes(chwUserId)) {
        await updateDoc(nonprofitRef, {
          chwIds: [...currentChwIds, chwUserId],
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error linking CHW to nonprofit:', error);
      throw error;
    }
  }

  /**
   * Unlink a CHW from a nonprofit organization
   */
  static async unlinkCHWFromNonprofit(
    chwUserId: string,
    nonprofitId: string
  ): Promise<void> {
    try {
      const nonprofitRef = doc(db, NONPROFIT_COLLECTIONS.ORGANIZATIONS, nonprofitId);
      const nonprofitDoc = await getDoc(nonprofitRef);

      if (!nonprofitDoc.exists()) {
        throw new Error('Nonprofit not found');
      }

      // Remove CHW from nonprofit's chwIds array
      const currentChwIds = nonprofitDoc.data().chwIds || [];
      await updateDoc(nonprofitRef, {
        chwIds: currentChwIds.filter((id: string) => id !== chwUserId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error unlinking CHW from nonprofit:', error);
      throw error;
    }
  }
}

export default NonprofitSearchService;
