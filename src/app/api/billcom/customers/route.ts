import { NextRequest, NextResponse } from 'next/server';

/**
 * Bill.com Customers API Route
 * Fetches list of customers from Bill.com
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, devKey, environment } = await request.json();
    
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
    
    // Call Bill.com List Customer API
    const response = await fetch(`${baseUrl}/List/Customer.json`, {
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
          filters: [
            { field: 'isActive', op: '=', value: '1' }
          ]
        }),
      }),
    });
    
    const data = await response.json();
    
    if (data.response_status === 0) {
      // Success - map Bill.com customer format to our format
      const customers = data.response_data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        firstName: customer.contactFirstName || '',
        lastName: customer.contactLastName || '',
        address: customer.address1 || '',
        city: customer.addressCity || '',
        state: customer.addressState || '',
        zip: customer.addressZip || '',
        phone: customer.phone || '',
        status: customer.isActive === '1' ? 'active' : 'inactive',
      }));
      
      return NextResponse.json({
        success: true,
        customers: customers,
      });
    } else {
      // Error from Bill.com
      return NextResponse.json(
        { 
          success: false,
          error: data.response_message || 'Failed to fetch customers',
          details: data.response_data 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Bill.com customers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers from Bill.com' },
      { status: 500 }
    );
  }
}
