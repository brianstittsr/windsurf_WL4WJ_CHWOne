import { NextRequest, NextResponse } from 'next/server';

/**
 * Bill.com Login API Route
 * Authenticates with Bill.com and returns a session ID
 */
export async function POST(request: NextRequest) {
  try {
    const { organizationId, devKey, environment } = await request.json();
    
    // Get credentials from environment variables
    const username = process.env.BILLCOM_USERNAME;
    const password = process.env.BILLCOM_PASSWORD;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Bill.com credentials not configured in environment variables' },
        { status: 500 }
      );
    }
    
    if (!organizationId || !devKey) {
      return NextResponse.json(
        { error: 'Organization ID and Developer Key are required' },
        { status: 400 }
      );
    }
    
    // Determine API base URL based on environment
    const baseUrl = environment === 'production' 
      ? 'https://api.bill.com/api/v2'
      : 'https://api-sandbox.bill.com/api/v2';
    
    // Call Bill.com Login API
    const response = await fetch(`${baseUrl}/Login.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        devKey: devKey,
        orgId: organizationId,
        userName: username,
        password: password,
      }),
    });
    
    const data = await response.json();
    
    if (data.response_status === 0) {
      // Success
      return NextResponse.json({
        success: true,
        sessionId: data.response_data.sessionId,
        orgId: data.response_data.orgId,
      });
    } else {
      // Error from Bill.com
      return NextResponse.json(
        { 
          success: false,
          error: data.response_message || 'Login failed',
          details: data.response_data 
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Bill.com login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate with Bill.com' },
      { status: 500 }
    );
  }
}
