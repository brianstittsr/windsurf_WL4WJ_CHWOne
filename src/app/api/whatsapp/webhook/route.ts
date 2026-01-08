import { NextRequest, NextResponse } from 'next/server';
import { searchResourcesWithAI } from '@/services/aiResourceSearch';
import { logWhatsAppInteraction } from '@/services/whatsappLogger';

// WhatsApp Cloud API Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // WhatsApp sends these parameters for webhook verification
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Verify token should match your configured webhook verify token
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'chwone_whatsapp_verify';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WHATSAPP] Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }
  
  console.log('[WHATSAPP] Webhook verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// WhatsApp Cloud API Webhook Handler (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[WHATSAPP] Received webhook:', JSON.stringify(body, null, 2));
    
    // Extract message data from WhatsApp webhook payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    
    if (!messages || messages.length === 0) {
      // This might be a status update, not a message
      console.log('[WHATSAPP] No messages in webhook, possibly a status update');
      return NextResponse.json({ status: 'ok' });
    }
    
    const message = messages[0];
    const from = message.from; // Sender's phone number
    const messageType = message.type;
    const messageId = message.id;
    
    // Only process text messages
    if (messageType !== 'text') {
      console.log(`[WHATSAPP] Ignoring non-text message type: ${messageType}`);
      await sendWhatsAppMessage(from, "I can only process text messages. Please send your question as text.");
      return NextResponse.json({ status: 'ok' });
    }
    
    const userQuery = message.text?.body;
    
    if (!userQuery) {
      return NextResponse.json({ status: 'ok' });
    }
    
    console.log(`[WHATSAPP] Processing query from ${from}: "${userQuery}"`);
    
    const startTime = Date.now();
    let aiResponse = '';
    let status: 'success' | 'error' | 'no_results' = 'success';
    let errorMessage = '';
    let resourcesFound = 0;
    
    try {
      // Use AI to search resources and generate response
      const result = await searchResourcesWithAI(userQuery);
      aiResponse = result.response;
      resourcesFound = result.resourcesFound;
      status = result.resourcesFound > 0 ? 'success' : 'no_results';
    } catch (searchError: any) {
      status = 'error';
      errorMessage = searchError.message;
      aiResponse = "I'm sorry, I encountered an error while searching for resources. Please try again later.";
    }
    
    const processingTimeMs = Date.now() - startTime;
    
    // Send response back to user via WhatsApp
    await sendWhatsAppMessage(from, aiResponse);
    
    // Log the interaction to Firestore for review
    await logWhatsAppInteraction({
      phoneNumber: from,
      phoneNumberMasked: `***-***-${from.slice(-4)}`,
      query: userQuery,
      response: aiResponse,
      resourcesFound,
      status,
      errorMessage: errorMessage || undefined,
      processingTimeMs,
    });
    
    console.log(`[WHATSAPP] Sent response to ${from} (${processingTimeMs}ms)`);
    
    return NextResponse.json({ status: 'ok' });
    
  } catch (error: any) {
    console.error('[WHATSAPP] Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Send message via WhatsApp Cloud API
async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('[WHATSAPP] Missing WhatsApp credentials');
    return;
  }
  
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[WHATSAPP] Failed to send message:', errorData);
    } else {
      console.log('[WHATSAPP] Message sent successfully');
    }
  } catch (error) {
    console.error('[WHATSAPP] Error sending message:', error);
  }
}
