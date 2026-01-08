# WhatsApp Integration for CHWOne

This document describes how to set up and use the WhatsApp Business API integration for AI-powered resource search in CHWOne.

## Overview

The WhatsApp integration allows users to send questions via WhatsApp and receive AI-powered responses with relevant community resources from the CHWOne database.

**Example:**
- User sends: "How can I find rent assistance in Wake County?"
- System responds with a list of relevant housing and rent assistance resources

## Architecture

```
User (WhatsApp) → Meta Cloud API → CHWOne Webhook → AI Resource Search → Response
```

### Components

1. **Webhook Endpoint** (`/api/whatsapp/webhook`)
   - Receives incoming WhatsApp messages
   - Verifies webhook subscription
   - Processes text messages and sends responses

2. **AI Resource Search Service** (`/services/aiResourceSearch.ts`)
   - Uses OpenAI GPT-4o to understand natural language queries
   - Searches the CHWOne Resources database
   - Generates helpful, formatted responses

3. **Test Endpoint** (`/api/whatsapp/test`)
   - For testing the AI search without WhatsApp
   - Useful for development and debugging

## Setup Instructions

### 1. Create a Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "WhatsApp" product to your app

### 2. Configure WhatsApp Business API

1. In your Meta app dashboard, go to WhatsApp > Getting Started
2. Note your:
   - **Phone Number ID**: The ID of your WhatsApp business phone number
   - **WhatsApp Business Account ID**: Your business account ID
   - **Access Token**: Generate a permanent access token

### 3. Set Environment Variables

Add these to your `.env.local` file:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=chwone_whatsapp_verify
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# OpenAI (required for AI search)
OPENAI_API_KEY=your_openai_api_key
```

### 4. Configure Webhook

1. In Meta app dashboard, go to WhatsApp > Configuration
2. Set the Callback URL to: `https://your-domain.com/api/whatsapp/webhook`
3. Set the Verify Token to: `chwone_whatsapp_verify` (or your custom token)
4. Subscribe to the `messages` webhook field

### 5. Test the Integration

#### Test without WhatsApp (API)

```bash
# GET request
curl "https://your-domain.com/api/whatsapp/test?query=rent+assistance+wake+county"

# POST request
curl -X POST https://your-domain.com/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"query": "How can I find food assistance in Durham?"}'
```

#### Test with WhatsApp

1. Add your test phone number in Meta dashboard
2. Send a message to your WhatsApp Business number
3. Check server logs for processing details

## How It Works

### Message Flow

1. User sends a WhatsApp message
2. Meta Cloud API forwards the message to our webhook
3. Webhook extracts the message text
4. AI Resource Search service:
   - Uses GPT-4o to extract search parameters (category, county, keywords)
   - Queries the Firestore `resources` collection
   - Uses GPT-4o to generate a helpful response
5. Response is sent back via WhatsApp Cloud API

### AI Search Process

1. **Parameter Extraction**: GPT-4o analyzes the query to identify:
   - Resource category (housing, food, healthcare, etc.)
   - Location (county, city)
   - Keywords

2. **Database Search**: Queries Firestore with extracted parameters

3. **Response Generation**: GPT-4o creates a friendly, concise response formatted for WhatsApp

## Example Queries

Users can ask questions like:

- "How can I find rent assistance in Wake County?"
- "Where can I get food help in Durham?"
- "I need mental health services in Raleigh"
- "Help with utility bills in Mecklenburg County"
- "Are there any free clinics near Charlotte?"
- "I need help with childcare in Guilford County"

## Configuration Options

### LLM Settings (in Settings > LLM Configuration)

- **Default Model**: GPT-4o (recommended)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 500 (for concise WhatsApp responses)

### Feature Visibility (in Settings > Feature Visibility)

- Toggle "WhatsApp Integration" to enable/disable

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**
   - Verify the callback URL is correct
   - Check that the verify token matches
   - Ensure HTTPS is configured

2. **No response sent**
   - Check `WHATSAPP_ACCESS_TOKEN` is valid
   - Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
   - Check server logs for errors

3. **AI search not working**
   - Verify `OPENAI_API_KEY` is set
   - Check API quota/limits

### Logs

Check server logs for:
- `[WHATSAPP]` - Webhook processing
- `[AI_SEARCH]` - AI resource search

## Security Considerations

1. **Token Security**: Never expose access tokens in client-side code
2. **Webhook Verification**: Always verify the webhook signature
3. **Rate Limiting**: Implement rate limiting for production
4. **Data Privacy**: Don't log sensitive user information

## Cost Considerations

- **WhatsApp Business API**: Conversation-based pricing (check Meta pricing)
- **OpenAI API**: Token-based pricing (~$0.01-0.03 per query)

## Future Enhancements

- [ ] Support for image/document messages
- [ ] Multi-language support
- [ ] Conversation history/context
- [ ] Quick reply buttons
- [ ] Location-based search
- [ ] Appointment scheduling via WhatsApp
