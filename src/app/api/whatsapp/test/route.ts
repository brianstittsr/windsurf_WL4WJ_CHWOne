import { NextRequest, NextResponse } from 'next/server';
import { testResourceSearch } from '@/services/aiResourceSearch';

/**
 * Test endpoint for WhatsApp AI Resource Search
 * 
 * Usage: POST /api/whatsapp/test
 * Body: { "query": "How can I find rent assistance in Wake County?" }
 */
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    console.log(`[WHATSAPP_TEST] Testing query: "${query}"`);
    
    const result = await testResourceSearch(query);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[WHATSAPP_TEST] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick testing
 * Usage: GET /api/whatsapp/test?query=rent+assistance+wake+county
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({
      message: 'WhatsApp AI Resource Search Test Endpoint',
      usage: {
        POST: 'POST /api/whatsapp/test with body { "query": "your question" }',
        GET: 'GET /api/whatsapp/test?query=your+question'
      },
      examples: [
        'How can I find rent assistance in Wake County?',
        'Where can I get food help in Durham?',
        'I need mental health services in Raleigh',
        'Help with utility bills in Mecklenburg County'
      ]
    });
  }
  
  try {
    const result = await testResourceSearch(query);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
