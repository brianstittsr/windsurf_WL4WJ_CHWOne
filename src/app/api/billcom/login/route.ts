import { NextRequest, NextResponse } from 'next/server';

/**
 * Bill.com Login API Route
 * Authenticates with Bill.com and returns a session ID
 */
export async function POST(request: NextRequest) {
  try {
    const { organizationId, devKey, environment } = await request.json();
    
    console.log('[Bill.com Login] Environment:', environment);
    console.log('[Bill.com Login] Org ID provided:', !!organizationId);
    console.log('[Bill.com Login] Dev Key provided:', !!devKey);
    
    // Get credentials from environment variables
    const username = process.env.BILLCOM_USERNAME;
    const password = process.env.BILLCOM_PASSWORD;
    
    console.log('[Bill.com Login] Username from env:', username ? 'SET' : 'NOT SET');
    console.log('[Bill.com Login] Password from env:', password ? 'SET' : 'NOT SET');
    
    if (!username || !password) {
      console.error('[Bill.com Login] Missing credentials in environment variables');
      return NextResponse.json(
        { 
          error: 'Bill.com credentials not configured in environment variables',
          hint: 'Add BILLCOM_USERNAME and BILLCOM_PASSWORD to your .env.local file'
        },
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
    
    console.log('[Bill.com Login] Full response:', JSON.stringify(data, null, 2));
    
    if (data.response_status === 0) {
      // Success
      console.log('[Bill.com Login] SUCCESS - Session obtained');
      return NextResponse.json({
        success: true,
        sessionId: data.response_data.sessionId,
        orgId: data.response_data.orgId,
      });
    } else {
      // Error from Bill.com
      console.error('[Bill.com Login] FAILED:', data.response_message);
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
    console.error('[Bill.com Login] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate with Bill.com' },
      { status: 500 }
    );
  }
}
