import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract the id from the URL path
  const urlParts = request.url.split('/');
  const projectId = urlParts[urlParts.length - 2]; // Get the ID from the URL path
  
  const url = new URL(request.url);
  const filename = url.searchParams.get('filename');
  const content = url.searchParams.get('content');

  if (!filename || !content) {
    return NextResponse.json({
      success: false,
      error: 'Missing filename or content parameter',
    }, { status: 400 });
  }

  try {
    // Decode base64 content
    const fileBuffer = Buffer.from(content, 'base64');

    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (filename.endsWith('.pptx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (filename.endsWith('.zip')) {
      contentType = 'application/zip';
    }

    // Return file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process download',
    }, { status: 500 });
  }
}
