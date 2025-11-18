import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/firebaseConfig';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting logo upload...');

    // Check if Firebase Storage is initialized
    if (!storage) {
      console.error('Firebase Storage is not initialized');
      return NextResponse.json({
        success: false,
        error: 'Firebase Storage is not configured. Please check your Firebase configuration.'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Organization ID is required'
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'File must be an image'
      }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size must be less than 2MB'
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `logos/${organizationId}/${timestamp}.${extension}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, filename);
    const metadata = {
      contentType: file.type,
    };

    console.log('Uploading to Firebase Storage:', filename);
    await uploadBytes(storageRef, buffer, metadata);

    // Get download URL
    const logoUrl = await getDownloadURL(storageRef);
    console.log('Logo uploaded successfully:', logoUrl);

    return NextResponse.json({
      success: true,
      logoUrl
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
