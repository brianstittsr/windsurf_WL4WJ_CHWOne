import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting supporting data research...');

    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured properly'
      }, { status: 400 });
    }

    const { 
      problemStatement, 
      communityNeed, 
      targetPopulation, 
      geographicArea,
      projectTitle 
    } = await request.json();

    if (!targetPopulation && !geographicArea) {
      return NextResponse.json({
        success: false,
        error: 'Target population or geographic area is required for research'
      }, { status: 400 });
    }

    const systemMessage = `You are an expert grant researcher specializing in finding relevant statistics, data points, and research findings to support grant proposals. You have extensive knowledge of:
- Census data and demographic statistics
- Health statistics and disparities
- Economic indicators and poverty data
- Education statistics
- Employment and workforce data
- Housing and community development data
- Public health research
- Social determinants of health

Provide accurate, credible data points with sources. Focus on data that would be compelling to grant funders.`;

    const prompt = `Research and provide 4-6 relevant statistics and data points to support this grant proposal:

PROJECT CONTEXT:
- Project Title: ${projectTitle || 'Community Program'}
- Problem Statement: ${problemStatement || 'Not provided'}
- Community Need: ${communityNeed || 'Not provided'}
- Target Population: ${targetPopulation || 'Not provided'}
- Geographic Area: ${geographicArea || 'Not provided'}

INSTRUCTIONS:
1. Find statistics specifically relevant to the target population and geographic area
2. Include data about:
   - Demographics of the target population
   - Prevalence of the problem being addressed
   - Economic factors (poverty rates, income levels, unemployment)
   - Health indicators if relevant
   - Educational attainment if relevant
   - Comparison to state or national averages
3. Each data point should include a credible source (Census Bureau, CDC, BLS, state health departments, university research, etc.)
4. Use recent data (2020-2024 when possible)
5. Make data points specific and quantifiable

RESPONSE FORMAT:
Return a JSON array of strings, where each string is a complete data point with source. Example:
[
  "According to the U.S. Census Bureau (2022), 23.5% of Durham County residents live below the federal poverty line, compared to 14.6% statewide.",
  "The CDC reports that Hispanic adults in North Carolina are 40% less likely to have a regular healthcare provider than non-Hispanic white adults (2023).",
  "Unemployment among adults ages 18-24 in the Triangle region is 8.2%, nearly double the overall regional rate of 4.3% (NC Commerce, 2023)."
]

Return ONLY the JSON array, no additional text or explanation.`;

    console.log('Researching supporting data for:', geographicArea || targetPopulation);

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
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content || '[]';
    console.log('Research response:', responseContent);

    // Parse the JSON array from the response
    let dataPoints: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        dataPoints = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array found, split by newlines and clean up
        dataPoints = responseContent
          .split('\n')
          .filter(line => line.trim().length > 20)
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0);
      }
    } catch (parseError) {
      console.error('Error parsing data points:', parseError);
      // Fallback: split by newlines
      dataPoints = responseContent
        .split('\n')
        .filter(line => line.trim().length > 20)
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^"\s*/, '').replace(/"\s*,?\s*$/, '').trim())
        .filter(line => line.length > 0);
    }

    // Ensure we have valid data points
    if (dataPoints.length === 0) {
      dataPoints = [
        `Research data for ${geographicArea || 'the target area'} is being compiled. Please add specific statistics relevant to your project.`
      ];
    }

    console.log('Parsed data points:', dataPoints.length);

    return NextResponse.json({
      success: true,
      dataPoints,
      metadata: {
        geographicArea,
        targetPopulation,
        researchedAt: new Date().toISOString(),
        count: dataPoints.length
      }
    });

  } catch (error) {
    console.error('Error researching supporting data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
