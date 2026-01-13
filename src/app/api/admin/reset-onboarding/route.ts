import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // Reset onboarding flags
    await updateDoc(doc(db, 'users', userId), {
      hasSeenWelcome: deleteField(),
      welcomeSeenAt: deleteField(),
      profileCompletedAt: deleteField(),
    });

    console.log(`[Reset Onboarding] Reset onboarding for user: ${email} (${userId})`);

    return NextResponse.json({
      success: true,
      message: `Onboarding reset for ${email}`,
      userId,
    });
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to reset onboarding' },
      { status: 500 }
    );
  }
}
