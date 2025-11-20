import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// Use legacy build for Node.js/serverless environments
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution time

// Helper function to provide mock data when Anthropic API is unavailable
function getMockGrantData() {
  return {
    "grantTitle": "Community Health Worker Program Enhancement",
    "description": "Funding to improve community health outcomes through enhanced CHW programs",
    "fundingSource": "Department of Health and Human Services",
    "grantNumber": "CHW-2023-04982",
    "startDate": "2024-01-01",
    "endDate": "2025-12-31",
    "totalBudget": 250000,
    "entities": [
      {
        "name": "CHW Association of North Carolina",
        "role": "lead",
        "responsibilities": "Overall program management, reporting, and coordination",
        "contactInfo": "contact@chwanc.org"
      },
      {
        "name": "Regional Health Department",
        "role": "partner",
        "responsibilities": "Training delivery and certification",
        "contactInfo": "health@region.gov"
      },
      {
        "name": "Community Health Impact Evaluators",
        "role": "evaluator",
        "responsibilities": "Program evaluation and outcome measurement",
        "contactInfo": "eval@chie.org"
      }
    ],
    "dataCollectionMethods": [
      {
        "name": "CHW Activity Logs",
        "description": "Daily logs of CHW activities and client interactions",
        "frequency": "daily",
        "responsibleEntity": "CHW Association of North Carolina",
        "dataPoints": ["client count", "service type", "time spent", "outcomes"],
        "tools": "CHWOne mobile app"
      },
      {
        "name": "Client Outcome Surveys",
        "description": "Surveys measuring client health outcomes and satisfaction",
        "frequency": "quarterly",
        "responsibleEntity": "Regional Health Department",
        "dataPoints": ["health status", "service satisfaction", "behavioral changes"],
        "tools": "Survey123 forms"
      }
    ],
    "milestones": [
      {
        "name": "Program Launch",
        "description": "Initial rollout of enhanced CHW program",
        "dueDate": "2024-02-15",
        "responsibleParties": ["CHW Association of North Carolina"],
        "dependencies": []
      },
      {
        "name": "Mid-term Evaluation",
        "description": "Evaluation of program progress at midpoint",
        "dueDate": "2024-07-30",
        "responsibleParties": ["Community Health Impact Evaluators"],
        "dependencies": ["Program Launch"]
      },
      {
        "name": "Final Report Submission",
        "description": "Submission of final program report to funders",
        "dueDate": "2025-11-30",
        "responsibleParties": ["CHW Association of North Carolina", "Community Health Impact Evaluators"],
        "dependencies": ["Mid-term Evaluation"]
      }
    ],
    "specialRequirements": "Monthly progress reports required. All CHWs must be certified through the state program."
  };
}

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting grant document analysis');
    
    // Parse the request body
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file details for logging
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    console.log(`Processing file: ${fileName}, type: ${fileType}, size: ${fileSize} bytes`);
    
    // For security, limit file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      console.error('File too large');
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }
    
    // Extract file content with better PDF handling
    let fileContent = '';
    
    try {
      console.log(`Processing file ${fileName} (${fileType})`);
      
      // Check if file is a PDF
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileType === 'application/pdf';
      
      if (isPdf) {
        console.log('Detected PDF file');
        try {
          // Convert File to ArrayBuffer for pdfjs-dist
          console.log('Converting PDF file to array buffer...');
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          console.log('Loading PDF document with pdfjs-dist...');
          const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            standardFontDataUrl: undefined
          });
          
          const pdfDocument = await loadingTask.promise;
          const numPages = pdfDocument.numPages;
          console.log(`PDF has ${numPages} pages`);
          
          // Extract text from all pages
          const textPromises: Promise<string>[] = [];
          for (let i = 1; i <= numPages; i++) {
            textPromises.push(
              pdfDocument.getPage(i).then(async (page) => {
                const textContent = await page.getTextContent();
                return textContent.items
                  .map((item: any) => item.str)
                  .join(' ');
              })
            );
          }
          
          console.log('Extracting text from all pages...');
          const pageTexts = await Promise.all(textPromises);
          fileContent = pageTexts.join('\n\n');
          
          console.log(`Successfully extracted ${fileContent.length} characters from ${numPages} pages`);
        } catch (pdfError) {
          console.error('Error processing PDF:', pdfError);
          return NextResponse.json({
            success: false,
            error: 'Failed to extract text from PDF. The file may be corrupted or encrypted.',
            details: pdfError instanceof Error ? pdfError.message : 'Unknown error'
          }, { status: 422 });
        }
      } else {
        // For non-PDF files, use simple text extraction
        fileContent = await file.text();
        console.log(`Extracted ${fileContent.length} characters using file.text()`);
      }
      
      console.log('=== EXTRACTED CONTENT PREVIEW ===');
      console.log(`Total length: ${fileContent.length} characters`);
      console.log('First 500 characters:');
      console.log(fileContent.slice(0, 500));
      console.log('=== END PREVIEW ===');
      
      // If we couldn't extract meaningful text, return an error
      if (fileContent.length < 100) {
        console.warn('Extracted text is very short or empty');
        return NextResponse.json({
          success: false,
          error: 'Failed to extract enough text from the document.',
          details: `Only ${fileContent.length} characters extracted, minimum required is 100`
        }, { status: 422 });
      }
      
      // Check for OpenAI API key
      console.log('Checking for OpenAI API key...');
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      console.log('API key exists:', !!apiKey);
      console.log('API key length:', apiKey?.length || 0);
      console.log('API key starts with sk-:', apiKey?.startsWith('sk-'));
      
      if (!apiKey) {
        console.log('OpenAI API key not set - returning error');
        return NextResponse.json({
          success: false,
          error: 'OpenAI API key not configured. Please set up your API key.',
        }, { status: 400 });
      }
      
      if (!apiKey.startsWith('sk-')) {
        console.error('Invalid API key format - should start with sk-');
        return NextResponse.json({
          success: false,
          error: 'Invalid OpenAI API key format. Key should start with "sk-"',
        }, { status: 400 });
      }
      
      console.log('OpenAI API key found! Proceeding with analysis...');
      
      // Even in development mode, attempt to use the API if key is available
      if (process.env.NODE_ENV !== 'production') {
        console.log('Running in development mode but will attempt to use OpenAI API');
      }
      
      // Prepare prompt for OpenAI with system message for accuracy
      const systemMessage = `You are an expert grant document analyst. Your ONLY job is to extract information that is EXPLICITLY STATED in the provided document text. 

CRITICAL RULES:
1. ONLY use information from the document text provided - DO NOT make up or infer organization names
2. If information is not in the document, leave that field empty or use a generic placeholder
3. Extract dates, amounts, and text EXACTLY as they appear in the document
4. For organization names, ONLY use names that are explicitly written in the document text
5. Read the ENTIRE document text carefully before responding

DO NOT use generic names like "Women Leading" or "Community Health Worker Program" unless those exact phrases appear in the document.`;
      
      const prompt = `Read this ENTIRE document text carefully and extract ONLY the information that is explicitly stated in it. Do not make up or infer any organization names or details that are not in the text.

===== DOCUMENT TEXT START =====
${fileContent.slice(0, 15000)}
===== DOCUMENT TEXT END =====

Extract and return a JSON object with these fields. USE ONLY INFORMATION FROM THE DOCUMENT TEXT ABOVE:
{
  "grantTitle": "Extract the title from the document. If no title exists, create a SHORT (3-8 words) title based ONLY on what the document says. Use exact phrases from the document.",
  "description": "Extract the purpose and goals EXACTLY as written in the document. Use the document's own words. 2-3 sentences. Quote directly from the document text.",
  "fundingSource": "Extract the EXACT name of the funding organization as written in the document. Look for phrases like 'funded by', 'funder:', 'funding provided by', or organization names in context of providing money. Use the EXACT name from the document.",
  "grantNumber": "Any grant identifier, reference number, or award number. Check headers, footers, and document metadata.",
  "startDate": "REQUIRED: Find the agreement/grant start date. Search EVERYWHERE: headers, footers, 'effective date', 'from [DATE]', 'beginning [DATE]', 'Term: [DATE] to', signature blocks, date ranges. Format as YYYY-MM-DD. Examples: '7/1/2025' → '2025-07-01', 'July 1, 2025' → '2025-07-01'. This should NOT be empty if it's a dated agreement.",
  "endDate": "REQUIRED: Find the agreement/grant end date. Search EVERYWHERE: 'through [DATE]', 'to [DATE]', 'ending [DATE]', 'expiration [DATE]', date ranges. Format as YYYY-MM-DD. Examples: '6/30/2026' → '2026-06-30', 'June 30, 2026' → '2026-06-30'. This should NOT be empty if it's a dated agreement.",
  "totalBudget": "REQUIRED: Extract the total funding/grant amount. Search for: '$[amount]', 'total funding: [amount]', 'grant amount: [amount]', 'budget: [amount]', 'award amount: [amount]'. Return as NUMBER ONLY (no dollar signs, no commas). Examples: '$250,000' → 250000, '$1.5 million' → 1500000, 'Two hundred fifty thousand dollars' → 250000. If not found, return 0.",
  "entities": [
    {
      "name": "REQUIRED: Extract the EXACT organization name as written in the document. Do not make up names. Use the exact text from the document.",
      "role": "Determine from document context: 'lead' (primary recipient/grantee), 'partner' (collaborator), or 'funder' (provides money). Use what the document says.",
      "responsibilities": "Extract EXACTLY what the document says this organization will do. Quote from the document. If not stated, leave empty.",
      "contactInfo": "Extract contact info EXACTLY as written in the document (names, titles, emails, phones from signature blocks or headers)."
    }
  ],
  "dataCollectionMethods": [
    {
      "name": "Method name (e.g., 'Quarterly Surveys', 'Monthly Site Visits')",
      "description": "Detailed description of the data collection approach",
      "frequency": "How often (e.g., 'monthly', 'quarterly', 'annually')",
      "responsibleEntity": "Organization or role responsible for this data collection",
      "dataPoints": ["specific", "metrics", "or", "indicators", "to", "collect"],
      "tools": "Tools, software, or instruments used for data collection"
    }
  ],
  "milestones": [
    {
      "name": "Milestone name",
      "description": "What needs to be accomplished",
      "dueDate": "YYYY-MM-DD",
      "responsibleParties": ["organizations", "or", "roles", "responsible"],
      "dependencies": ["other", "milestones", "that", "must", "complete", "first"]
    }
  ],
  "specialRequirements": "Any special requirements, compliance needs, reporting obligations, or important notes"
}

CRITICAL INSTRUCTIONS - READ CAREFULLY:

**PRIMARY RULE: EXTRACT ONLY FROM THE DOCUMENT TEXT PROVIDED ABOVE. DO NOT MAKE UP INFORMATION.**

**EXTRACTION RULES:**
1. **Organization Names**: Use EXACT names as written in the document. Do not infer or create organization names.
2. **Dates**: Extract dates EXACTLY as they appear. Search headers, footers, signature blocks, and body text.
3. **Amounts**: Extract dollar amounts EXACTLY as stated. Convert to number format (remove $ and commas).
4. **Descriptions**: Quote or paraphrase DIRECTLY from the document text. Use the document's own language.
5. **Empty Fields**: If information is not in the document, leave the field empty or return an empty array.

**WHAT TO EXTRACT:**
- **grantTitle**: Use document's title or create from its stated purpose (use exact phrases from document)
- **description**: Copy the purpose/goals directly from the document text
- **fundingSource**: Extract the EXACT name of the organization providing funding as written in document
- **totalBudget**: Find and extract the dollar amount (return as number without $ or commas)
- **startDate & endDate**: Find dates in ANY part of the document, format as YYYY-MM-DD
- **entities**: List ONLY organizations explicitly named in the document with their stated roles and responsibilities

**ORGANIZATION ROLES (based on document context):**
- **lead**: Primary recipient/grantee managing the grant
- **partner**: Collaborating/supporting organization  
- **funder**: Organization providing the money

**BUDGET/FUNDING AMOUNT EXTRACTION:**
- Search for dollar amounts: "$250,000", "$1.5M", "$1,500,000"
- Look for phrases: "total funding", "grant amount", "award amount", "budget", "total award"
- Check budget tables or financial sections
- Convert to NUMBER: remove $, commas, convert "million" to zeros
- Examples: "$250,000" → 250000, "$1.5 million" → 1500000

**DATE EXTRACTION:**
- Search the ENTIRE document including metadata, headers, footers
- Look for: "effective [DATE]", "[DATE] through [DATE]", "Term: [DATE] to [DATE]"
- Check signature blocks for dates
- Convert all dates to YYYY-MM-DD format

**CONTACT INFORMATION:**
- Extract EXACTLY as written in signature blocks, headers, or contact sections
- Include names, titles, emails, phone numbers found in the document

**DATA COLLECTION & MILESTONES:**
- Extract ONLY if explicitly mentioned in the document
- If not described in the document, return empty arrays []

**FINAL REMINDER**: 
- Use ONLY information from the document text provided above
- Do NOT make up organization names, dates, or amounts
- Extract and quote directly from the document
- If something is not in the document, leave it empty

Return valid JSON with proper array types.`;
      
      // Call OpenAI API with GPT-4o for enhanced reasoning
      try {
        console.log('Sending text to OpenAI GPT-4o for analysis (enhanced reasoning)');
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemMessage
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        });
        
        // Extract the response content
        const responseContent = completion.choices[0]?.message?.content || '';
        console.log('OpenAI analysis complete');
        console.log('Response length:', responseContent.length);
        console.log('Response preview:', responseContent.substring(0, 200));
        
        // Parse JSON response
        try {
          // Clean the response - some LLMs might add markdown code blocks
          const cleanedResponse = responseContent.replace(/```json\n|```\n|```json|```/g, '').trim();
          const parsedData = JSON.parse(cleanedResponse || '{}');
          console.log('Successfully parsed JSON from OpenAI');
          console.log('Parsed data keys:', Object.keys(parsedData));
          
          return NextResponse.json({
            success: true,
            analyzedData: parsedData,
            extractedText: fileContent.slice(0, 2000), // Include first 2000 chars of extracted text for debugging
            extractedTextLength: fileContent.length
          });
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          console.error('Raw response:', responseContent);
          return NextResponse.json({
            success: false,
            error: 'Failed to parse response from OpenAI API.',
            details: responseContent ? `Raw response: ${responseContent.substring(0, 100)}...` : 'No response received'
          }, { status: 422 });
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        return NextResponse.json({
          success: false,
          error: 'Error occurred while calling OpenAI API.',
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        }, { status: 500 });
      }
    } catch (textExtractionError) {
      console.error('Error extracting text from file:', textExtractionError);
      return NextResponse.json({
        success: false,
        error: 'Failed to extract text from the document.',
        details: textExtractionError instanceof Error ? textExtractionError.message : 'Unknown error'
      }, { status: 422 });
    }
  } catch (error) {
    console.error('Unexpected error in analyze-grant:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected server error occurred.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
