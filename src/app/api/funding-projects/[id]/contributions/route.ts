import { NextRequest, NextResponse } from 'next/server';

// Simple stub implementation for the API route
export async function GET(request: NextRequest) {
  // Extract the id from the URL path
  const id = request.url.split('/').pop();
  
  return NextResponse.json({
    success: true,
    contributions: [],
    projectId: id
  });
}

export async function POST(request: NextRequest) {
  // Extract the id from the URL path
  const id = request.url.split('/').pop();
  
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      contribution: {
        id: Date.now().toString(),
        projectId: id,
        ...body,
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to submit contribution'
    }, { status: 500 });
  }
}
