import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured in environment variables');
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

    // Extract file content as text (for PDF we'll need more complex extraction)
    const fileContent = await file.text();
    
    // Prepare prompt for OpenAI
    const prompt = `
      You are an AI assistant specialized in analyzing grant documents. 
      Please extract the following information from this grant document:
      
      1. Grant name/title
      2. Description of the grant purpose
      3. Funding source
      4. Grant number (if available)
      5. Start and end dates
      6. Total budget (if available)
      7. Key entities involved in the grant
      8. Required data collection methods
      9. Key project milestones
      10. Any special requirements or notes
      
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
    
    // Call OpenAI API for analysis
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
      response_format: { type: "json_object" }
    });
    
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
