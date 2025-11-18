import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting proposal generation...');

    // Check for API key
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured properly'
      }, { status: 400 });
    }

    const { proposalData } = await request.json();

    if (!proposalData) {
      return NextResponse.json({
        success: false,
        error: 'Proposal data is required'
      }, { status: 400 });
    }

    // Create comprehensive prompt for proposal generation
    const systemMessage = `You are an expert grant writer with 20+ years of experience writing successful grant proposals. You specialize in outcome-based evaluation, logic models, and data-driven narratives. Your writing is professional, compelling, and follows grant writing best practices.`;

    const prompt = `Generate a comprehensive, professional grant proposal based on the following information:

PROJECT OVERVIEW:
- Organization: ${proposalData.organizationName}
- Project Title: ${proposalData.projectTitle}
- Target Funder: ${proposalData.targetFunder}
- Requested Amount: $${proposalData.fundingAmount?.toLocaleString()}
- Duration: ${proposalData.projectDuration}

NEED STATEMENT:
- Problem: ${proposalData.problemStatement}
- Community Need: ${proposalData.communityNeed}
- Target Population: ${proposalData.targetPopulation}
- Geographic Area: ${proposalData.geographicArea}
- Supporting Data: ${(proposalData.dataSupporting || []).join('; ')}

GOALS & OBJECTIVES:
${(proposalData.goals || []).map((goal: any, i: number) => `
Goal ${i + 1}: ${goal.goal}
Objectives:
${goal.objectives.map((obj: any, j: number) => `  ${j + 1}. ${obj.objective}`).join('\n')}
`).join('\n')}

ACTIVITIES:
${(proposalData.activities || []).map((activity: any, i: number) => `
${i + 1}. ${activity.name}
   Description: ${activity.description}
   Timeline: ${activity.timeline}
   Responsible: ${activity.responsible}
   Participants: ${activity.participants}
`).join('\n')}

OUTCOMES & EVALUATION:
${(proposalData.outcomes || []).map((outcome: any, i: number) => `
Outcome ${i + 1}: ${outcome.outcome}
- Indicator: ${outcome.indicator}
- Target: ${outcome.target}
- Measurement Method: ${outcome.measurementMethod}
- Data Source: ${outcome.dataSource}
- Frequency: ${outcome.frequency}
`).join('\n')}

Evaluation Plan: ${proposalData.evaluationPlan || 'To be developed'}

BUDGET:
Total Budget: $${proposalData.totalBudget?.toLocaleString()}
${(proposalData.budgetItems || []).map((item: any) => `
- ${item.category}: ${item.item} - $${item.amount.toLocaleString()}
  Justification: ${item.justification}
`).join('\n')}

Generate a complete grant proposal with the following sections:

1. EXECUTIVE SUMMARY (1 page)
   - Compelling overview of the project
   - Key outcomes and impact
   - Budget summary

2. STATEMENT OF NEED (2-3 pages)
   - Clear problem statement with data
   - Community context
   - Target population needs
   - Why this project is necessary now

3. PROJECT DESCRIPTION (3-4 pages)
   - Goals and SMART objectives
   - Detailed activities and methods
   - Timeline and implementation plan
   - Organizational capacity

4. EVALUATION PLAN (2 pages)
   - Outcome-based evaluation framework
   - Logic model approach
   - Data collection methods
   - Analysis and reporting plan

5. BUDGET NARRATIVE (1-2 pages)
   - Detailed justification for each budget category
   - How budget supports project goals
   - Cost-effectiveness

REQUIREMENTS:
- Use professional, compelling language
- Include specific, measurable outcomes
- Demonstrate data-driven decision making
- Follow outcome-based evaluation principles
- Use active voice and strong verbs
- Include transitions between sections
- Cite data and statistics appropriately
- Show clear logic model: inputs → activities → outputs → outcomes → impact

Return the proposal as a JSON object with these fields:
{
  "executiveSummary": "...",
  "needStatement": "...",
  "projectDescription": "...",
  "evaluationPlan": "...",
  "budgetNarrative": "..."
}`;

    console.log('Calling OpenAI API for proposal generation...');

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
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    console.log('OpenAI response received');

    const generatedProposal = JSON.parse(responseContent);

    // Generate a unique proposal ID
    const proposalId = `prop-${Date.now()}`;

    // In a real implementation, save to database here
    console.log('Proposal generated successfully:', proposalId);

    return NextResponse.json({
      success: true,
      proposalId,
      document: generatedProposal
    });

  } catch (error) {
    console.error('Error generating proposal:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
