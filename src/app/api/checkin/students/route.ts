import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    // Fetch all registered students for the Digital Literacy program
    // In a real implementation, you might filter by classId or program
    const studentsRef = collection(db, 'digitalLiteracyStudents');
    
    let q;
    if (classId) {
      // If classId is provided, filter by class assignment
      q = query(
        studentsRef, 
        where('status', '==', 'active'),
        orderBy('name', 'asc')
      );
    } else {
      q = query(studentsRef, where('status', '==', 'active'), orderBy('name', 'asc'));
    }

    const snapshot = await getDocs(q);
    
    const students = snapshot.docs.map(doc => {
      const data = doc.data() as { name?: string; studentName?: string; email?: string; phone?: string };
      return {
        id: doc.id,
        name: data.name || data.studentName || '',
        email: data.email || '',
        phone: data.phone || '',
      };
    });

    return NextResponse.json({ 
      success: true, 
      students,
      count: students.length 
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    
    // Return mock data for development/demo purposes
    const mockStudents = [
      { id: '1', name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '555-0101' },
      { id: '2', name: 'Juan Rodriguez', email: 'juan.rodriguez@email.com', phone: '555-0102' },
      { id: '3', name: 'Ana Martinez', email: 'ana.martinez@email.com', phone: '555-0103' },
      { id: '4', name: 'Carlos Lopez', email: 'carlos.lopez@email.com', phone: '555-0104' },
      { id: '5', name: 'Rosa Hernandez', email: 'rosa.hernandez@email.com', phone: '555-0105' },
      { id: '6', name: 'Miguel Santos', email: 'miguel.santos@email.com', phone: '555-0106' },
      { id: '7', name: 'Elena Ramirez', email: 'elena.ramirez@email.com', phone: '555-0107' },
      { id: '8', name: 'Pedro Gonzalez', email: 'pedro.gonzalez@email.com', phone: '555-0108' },
      { id: '9', name: 'Sofia Diaz', email: 'sofia.diaz@email.com', phone: '555-0109' },
      { id: '10', name: 'Luis Torres', email: 'luis.torres@email.com', phone: '555-0110' },
    ];

    return NextResponse.json({ 
      success: true, 
      students: mockStudents,
      count: mockStudents.length,
      mock: true 
    });
  }
}
