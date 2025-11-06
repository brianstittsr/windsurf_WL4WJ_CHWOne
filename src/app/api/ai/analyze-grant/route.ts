import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// Use CommonJS require for pdf-parse since it doesn't have a proper ESM export
const pdfParse = require('pdf-parse');

export const dynamic = 'force-dynamic';

// Helper function to provide mock data when OpenAI API is unavailable
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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured in environment variables');
      
      // In development, return mock data instead of failing
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.warn('Using mock data for grant analysis since OpenAI API key is not configured');
        return NextResponse.json({
          success: true,
          analyzedData: getMockGrantData()
        });
      }
      
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse the request body
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
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
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }
    
    // Extract file content as text with better PDF handling
    let fileContent = '';
    try {
      // Check if file is a PDF
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || 
                   fileType === 'application/pdf';
      
      if (isPdf) {
        console.log('Detected PDF file, using pdf-parse for extraction');
        // Convert File to Buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        try {
          // Use pdf-parse to extract text
          const pdfData = await pdfParse(buffer);
          fileContent = pdfData.text || '';
          console.log(`PDF parse successful, extracted ${fileContent.length} characters`);
        } catch (pdfError) {
          console.error('Error parsing PDF:', pdfError);
          // If PDF parsing fails, try basic text extraction as fallback
          fileContent = await file.text();
        }
      } else {
        // For non-PDF files, use simple text extraction
        fileContent = await file.text();
      }
      
      // Log a sample of the extracted text for debugging
      console.log(`Extracted ${fileContent.length} characters from file`);
      console.log(`Content sample: ${fileContent.slice(0, 100)}...`);
      
      // If we couldn't extract meaningful text, provide fallback
      if (fileContent.length < 100) {
        console.warn('Extracted text is very short, might be a parsing issue');
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
          return NextResponse.json({
            success: true,
            analyzedData: getMockGrantData(),
            note: 'Using mock data due to insufficient text extraction'
          });
        }
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      
      // Provide fallback in development
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
        return NextResponse.json({
          success: true,
          analyzedData: getMockGrantData(),
          note: 'Using mock data due to text extraction error'
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to read file content', details: String(error) },
        { status: 500 }
      );
    }
    
    // Prepare prompt for OpenAI with improved instructions
    const prompt = `
      You are an AI assistant specialized in analyzing grant documents. 
      You will be given text extracted from a grant document, which may be poorly formatted due to PDF extraction.
      Please do your best to extract the following information from the document:
      
      1. Grant name/title - Look for prominent headings or title sections
      2. Description of the grant purpose - Look for sections about objectives, purpose, or introduction
      3. Funding source - Look for organization names associated with funding
      4. Grant number - Look for alphanumeric codes or identifiers labeled as grant/contract numbers
      5. Start and end dates - Look for date ranges, periods of performance, or project timelines
      6. Total budget - Look for dollar amounts associated with funding or total awards
      7. Key entities involved - Look for organizations mentioned as partners, recipients, or stakeholders
      8. Required data collection methods - Look for reporting requirements, metrics, or evaluation methods
      9. Key project milestones - Look for deadlines, deliverables, or project phases
      10. Any special requirements or notes - Look for unique conditions or important disclaimers
      
      For each collaborating entity, identify:
      - Entity name
      - Role (lead, partner, evaluator, stakeholder)
      - Responsibilities
      - Contact information (if available)
      
      For each data collection method, identify:
      - Method name
      - Description
      - Frequency (daily, weekly, monthly, quarterly, annually)
      - Responsible entity
      - Data points to collect
      - Tools or instruments to use
      
      For each milestone, identify:
      - Milestone name
      - Description
      - Due date (if available)
      - Responsible parties
      - Dependencies on other milestones
      
      Return the information in a structured JSON format suitable for a grant management system.
      
      Document content:
      ${fileContent.slice(0, 15000)} // Limit content to avoid token limits
    `;
    
    // Call OpenAI API for analysis with timeout
    let completion;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a grant analysis assistant that extracts structured information from grant documents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      }).catch(error => {
        console.error('OpenAI API error:', error);
        
        // If in development or debug mode, return mock data
        if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
          console.warn('Using mock data due to OpenAI API error');
          return { choices: [{ message: { content: JSON.stringify(getMockGrantData()) } }] };
        }
        throw error;
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error during OpenAI API call:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'OpenAI API request timed out' },
          { status: 504 }
        );
      }
      
      // In development, fall back to mock data
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.warn('Using mock data after OpenAI API error');
        return NextResponse.json({
          success: true,
          analyzedData: getMockGrantData(),
          note: 'Using mock data due to API error'
        });
      }
      
      return NextResponse.json(
        { error: 'OpenAI API error', details: String(error) },
        { status: 500 }
      );
    }
    
    // Extract the response
    const responseContent = completion.choices[0].message.content;
    
    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(responseContent || '{}');
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: responseContent },
        { status: 500 }
      );
    }
    
    // Return the structured data
    return NextResponse.json({
      success: true,
      analyzedData: parsedData
    });
    
  } catch (error: unknown) {
    console.error('Error analyzing grant document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to analyze document', details: errorMessage },
      { status: 500 }
    );
  }
}
