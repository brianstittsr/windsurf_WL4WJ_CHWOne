import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Student Check-In API
 * Handles QR code-based attendance tracking for Digital Literacy classes
 */
export async function POST(request: NextRequest) {
  try {
    const { classId, identifier, timestamp } = await request.json();

    if (!classId || !identifier) {
      return NextResponse.json(
        { success: false, error: 'missing_fields', message: 'Class ID and identifier are required' },
        { status: 400 }
      );
    }

    // Normalize identifier (email or phone)
    const normalizedIdentifier = identifier.toLowerCase().trim();
    const isEmail = normalizedIdentifier.includes('@');
    
    // Search for student in the Fiesta Family dataset
    // First, try to find by email
    const studentsRef = collection(db, 'fiestaFamilyStudents');
    let studentQuery;
    
    if (isEmail) {
      studentQuery = query(studentsRef, where('email', '==', normalizedIdentifier));
    } else {
      // Normalize phone number (remove non-digits)
      const normalizedPhone = normalizedIdentifier.replace(/\D/g, '');
      studentQuery = query(studentsRef, where('phone_number', '==', normalizedPhone));
    }

    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      // Try alternative phone format search
      if (!isEmail) {
        // Try with different phone formats
        const phoneVariants = [
          normalizedIdentifier,
          normalizedIdentifier.replace(/\D/g, ''),
          `(${normalizedIdentifier.slice(0,3)}) ${normalizedIdentifier.slice(3,6)}-${normalizedIdentifier.slice(6)}`,
        ];
        
        for (const variant of phoneVariants) {
          const altQuery = query(studentsRef, where('phone_number', '==', variant));
          const altSnapshot = await getDocs(altQuery);
          if (!altSnapshot.empty) {
            // Found with alternative format
            const studentDoc = altSnapshot.docs[0];
            return await processCheckIn(studentDoc, classId, timestamp);
          }
        }
      }
      
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Student not found' },
        { status: 404 }
      );
    }

    const studentDoc = snapshot.docs[0];
    return await processCheckIn(studentDoc, classId, timestamp);

  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

async function processCheckIn(studentDoc: any, classId: string, timestamp: string) {
  const studentData = studentDoc.data();
  const studentRef = doc(db, 'fiestaFamilyStudents', studentDoc.id);
  
  // Map classId to field names
  const classFieldMap: Record<string, { attended: string; date: string }> = {
    'class1': { attended: 'class1_attended', date: 'class1_date' },
    'class2': { attended: 'class2_attended', date: 'class2_date' },
    'class3': { attended: 'class3_attended', date: 'class3_date' },
    'class4': { attended: 'class4_attended', date: 'class4_date' },
    'class5': { attended: 'class5_attended', date: 'class5_date' },
    'class6': { attended: 'class6_attended', date: 'class6_date' },
  };

  const classFields = classFieldMap[classId];
  if (!classFields) {
    return NextResponse.json(
      { success: false, error: 'invalid_class', message: 'Invalid class ID' },
      { status: 400 }
    );
  }

  // Check if already checked in
  if (studentData[classFields.attended]) {
    return NextResponse.json({
      success: true,
      alreadyCheckedIn: true,
      error: 'already_checked_in',
      studentName: studentData.student_name,
      checkInTime: studentData[classFields.date],
      message: 'Already checked in for this class',
    });
  }

  // Update attendance
  await updateDoc(studentRef, {
    [classFields.attended]: true,
    [classFields.date]: timestamp || new Date().toISOString(),
    updated_at: serverTimestamp(),
  });

  return NextResponse.json({
    success: true,
    studentName: studentData.student_name,
    classId,
    checkInTime: timestamp || new Date().toISOString(),
    message: 'Check-in successful',
  });
}

/**
 * GET endpoint to check student status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const identifier = searchParams.get('identifier');

  if (!classId || !identifier) {
    return NextResponse.json(
      { success: false, error: 'missing_fields' },
      { status: 400 }
    );
  }

  try {
    const normalizedIdentifier = identifier.toLowerCase().trim();
    const isEmail = normalizedIdentifier.includes('@');
    
    const studentsRef = collection(db, 'fiestaFamilyStudents');
    const studentQuery = isEmail
      ? query(studentsRef, where('email', '==', normalizedIdentifier))
      : query(studentsRef, where('phone_number', '==', normalizedIdentifier.replace(/\D/g, '')));

    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
    }

    const studentData = snapshot.docs[0].data();
    const classFieldMap: Record<string, string> = {
      'class1': 'class1_attended',
      'class2': 'class2_attended',
      'class3': 'class3_attended',
      'class4': 'class4_attended',
      'class5': 'class5_attended',
      'class6': 'class6_attended',
    };

    const attendedField = classFieldMap[classId];
    
    return NextResponse.json({
      success: true,
      studentName: studentData.student_name,
      isCheckedIn: studentData[attendedField] || false,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}
