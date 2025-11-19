import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { chwId, jobId, matchScore, matchReasons } = await request.json();

    if (!chwId || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add job recommendation to Firestore
    const recommendationData = {
      chwId,
      jobId,
      matchScore: matchScore || 0,
      matchReasons: matchReasons || [],
      status: 'pending',
      notificationSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'chwJobRecommendations'),
      recommendationData
    );

    return NextResponse.json(
      { success: true, recommendationId: docRef.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Add job recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add job recommendation' },
      { status: 500 }
    );
  }
}
