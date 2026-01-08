/**
 * WhatsApp Interaction Logger Service
 * 
 * Logs all WhatsApp questions and responses to Firestore for review and analytics.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

// WhatsApp interaction log entry
export interface WhatsAppLogEntry {
  id?: string;
  phoneNumber: string;
  phoneNumberMasked: string; // Masked for privacy in UI
  query: string;
  response: string;
  resourcesFound: number;
  searchParams?: {
    category?: string;
    county?: string;
    city?: string;
    keywords?: string[];
  };
  status: 'success' | 'error' | 'no_results';
  errorMessage?: string;
  processingTimeMs: number;
  timestamp: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

const COLLECTION_NAME = 'whatsappLogs';

/**
 * Log a WhatsApp interaction to Firestore
 */
export async function logWhatsAppInteraction(entry: Omit<WhatsAppLogEntry, 'id' | 'timestamp' | 'reviewed'>): Promise<string | null> {
  try {
    const logEntry = {
      ...entry,
      phoneNumberMasked: maskPhoneNumber(entry.phoneNumber),
      timestamp: Timestamp.now(),
      reviewed: false,
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), logEntry);
    console.log(`[WHATSAPP_LOG] Logged interaction: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('[WHATSAPP_LOG] Failed to log interaction:', error);
    return null;
  }
}

/**
 * Mask phone number for privacy (show only last 4 digits)
 */
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  return `***-***-${phone.slice(-4)}`;
}

/**
 * Get recent WhatsApp logs for review
 */
export async function getRecentLogs(limitCount: number = 50): Promise<WhatsAppLogEntry[]> {
  try {
    const logsRef = collection(db, COLLECTION_NAME);
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate(),
    })) as WhatsAppLogEntry[];
  } catch (error) {
    console.error('[WHATSAPP_LOG] Failed to get logs:', error);
    return [];
  }
}

/**
 * Get unreviewed logs
 */
export async function getUnreviewedLogs(): Promise<WhatsAppLogEntry[]> {
  try {
    const logsRef = collection(db, COLLECTION_NAME);
    const q = query(
      logsRef, 
      where('reviewed', '==', false),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as WhatsAppLogEntry[];
  } catch (error) {
    console.error('[WHATSAPP_LOG] Failed to get unreviewed logs:', error);
    return [];
  }
}

/**
 * Get logs by date range
 */
export async function getLogsByDateRange(startDate: Date, endDate: Date): Promise<WhatsAppLogEntry[]> {
  try {
    const logsRef = collection(db, COLLECTION_NAME);
    const q = query(
      logsRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      reviewedAt: doc.data().reviewedAt?.toDate(),
    })) as WhatsAppLogEntry[];
  } catch (error) {
    console.error('[WHATSAPP_LOG] Failed to get logs by date range:', error);
    return [];
  }
}

/**
 * Get analytics summary
 */
export async function getLogAnalytics(): Promise<{
  totalQueries: number;
  successRate: number;
  avgProcessingTime: number;
  topCategories: { category: string; count: number }[];
  topCounties: { county: string; count: number }[];
  unreviewedCount: number;
}> {
  try {
    const logs = await getRecentLogs(500);
    
    const totalQueries = logs.length;
    const successCount = logs.filter(l => l.status === 'success').length;
    const successRate = totalQueries > 0 ? (successCount / totalQueries) * 100 : 0;
    const avgProcessingTime = totalQueries > 0 
      ? logs.reduce((sum, l) => sum + (l.processingTimeMs || 0), 0) / totalQueries 
      : 0;
    const unreviewedCount = logs.filter(l => !l.reviewed).length;
    
    // Count categories
    const categoryCount: Record<string, number> = {};
    logs.forEach(l => {
      const cat = l.searchParams?.category;
      if (cat) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    });
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Count counties
    const countyCount: Record<string, number> = {};
    logs.forEach(l => {
      const county = l.searchParams?.county;
      if (county) {
        countyCount[county] = (countyCount[county] || 0) + 1;
      }
    });
    const topCounties = Object.entries(countyCount)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalQueries,
      successRate,
      avgProcessingTime,
      topCategories,
      topCounties,
      unreviewedCount,
    };
  } catch (error) {
    console.error('[WHATSAPP_LOG] Failed to get analytics:', error);
    return {
      totalQueries: 0,
      successRate: 0,
      avgProcessingTime: 0,
      topCategories: [],
      topCounties: [],
      unreviewedCount: 0,
    };
  }
}
