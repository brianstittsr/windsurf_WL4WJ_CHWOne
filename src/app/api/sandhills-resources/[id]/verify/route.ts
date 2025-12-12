import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sandhills-resources/[id]/verify
 * Manually verify a resource (admin action)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { verifiedBy, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const resourceRef = doc(db, 'sandhillsResources', id);
    await updateDoc(resourceRef, {
      isVerified: true,
      verifiedDate: Timestamp.now(),
      verifiedBy: verifiedBy || 'admin',
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Resource verified successfully'
    });

  } catch (error) {
    console.error('Verify resource error:', error);
    return NextResponse.json(
      { error: 'Failed to verify resource' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sandhills-resources/[id]/verify
 * Remove verification from a resource
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const resourceRef = doc(db, 'sandhillsResources', id);
    await updateDoc(resourceRef, {
      isVerified: false,
      verifiedDate: null,
      verifiedBy: null,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Verification removed'
    });

  } catch (error) {
    console.error('Remove verification error:', error);
    return NextResponse.json(
      { error: 'Failed to remove verification' },
      { status: 500 }
    );
  }
}
