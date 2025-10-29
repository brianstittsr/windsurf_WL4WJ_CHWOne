/**
 * Placeholder API route for AI agent communication
 * 
 * This is a temporary placeholder to prevent "Failed to fetch" errors.
 * Replace with actual implementation when ready.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'This is a placeholder API for AI agent communication',
    mockData: true,
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({
    status: 'success',
    message: 'This is a placeholder API for AI agent communication',
    mockData: true,
    timestamp: new Date().toISOString()
  });
}
