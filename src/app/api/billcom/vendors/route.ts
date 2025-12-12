import { NextRequest, NextResponse } from 'next/server';

/**
 * Bill.com Vendors API Route
 * Fetches list of vendors from Bill.com
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, devKey, environment, paymentStatus } = await request.json();
    
    if (!sessionId || !devKey) {
      return NextResponse.json(
        { error: 'Session ID and Developer Key are required' },
        { status: 400 }
      );
    }
    
    // Determine API base URL based on environment
    const baseUrl = environment === 'production' 
      ? 'https://api.bill.com/api/v2'
      : 'https://api-sandbox.bill.com/api/v2';
    
    // Build filters
    const filters: any[] = [
      { field: 'isActive', op: '=', value: '1' }
    ];
    
    // Add payment status filter if specified
    if (paymentStatus === 'connected') {
      filters.push({ field: 'paymentStatus', op: '=', value: '1' });
    }
    
    // Call Bill.com List Vendor API
    const response = await fetch(`${baseUrl}/List/Vendor.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        devKey: devKey,
        sessionId: sessionId,
        data: JSON.stringify({
          start: 0,
          max: 999,
          filters: filters
        }),
      }),
    });
    
    const data = await response.json();
    
    if (data.response_status === 0) {
      // Success - map Bill.com vendor format to our format
      const vendors = data.response_data.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email || '',
        firstName: vendor.contactFirstName || '',
        lastName: vendor.contactLastName || '',
        address: vendor.address1 || '',
        city: vendor.addressCity || '',
        state: vendor.addressState || '',
        zip: vendor.addressZip || '',
        phone: vendor.phone || '',
        paymentStatus: vendor.paymentStatus === '1' ? 'connected' : 
                       vendor.paymentStatus === '2' ? 'pending' : 'inactive',
        bankAccountLast4: vendor.accountNumber ? vendor.accountNumber.slice(-4) : '',
      }));
      
      return NextResponse.json({
        success: true,
        vendors: vendors,
      });
    } else {
      // Error from Bill.com
      return NextResponse.json(
        { 
          success: false,
          error: data.response_message || 'Failed to fetch vendors',
          details: data.response_data 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Bill.com vendors error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vendors from Bill.com' },
      { status: 500 }
    );
  }
}
