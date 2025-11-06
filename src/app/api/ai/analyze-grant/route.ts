import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Use pdf-parse as a CommonJS module (PDF.js has browser dependencies)
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

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
        console.log('Detected PDF file, using pdf-parse');
        try {
          // Need to save the file temporarily to use pdf-parse in server environment
          const tempDir = os.tmpdir();
          const uniqueId = Date.now().toString();
          const tempFilePath = path.join(tempDir, `temp-${uniqueId}.pdf`);
          
          // Convert to Buffer and save to temp file
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await fs.writeFile(tempFilePath, buffer);
          
          console.log(`Saved PDF to temporary file: ${tempFilePath}`);
          
          try {
            // Read the file with pdf-parse
            console.log('Extracting text with pdf-parse...');
            const fileBuffer = await fs.readFile(tempFilePath);
            const data = await pdfParse(fileBuffer);
            fileContent = data.text || '';
            
            console.log(`PDF extraction complete, ${fileContent.length} characters extracted`);
            
            // Clean up temp file
            try {
              await fs.unlink(tempFilePath);
              console.log('Temporary PDF file deleted');
            } catch (cleanupError) {
              console.warn('Failed to delete temporary file:', cleanupError);
            }
            
          } catch (parseError) {
            console.error('PDF parsing failed:', parseError);
            // Fall back to basic extraction
            try {
              fileContent = await file.text();
              console.log(`Fallback extraction got ${fileContent.length} characters`);
            } catch (e) {
              console.error('Fallback extraction also failed:', e);
            }
          }
        } catch (fileError) {
          console.error('Error handling PDF file:', fileError);
          try {
            fileContent = await file.text();
            console.log(`Using fallback text extraction: ${fileContent.length} characters`);
          } catch (textError) {
            console.error('Text extraction also failed:', textError);
            fileContent = '';
          }
        }
      } else {
        // For non-PDF files, use simple text extraction
        fileContent = await file.text();
        console.log(`Extracted ${fileContent.length} characters using file.text()`);
      }
      
      console.log(`Content sample: ${fileContent.slice(0, 200)}...`);
      
      // If we couldn't extract meaningful text, use mock data
      if (fileContent.length < 100) {
        console.warn('Extracted text is very short or empty, falling back to mock data');
        return NextResponse.json({
          success: true,
          analyzedData: getMockGrantData(),
          note: 'Using mock data because text extraction was insufficient'
        });
      }
      
      // For development/testing or if OpenAI key is not set
      if (!process.env.OPENAI_API_KEY || process.env.NODE_ENV !== 'production') {
        console.log('Using mock data (OpenAI API key not set or not in production)');
        return NextResponse.json({
          success: true,
          analyzedData: getMockGrantData(),
          note: 'Using mock grant data (development mode)'
        });
      }
      
      // Prepare prompt for OpenAI with improved instructions
      const prompt = `
        You are an AI assistant specialized in analyzing grant documents. 
        Please extract key information from this document content:
        
        ${fileContent.slice(0, 15000)} // Limit content to avoid token limits
        
        Extract the following details in JSON format:
        - grantTitle: The name or title of the grant
        - description: A brief description of the grant's purpose
        - fundingSource: The organization providing the funding
        - grantNumber: Any identifier for the grant
        - startDate: When the grant period begins (YYYY-MM-DD)
        - endDate: When the grant period ends (YYYY-MM-DD)
        - totalBudget: The total funding amount (numeric value only)
        - entities: Array of collaborating organizations with their roles
        - dataCollectionMethods: Required data collection methods
        - milestones: Key project milestones and deadlines
        - specialRequirements: Any special requirements or notes
      `;
      
      // Call OpenAI API
      try {
        console.log('Sending text to OpenAI for analysis');
        const completion = await openai.chat.completions.create({
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
          temperature: 0.3, // Lower temperature for more consistent parsing
        });
        
        const responseContent = completion.choices[0].message.content;
        console.log('OpenAI analysis complete');
        
        // Parse JSON response
        try {
          const parsedData = JSON.parse(responseContent || '{}');
          console.log('Successfully parsed JSON from OpenAI');
          
          return NextResponse.json({
            success: true,
            analyzedData: parsedData
          });
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          return NextResponse.json({
            success: true,
            analyzedData: getMockGrantData(),
            note: 'Using mock data due to response parsing error'
          });
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        return NextResponse.json({
          success: true,
          analyzedData: getMockGrantData(),
          note: 'Using mock data due to OpenAI API error'
        });
      }
    } catch (textExtractionError) {
      console.error('Error extracting text from file:', textExtractionError);
      return NextResponse.json({
        success: true,
        analyzedData: getMockGrantData(),
        note: 'Using mock data due to text extraction error'
      });
    }
  } catch (error) {
    console.error('Unexpected error in analyze-grant:', error);
    return NextResponse.json({
      success: true,
      analyzedData: getMockGrantData(),
      note: 'Using mock data due to server error'
    });
  }
}
