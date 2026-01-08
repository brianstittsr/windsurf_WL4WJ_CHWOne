/**
 * Program Dataset Service
 * 
 * Handles CRUD operations for program dataset records (instructor, student, nonprofit)
 * stored in Firestore for Digital Literacy Programs and other program types.
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  INSTRUCTOR_RECORDS: 'programInstructorRecords',
  STUDENT_RECORDS: 'programStudentRecords',
  NONPROFIT_RECORDS: 'programNonprofitRecords',
};

// Base record interface
export interface BaseRecord {
  id?: string;
  programId: string;
  grantId: string;
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  data: Record<string, any>;
}

export interface InstructorRecord extends BaseRecord {
  type: 'instructor';
}

export interface StudentRecord extends BaseRecord {
  type: 'student';
  instructorId?: string;
}

export interface NonprofitRecord extends BaseRecord {
  type: 'nonprofit';
  reportingPeriod: string;
}

export type DatasetRecord = InstructorRecord | StudentRecord | NonprofitRecord;

// ============================================================================
// INSTRUCTOR RECORDS
// ============================================================================

export async function createInstructorRecord(
  programId: string,
  grantId: string,
  data: Record<string, any>,
  createdBy: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const record: Omit<InstructorRecord, 'id'> = {
      type: 'instructor',
      programId,
      grantId,
      data,
      createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.INSTRUCTOR_RECORDS), record);
    console.log(`[PROGRAM_DATASET] Created instructor record: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error creating instructor record:', error);
    return { success: false, error: error.message };
  }
}

export async function getInstructorRecords(
  programId: string,
  limitCount: number = 100
): Promise<{ success: boolean; records?: InstructorRecord[]; error?: string }> {
  try {
    const q = query(
      collection(db, COLLECTIONS.INSTRUCTOR_RECORDS),
      where('programId', '==', programId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const records: InstructorRecord[] = snapshot.docs.map(docSnap => {
      const docData = docSnap.data() as any;
      return {
        id: docSnap.id,
        type: 'instructor' as const,
        programId: docData.programId,
        grantId: docData.grantId,
        data: docData.data,
        createdBy: docData.createdBy,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date(),
      };
    });
    
    return { success: true, records };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error getting instructor records:', error);
    return { success: false, error: error.message };
  }
}

export async function updateInstructorRecord(
  recordId: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, COLLECTIONS.INSTRUCTOR_RECORDS, recordId);
    await updateDoc(docRef, {
      data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error updating instructor record:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteInstructorRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INSTRUCTOR_RECORDS, recordId));
    return { success: true };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error deleting instructor record:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STUDENT RECORDS
// ============================================================================

export async function createStudentRecord(
  programId: string,
  grantId: string,
  data: Record<string, any>,
  createdBy: string,
  instructorId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const record: Omit<StudentRecord, 'id'> = {
      type: 'student',
      programId,
      grantId,
      instructorId,
      data,
      createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENT_RECORDS), record);
    console.log(`[PROGRAM_DATASET] Created student record: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error creating student record:', error);
    return { success: false, error: error.message };
  }
}

export async function getStudentRecords(
  programId: string,
  instructorId?: string,
  limitCount: number = 100
): Promise<{ success: boolean; records?: StudentRecord[]; error?: string }> {
  try {
    let q;
    if (instructorId) {
      q = query(
        collection(db, COLLECTIONS.STUDENT_RECORDS),
        where('programId', '==', programId),
        where('instructorId', '==', instructorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.STUDENT_RECORDS),
        where('programId', '==', programId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    const records: StudentRecord[] = snapshot.docs.map(docSnap => {
      const docData = docSnap.data() as any;
      return {
        id: docSnap.id,
        type: 'student' as const,
        programId: docData.programId,
        grantId: docData.grantId,
        instructorId: docData.instructorId,
        data: docData.data,
        createdBy: docData.createdBy,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date(),
      };
    });
    
    return { success: true, records };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error getting student records:', error);
    return { success: false, error: error.message };
  }
}

export async function updateStudentRecord(
  recordId: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, COLLECTIONS.STUDENT_RECORDS, recordId);
    await updateDoc(docRef, {
      data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error updating student record:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteStudentRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENT_RECORDS, recordId));
    return { success: true };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error deleting student record:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// NONPROFIT RECORDS
// ============================================================================

export async function createNonprofitRecord(
  programId: string,
  grantId: string,
  data: Record<string, any>,
  createdBy: string,
  reportingPeriod: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const record: Omit<NonprofitRecord, 'id'> = {
      type: 'nonprofit',
      programId,
      grantId,
      reportingPeriod,
      data,
      createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.NONPROFIT_RECORDS), record);
    console.log(`[PROGRAM_DATASET] Created nonprofit record: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error creating nonprofit record:', error);
    return { success: false, error: error.message };
  }
}

export async function getNonprofitRecords(
  programId: string,
  reportingPeriod?: string,
  limitCount: number = 100
): Promise<{ success: boolean; records?: NonprofitRecord[]; error?: string }> {
  try {
    let q;
    if (reportingPeriod) {
      q = query(
        collection(db, COLLECTIONS.NONPROFIT_RECORDS),
        where('programId', '==', programId),
        where('reportingPeriod', '==', reportingPeriod),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.NONPROFIT_RECORDS),
        where('programId', '==', programId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    const records: NonprofitRecord[] = snapshot.docs.map(docSnap => {
      const docData = docSnap.data() as any;
      return {
        id: docSnap.id,
        type: 'nonprofit' as const,
        programId: docData.programId,
        grantId: docData.grantId,
        reportingPeriod: docData.reportingPeriod,
        data: docData.data,
        createdBy: docData.createdBy,
        createdAt: docData.createdAt?.toDate() || new Date(),
        updatedAt: docData.updatedAt?.toDate() || new Date(),
      };
    });
    
    return { success: true, records };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error getting nonprofit records:', error);
    return { success: false, error: error.message };
  }
}

export async function updateNonprofitRecord(
  recordId: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, COLLECTIONS.NONPROFIT_RECORDS, recordId);
    await updateDoc(docRef, {
      data,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error updating nonprofit record:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteNonprofitRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NONPROFIT_RECORDS, recordId));
    return { success: true };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error deleting nonprofit record:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// AGGREGATION & ANALYTICS
// ============================================================================

export interface ProgramMetrics {
  totalInstructors: number;
  totalStudents: number;
  studentsCompleted: number;
  studentsInProgress: number;
  studentsDropped: number;
  completionRate: number;
  avgSatisfactionScore: number;
  totalHoursDelivered: number;
  totalClassesHeld: number;
}

export async function getProgramMetrics(programId: string): Promise<{ success: boolean; metrics?: ProgramMetrics; error?: string }> {
  try {
    // Get instructor count
    const instructorResult = await getInstructorRecords(programId, 1000);
    const totalInstructors = instructorResult.records?.length || 0;
    
    // Get student records
    const studentResult = await getStudentRecords(programId, undefined, 1000);
    const students = studentResult.records || [];
    const totalStudents = students.length;
    
    // Calculate student metrics
    let studentsCompleted = 0;
    let studentsInProgress = 0;
    let studentsDropped = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    
    students.forEach(student => {
      const status = student.data?.status;
      if (status === 'Completed') studentsCompleted++;
      else if (status === 'In Progress' || status === 'Enrolled') studentsInProgress++;
      else if (status === 'Dropped') studentsDropped++;
      
      const satisfaction = parseInt(student.data?.satisfaction_rating);
      if (!isNaN(satisfaction)) {
        totalSatisfaction += satisfaction;
        satisfactionCount++;
      }
    });
    
    // Get nonprofit records for aggregate metrics
    const nonprofitResult = await getNonprofitRecords(programId, undefined, 100);
    const nonprofits = nonprofitResult.records || [];
    
    let totalHoursDelivered = 0;
    let totalClassesHeld = 0;
    
    nonprofits.forEach(np => {
      totalHoursDelivered += parseInt(np.data?.total_hours_delivered) || 0;
      totalClassesHeld += parseInt(np.data?.total_classes_held) || 0;
    });
    
    const metrics: ProgramMetrics = {
      totalInstructors,
      totalStudents,
      studentsCompleted,
      studentsInProgress,
      studentsDropped,
      completionRate: totalStudents > 0 ? (studentsCompleted / totalStudents) * 100 : 0,
      avgSatisfactionScore: satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0,
      totalHoursDelivered,
      totalClassesHeld,
    };
    
    return { success: true, metrics };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error getting program metrics:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkCreateStudentRecords(
  programId: string,
  grantId: string,
  records: Record<string, any>[],
  createdBy: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    
    records.forEach(data => {
      const docRef = doc(collection(db, COLLECTIONS.STUDENT_RECORDS));
      batch.set(docRef, {
        type: 'student',
        programId,
        grantId,
        data,
        createdBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
    
    await batch.commit();
    console.log(`[PROGRAM_DATASET] Bulk created ${records.length} student records`);
    return { success: true, count: records.length };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error bulk creating student records:', error);
    return { success: false, error: error.message };
  }
}

export async function bulkCreateInstructorRecords(
  programId: string,
  grantId: string,
  records: Record<string, any>[],
  createdBy: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    
    records.forEach(data => {
      const docRef = doc(collection(db, COLLECTIONS.INSTRUCTOR_RECORDS));
      batch.set(docRef, {
        type: 'instructor',
        programId,
        grantId,
        data,
        createdBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
    
    await batch.commit();
    console.log(`[PROGRAM_DATASET] Bulk created ${records.length} instructor records`);
    return { success: true, count: records.length };
  } catch (error: any) {
    console.error('[PROGRAM_DATASET] Error bulk creating instructor records:', error);
    return { success: false, error: error.message };
  }
}
