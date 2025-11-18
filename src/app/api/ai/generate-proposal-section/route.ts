import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting section generation...');

    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured properly'
      }, { status: 400 });
    }

    const { section, proposalData } = await request.json();

    if (!section || !proposalData) {
      return NextResponse.json({
        success: false,
        error: 'Section and proposal data are required'
      }, { status: 400 });
    }

    const systemMessage = `You are an expert grant writer specializing in outcome-based proposals. Generate compelling, professional content that demonstrates measurable impact and follows grant writing best practices.`;

    let prompt = '';

    switch (section) {
      case 'need_statement':
        prompt = `Based on this information, write a compelling statement of need (2-3 paragraphs):

Problem: ${proposalData.problemStatement || 'Not provided'}
Community Need: ${proposalData.communityNeed || 'Not provided'}
Target Population: ${proposalData.targetPopulation || 'Not provided'}
Geographic Area: ${proposalData.geographicArea || 'Not provided'}
Supporting Data: ${(proposalData.dataSupporting || []).join('; ')}

Write a professional narrative that:
- Clearly articulates the problem
- Uses data to support the need
- Explains why this is urgent
- Connects to the target population
- Is compelling and persuasive`;
        break;

      case 'evaluation':
        prompt = `Based on these outcomes, write a comprehensive evaluation plan (3-4 paragraphs):

Outcomes:
${(proposalData.outcomes || []).map((o: any, i: number) => `
${i + 1}. ${o.outcome}
   Indicator: ${o.indicator}
   Measurement: ${o.measurementMethod}
   Data Source: ${o.dataSource}
   Frequency: ${o.frequency}
   Target: ${o.target}
`).join('\n')}

Write an evaluation plan that:
- Uses outcome-based evaluation principles
- Describes the logic model approach
- Details data collection methods
- Explains analysis procedures
- Addresses data quality and validity
- Shows how data will inform program improvement`;
        break;

      case 'activities':
        prompt = `Based on these goals, suggest 3-5 specific activities:

Goals:
${(proposalData.goals || []).map((g: any, i: number) => `
${i + 1}. ${g.goal}
   Objectives: ${g.objectives.map((o: any) => o.objective).join('; ')}
`).join('\n')}

For each activity, provide:
- Activity name
- Brief description
- How it supports the goals
- Expected participants

Format as a simple list.`;
        break;

      case 'budget':
        prompt = `Based on this budget, write a budget narrative (2-3 paragraphs):

Total Budget: $${proposalData.totalBudget?.toLocaleString()}

Budget Items:
${(proposalData.budgetItems || []).map((item: any) => `
- ${item.category}: ${item.item} - $${item.amount.toLocaleString()}
  ${item.justification}
`).join('\n')}

Write a narrative that:
- Explains how the budget supports project goals
- Justifies major expenses
- Demonstrates cost-effectiveness
- Shows careful planning
- Addresses sustainability`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid section type'
        }, { status: 400 });
    }

    console.log(`Generating ${section} section...`);

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
      max_tokens: 1500
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('Section generated successfully');

    return NextResponse.json({
      success: true,
      content,
      suggestions: [
        'Review for accuracy and completeness',
        'Add specific data or examples',
        'Ensure alignment with funder priorities'
      ]
    });

  } catch (error) {
    console.error('Error generating section:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
