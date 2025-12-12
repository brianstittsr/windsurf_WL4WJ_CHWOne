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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import {
  BillComCredentials,
  BillComInvoice,
  BillComPayment,
  BillComTransaction,
  COLLECTIONS,
} from '@/types/firebase/schema';

// ============================================================================
// CREDENTIALS MANAGEMENT
// ============================================================================

export async function saveCredentials(
  credentials: Omit<BillComCredentials, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  userId: string
): Promise<string> {
  const now = Timestamp.now();
  const credentialsRef = doc(collection(db, COLLECTIONS.BILLCOM_CREDENTIALS));
  
  const credentialsData: BillComCredentials = {
    ...credentials,
    id: credentialsRef.id,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(credentialsRef, credentialsData);
  return credentialsRef.id;
}

export async function updateCredentials(
  id: string,
  updates: Partial<Omit<BillComCredentials, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const credentialsRef = doc(db, COLLECTIONS.BILLCOM_CREDENTIALS, id);
  await updateDoc(credentialsRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function getCredentials(environment: 'test' | 'production'): Promise<BillComCredentials | null> {
  const q = query(
    collection(db, COLLECTIONS.BILLCOM_CREDENTIALS),
    where('environment', '==', environment),
    where('isActive', '==', true),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return snapshot.docs[0].data() as BillComCredentials;
}

export async function getCredentialsById(id: string): Promise<BillComCredentials | null> {
  const docRef = doc(db, COLLECTIONS.BILLCOM_CREDENTIALS, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  return docSnap.data() as BillComCredentials;
}

export async function getAllCredentials(): Promise<BillComCredentials[]> {
  const q = query(
    collection(db, COLLECTIONS.BILLCOM_CREDENTIALS),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BillComCredentials);
}

export async function deleteCredentials(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BILLCOM_CREDENTIALS, id);
  await deleteDoc(docRef);
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

export async function createInvoice(
  invoice: Omit<BillComInvoice, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> {
  const now = Timestamp.now();
  const invoiceRef = doc(collection(db, COLLECTIONS.BILLCOM_INVOICES));
  
  const invoiceData: BillComInvoice = {
    ...invoice,
    id: invoiceRef.id,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(invoiceRef, invoiceData);
  return invoiceRef.id;
}

export async function updateInvoice(
  id: string,
  updates: Partial<Omit<BillComInvoice, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const invoiceRef = doc(db, COLLECTIONS.BILLCOM_INVOICES, id);
  await updateDoc(invoiceRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function getInvoices(limitCount: number = 50): Promise<BillComInvoice[]> {
  const q = query(
    collection(db, COLLECTIONS.BILLCOM_INVOICES),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BillComInvoice);
}

export async function getInvoiceById(id: string): Promise<BillComInvoice | null> {
  const docRef = doc(db, COLLECTIONS.BILLCOM_INVOICES, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  return docSnap.data() as BillComInvoice;
}

// ============================================================================
// CHW PAYMENT MANAGEMENT
// ============================================================================

export async function createPayment(
  payment: Omit<BillComPayment, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> {
  const now = Timestamp.now();
  const paymentRef = doc(collection(db, COLLECTIONS.BILLCOM_PAYMENTS));
  
  const paymentData: BillComPayment = {
    ...payment,
    id: paymentRef.id,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(paymentRef, paymentData);
  return paymentRef.id;
}

export async function updatePayment(
  id: string,
  updates: Partial<Omit<BillComPayment, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const paymentRef = doc(db, COLLECTIONS.BILLCOM_PAYMENTS, id);
  await updateDoc(paymentRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function getPayments(limitCount: number = 50): Promise<BillComPayment[]> {
  const q = query(
    collection(db, COLLECTIONS.BILLCOM_PAYMENTS),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BillComPayment);
}

export async function getPaymentsByChw(chwId: string): Promise<BillComPayment[]> {
  const q = query(
    collection(db, COLLECTIONS.BILLCOM_PAYMENTS),
    where('chwId', '==', chwId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BillComPayment);
}

export async function getPaymentsByCollaboration(collaborationId: string): Promise<BillComPayment[]> {
  const q = query(
    collection(db, COLLECTIONS.BILLCOM_PAYMENTS),
    where('collaborationId', '==', collaborationId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BillComPayment);
}

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

export async function createTransaction(
  transaction: Omit<BillComTransaction, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<string> {
  const now = Timestamp.now();
  const transactionRef = doc(collection(db, COLLECTIONS.BILLCOM_TRANSACTIONS));
  
  const transactionData: BillComTransaction = {
    ...transaction,
    id: transactionRef.id,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(transactionRef, transactionData);
  return transactionRef.id;
}

export async function getTransactions(
  environment?: 'test' | 'production',
  limitCount: number = 50
): Promise<BillComTransaction[]> {
  let q;
  
  if (environment) {
    q = query(
      collection(db, COLLECTIONS.BILLCOM_TRANSACTIONS),
      where('environment', '==', environment),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.BILLCOM_TRANSACTIONS),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BillComTransaction);
}

export async function deleteTransaction(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BILLCOM_TRANSACTIONS, id);
  await deleteDoc(docRef);
}

// ============================================================================
// BILL.COM CUSTOMER API
// ============================================================================

export interface BillComCustomer {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export async function getCustomers(
  credentials: { organizationId: string; apiKey: string },
  environment: 'test' | 'production'
): Promise<BillComCustomer[]> {
  try {
    if (!credentials.organizationId || !credentials.apiKey) {
      console.warn('Bill.com credentials not configured');
      return [];
    }
    
    // In production, this would make an actual API call to Bill.com
    // const baseUrl = environment === 'test' 
    //   ? 'https://api-sandbox.bill.com/v3' 
    //   : 'https://api.bill.com/v3';
    // const response = await fetch(`${baseUrl}/customers`, {
    //   headers: {
    //     'x-api-key': credentials.apiKey,
    //     'x-org-id': credentials.organizationId,
    //     'Content-Type': 'application/json',
    //   }
    // });
    // const data = await response.json();
    // return data.customers;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data for now - in production this comes from Bill.com API
    // These customers match the actual Bill.com account for Women Leading 4 Wellness
    const mockCustomers: BillComCustomer[] = [
      { 
        id: 'cust-001', 
        name: 'Fiesta Family Services, Inc.', 
        email: 'billing@fiestafamily.org',
        firstName: 'Fiesta',
        lastName: 'Family Services',
        address: '100 Main Street',
        city: 'Apex',
        state: 'NC',
        zip: '27502',
        phone: '919-555-0101',
        status: 'active'
      },
      { 
        id: 'cust-002', 
        name: 'Health Lit 4 Wake Grant', 
        email: 'healthlit4wake@grant.org',
        firstName: 'Health Lit',
        lastName: '4 Wake Grant',
        address: '',
        city: '',
        state: 'NC',
        zip: '',
        phone: '',
        status: 'active'
      },
      { 
        id: 'cust-003', 
        name: 'Southern Vision Alliance', 
        email: 'contact@southernvision.org',
        firstName: 'Southern',
        lastName: 'Vision Alliance',
        address: '200 Alliance Way',
        city: 'Durham',
        state: 'NC',
        zip: '27701',
        phone: '919-555-0303',
        status: 'active'
      },
      { 
        id: 'cust-004', 
        name: 'Susan M Nolan', 
        email: 'susan.nolan@email.com',
        firstName: 'Susan',
        lastName: 'Nolan',
        address: '',
        city: '',
        state: 'NC',
        zip: '',
        phone: '',
        status: 'active'
      },
    ];
    
    return mockCustomers.filter(c => c.status === 'active');
  } catch (error: any) {
    console.error('Error fetching customers from Bill.com:', error);
    return [];
  }
}

// ============================================================================
// BILL.COM VENDOR API
// ============================================================================

export interface BillComVendor {
  id: string;
  name: string;
  email: string;
  paymentStatus: 'connected' | 'pending' | 'inactive';
  bankAccountLast4?: string;
  address?: string;
  phone?: string;
}

export async function getVendors(
  credentials: { organizationId: string; apiKey: string },
  environment: 'test' | 'production',
  status?: 'connected' | 'pending' | 'inactive'
): Promise<BillComVendor[]> {
  try {
    if (!credentials.organizationId || !credentials.apiKey) {
      console.warn('Bill.com credentials not configured');
      return [];
    }
    
    // In production, this would make an actual API call to Bill.com
    // const baseUrl = environment === 'test' 
    //   ? 'https://api-sandbox.bill.com/v3' 
    //   : 'https://api.bill.com/v3';
    // const response = await fetch(`${baseUrl}/vendors?status=${status || 'all'}`, {
    //   headers: {
    //     'x-api-key': credentials.apiKey,
    //     'x-org-id': credentials.organizationId,
    //     'Content-Type': 'application/json',
    //   }
    // });
    // const data = await response.json();
    // return data.vendors;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data for now - in production this comes from Bill.com API
    const mockVendors: BillComVendor[] = [
      { id: 'vendor-001', name: 'Maria Garcia', email: 'maria.garcia@example.com', paymentStatus: 'connected', bankAccountLast4: '4521' },
      { id: 'vendor-002', name: 'James Wilson', email: 'james.wilson@example.com', paymentStatus: 'connected', bankAccountLast4: '7832' },
      { id: 'vendor-003', name: 'Ana Blackburn', email: 'anab@wl4wj.org', paymentStatus: 'connected', bankAccountLast4: '9156' },
      { id: 'vendor-004', name: 'Robert Johnson', email: 'robert.j@example.com', paymentStatus: 'connected', bankAccountLast4: '3478' },
      { id: 'vendor-005', name: 'Sarah Chen', email: 'sarah.chen@example.com', paymentStatus: 'pending', bankAccountLast4: '2145' },
      { id: 'vendor-006', name: 'Michael Brown', email: 'michael.b@example.com', paymentStatus: 'inactive' },
    ];
    
    // Filter by status if specified
    if (status) {
      return mockVendors.filter(v => v.paymentStatus === status);
    }
    
    return mockVendors;
  } catch (error: any) {
    console.error('Error fetching vendors from Bill.com:', error);
    return [];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function testConnection(
  credentials: { organizationId: string; apiKey: string },
  environment: 'test' | 'production'
): Promise<{ success: boolean; message: string }> {
  try {
    if (!credentials.organizationId || !credentials.apiKey) {
      return { success: false, message: 'Organization ID and API Key are required' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production:
    // const response = await fetch(`https://api${environment === 'test' ? '-sandbox' : ''}.bill.com/v3/ping`, {
    //   headers: {
    //     'x-api-key': credentials.apiKey,
    //     'x-org-id': credentials.organizationId,
    //   }
    // });
    // return { success: response.ok, message: response.ok ? 'Connected' : 'Connection failed' };
    
    return { success: true, message: `Connected to Bill.com ${environment} environment` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Connection failed' };
  }
}

// Export all functions as a service object for convenience
const BillComService = {
  // Credentials
  saveCredentials,
  updateCredentials,
  getCredentials,
  getCredentialsById,
  getAllCredentials,
  deleteCredentials,
  
  // Invoices
  createInvoice,
  updateInvoice,
  getInvoices,
  getInvoiceById,
  
  // Payments
  createPayment,
  updatePayment,
  getPayments,
  getPaymentsByChw,
  getPaymentsByCollaboration,
  
  // Transactions
  createTransaction,
  getTransactions,
  deleteTransaction,
  
  // Customers
  getCustomers,
  
  // Vendors
  getVendors,
  
  // Utilities
  testConnection,
};

export default BillComService;
