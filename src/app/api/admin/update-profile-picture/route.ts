import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, profilePicture } = await request.json();
    
    if (!profilePicture) {
      return NextResponse.json({ error: 'profilePicture is required' }, { status: 400 });
    }
    
    const chwProfilesRef = collection(db, 'chwProfiles');
    let querySnapshot;
    
    // Try to find by email first
    if (email) {
      const q = query(chwProfilesRef, where('email', '==', email));
      querySnapshot = await getDocs(q);
    }
    
    // If not found by email, try by firstName
    if ((!querySnapshot || querySnapshot.empty) && firstName) {
      const q = query(chwProfilesRef, where('firstName', '==', firstName));
      querySnapshot = await getDocs(q);
    }
    
    if (!querySnapshot || querySnapshot.empty) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    const updates: Array<{id: string, name: string, newProfilePicture: string}> = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      await updateDoc(doc(db, 'chwProfiles', docSnap.id), {
        profilePicture: profilePicture
      });
      updates.push({
        id: docSnap.id,
        name: `${data.firstName} ${data.lastName}`,
        newProfilePicture: profilePicture
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updates.length} profile(s)`,
      updates 
    });
    
  } catch (error: any) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
