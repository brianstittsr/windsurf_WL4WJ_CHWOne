# Anthropic API Setup Guide

## Overview
The CHWOne platform uses Anthropic's Claude AI for intelligent grant document analysis. This feature automatically extracts structured information from uploaded grant documents, including:

- Grant title and description
- Funding source and grant number
- Budget and timeline information
- Collaborating entities and their roles
- Data collection methods
- Project milestones
- Special requirements

## Current Error
You're seeing this error because the Anthropic API key is not configured:

```
API Error: 500 Internal Server Error
Anthropic API error: Document analysis failed. Please ensure you have a valid Anthropic API key configured.
```

## Setup Instructions

### Step 1: Get an Anthropic API Key

1. **Visit Anthropic Console**: Go to https://console.anthropic.com/
2. **Sign Up/Login**: Create an account or log in if you already have one
3. **Create API Key**: 
   - Navigate to "API Keys" section
   - Click "Create Key"
   - Give it a descriptive name (e.g., "CHWOne Development")
   - Copy the generated API key (you won't be able to see it again!)

### Step 2: Add the API Key to Your Environment

1. **Open your `.env.local` file** in the project root
   - If it doesn't exist, copy `.env.example` to `.env.local`

2. **Add the Anthropic API key**:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Save the file**

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Verification

After adding the API key and restarting:

1. Navigate to the Grant Analyzer Wizard
2. Upload a grant document (PDF or text file)
3. The document should be analyzed successfully
4. Check the console - you should see:
   ```
   Sending text to Anthropic for analysis
   Anthropic analysis complete
   Successfully parsed JSON from Anthropic
   ```

## API Usage & Costs

### Model Used
The platform uses **Claude 3 Haiku** (`claude-3-haiku-20240307`), which is:
- Fast and cost-effective
- Optimized for document analysis
- Provides accurate structured data extraction

### Estimated Costs
- **Input**: ~$0.25 per million tokens
- **Output**: ~$1.25 per million tokens
- **Average grant document**: ~2,000-5,000 tokens
- **Cost per analysis**: ~$0.001-$0.005 (less than a penny!)

### Token Limits
- Maximum tokens per request: 4,000 output tokens
- Input content limited to first 15,000 characters of document
- This is sufficient for most grant documents

## Troubleshooting

### Error: "Anthropic API key not configured"
**Solution**: Add `ANTHROPIC_API_KEY` to your `.env.local` file

### Error: "Failed to extract enough text from the document"
**Cause**: The document has less than 100 characters of extractable text
**Solutions**:
- Ensure the PDF is not image-based (scanned)
- Try converting the PDF to text first
- Use a different document format (DOCX, TXT)

### Error: "File too large (max 10MB)"
**Solution**: The file size limit is 10MB. Compress or split larger documents.

### Error: "Failed to parse response from Anthropic API"
**Cause**: The AI response wasn't valid JSON
**Solutions**:
- Check your API key is valid
- Try uploading the document again
- Check the console for the raw response

### Error: "Error occurred while calling Anthropic API"
**Possible causes**:
- Invalid API key
- Rate limit exceeded
- Network connectivity issues
- Anthropic service outage

**Solutions**:
1. Verify your API key is correct
2. Check Anthropic status: https://status.anthropic.com/
3. Wait a few minutes and try again
4. Check your Anthropic account has available credits

## Development vs Production

### Development Mode
- API key is required for document analysis
- Errors are logged to console with details
- No fallback to mock data (to ensure proper testing)

### Production Mode
- API key is **required** - the feature won't work without it
- Errors are logged but with less detail
- Consider implementing retry logic for transient failures

## Security Best Practices

### ✅ DO:
- Store API key in `.env.local` (never commit to git)
- Use environment variables for all sensitive data
- Rotate API keys periodically
- Monitor API usage in Anthropic console
- Set up billing alerts

### ❌ DON'T:
- Commit `.env.local` to version control
- Share API keys in chat/email
- Use production keys in development
- Hard-code API keys in source files
- Expose API keys in client-side code

## Alternative: Mock Data Mode

If you don't want to use the Anthropic API during development, you can modify the API route to return mock data:

**File**: `src/app/api/ai/analyze-grant/route.ts`

**Change line 159-165** from:
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('Anthropic API key not set - returning error');
  return NextResponse.json({
    success: false,
    error: 'Anthropic API key not configured. Please set up your API key.',
  }, { status: 400 });
}
```

**To**:
```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('Anthropic API key not set - returning mock data');
  return NextResponse.json({
    success: true,
    analyzedData: getMockGrantData()
  });
}
```

**Note**: This is only recommended for initial development/testing. Real document analysis requires the API key.

## API Rate Limits

Anthropic API has the following rate limits:

| Tier | Requests/min | Tokens/min |
|------|--------------|------------|
| Free | 5 | 10,000 |
| Tier 1 | 50 | 40,000 |
| Tier 2 | 1,000 | 80,000 |
| Tier 3 | 2,000 | 160,000 |

For typical usage (a few grant analyses per day), the free tier is sufficient.

## Support

### Anthropic Support
- Documentation: https://docs.anthropic.com/
- Support: https://support.anthropic.com/
- Status Page: https://status.anthropic.com/

### CHWOne Platform
- Check the console logs for detailed error messages
- Review the API route code: `src/app/api/ai/analyze-grant/route.ts`
- Test with the Grant Wizard: `/grants` → "Create New Grant"

## Summary

1. **Get API Key**: https://console.anthropic.com/
2. **Add to `.env.local`**: `ANTHROPIC_API_KEY=sk-ant-api03-...`
3. **Restart Server**: `npm run dev`
4. **Test**: Upload a grant document in the Grant Analyzer

The grant document analysis feature will then work seamlessly!

---

**Last Updated**: November 17, 2025  
**Status**: Configuration Required  
**Priority**: Medium (feature works without it, but analysis won't function)
