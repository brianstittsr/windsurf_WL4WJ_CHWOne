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

      case 'community_need':
        prompt = `Enhance and expand this community need description for a grant proposal:

Project Title: ${proposalData.projectTitle || 'Not provided'}
Problem Statement: ${proposalData.problemStatement || 'Not provided'}
Current Community Need Text: ${proposalData.existingContent || proposalData.communityNeed || 'Not provided'}
Target Population: ${proposalData.targetPopulation || 'Not provided'}
Geographic Area: ${proposalData.geographicArea || 'Not provided'}

Write an enhanced community need statement (2-3 paragraphs) that:
- Clearly explains why this need exists in the community
- Describes the impact on residents if the need is not addressed
- Connects the need to broader social, economic, or health factors
- Uses compelling language that resonates with funders
- Maintains the original intent but makes it more professional and persuasive

Return ONLY the enhanced text, no headers or labels.`;
        break;

      case 'target_population':
        prompt = `Enhance this target population description for a grant proposal:

Project Title: ${proposalData.projectTitle || 'Not provided'}
Problem Statement: ${proposalData.problemStatement || 'Not provided'}
Current Target Population: ${proposalData.existingContent || proposalData.targetPopulation || 'Not provided'}
Geographic Area: ${proposalData.geographicArea || 'Not provided'}

Provide an enhanced target population description that includes:
- Specific demographic details (age range, income level, etc.)
- Estimated number of people to be served
- Key characteristics that make this population vulnerable or in need
- Why this population was selected for the program

Keep it concise (2-4 sentences) but comprehensive. Return ONLY the enhanced description, no headers.`;
        break;

      case 'geographic_area':
        prompt = `Enhance this geographic area description for a grant proposal:

Project Title: ${proposalData.projectTitle || 'Not provided'}
Current Geographic Area: ${proposalData.existingContent || proposalData.geographicArea || 'Not provided'}
Target Population: ${proposalData.targetPopulation || 'Not provided'}

Provide an enhanced geographic area description that includes:
- Specific location details (city, county, region, state)
- Relevant demographic or socioeconomic characteristics of the area
- Why this area was selected (high need, underserved, etc.)
- Any relevant statistics about the area

Keep it concise (2-4 sentences) but informative. Return ONLY the enhanced description, no headers.`;
        break;

      case 'smart_goals':
        prompt = `Generate 2-3 SMART goals for this grant project:

PROJECT CONTEXT:
- Project Title: ${proposalData.projectTitle || 'Not provided'}
- Problem Statement: ${proposalData.problemStatement || 'Not provided'}
- Community Need: ${proposalData.communityNeed || 'Not provided'}
- Target Population: ${proposalData.targetPopulation || 'Not provided'}
- Geographic Area: ${proposalData.geographicArea || 'Not provided'}

SMART CRITERIA:
- Specific: Clear and well-defined
- Measurable: Quantifiable with specific metrics
- Achievable: Realistic given resources and timeline
- Relevant: Aligned with the project's purpose
- Time-bound: Has a specific timeframe

For each goal, provide:
1. goal: The SMART goal statement
2. indicator: How success will be measured
3. target: Specific numeric target
4. measurementMethod: How data will be collected
5. dataSource: Where data comes from
6. frequency: How often measured (weekly/monthly/quarterly/annually/pre-post)

Return a JSON object with a "goals" array containing 2-3 goal objects. Example:
{
  "goals": [
    {
      "goal": "By the end of Year 1, 80% of program participants will demonstrate a 25% improvement in health literacy scores",
      "indicator": "Pre/post health literacy assessment scores",
      "target": "80% of participants show 25% improvement",
      "measurementMethod": "Validated health literacy assessment (REALM-SF)",
      "dataSource": "Program participant assessments",
      "frequency": "pre-post"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
        break;

      case 'objectives':
        prompt = `Generate 3-4 specific, measurable objectives for this grant project:

PROJECT CONTEXT:
- Project Title: ${proposalData.projectTitle || 'Not provided'}
- Problem Statement: ${proposalData.problemStatement || 'Not provided'}
- Community Need: ${proposalData.communityNeed || 'Not provided'}
- Target Population: ${proposalData.targetPopulation || 'Not provided'}
- Geographic Area: ${proposalData.geographicArea || 'Not provided'}
- Existing Outcomes: ${(proposalData.outcomes || []).map((o: any) => o.outcome).join('; ') || 'None defined'}

OBJECTIVE CRITERIA:
- Action-oriented (starts with action verb)
- Specific and measurable
- Tied to program activities
- Achievable within project timeline
- Supports overall project goals

For each objective, provide:
1. objective: The objective statement (action-oriented)
2. indicator: How progress will be measured
3. target: Specific numeric target
4. measurementMethod: How data will be collected
5. dataSource: Where data comes from
6. frequency: How often measured (weekly/monthly/quarterly/annually/pre-post)

Return a JSON object with an "objectives" array containing 3-4 objective objects. Example:
{
  "objectives": [
    {
      "objective": "Conduct 12 monthly health education workshops reaching at least 25 participants each",
      "indicator": "Number of workshops conducted and attendance",
      "target": "12 workshops with 25+ participants each (300 total)",
      "measurementMethod": "Workshop sign-in sheets and attendance tracking",
      "dataSource": "Program attendance records",
      "frequency": "monthly"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
        break;

      case 'expected_outcomes':
        prompt = `Generate 3-4 expected outcomes for this grant project following evaluation best practices:

PROJECT CONTEXT:
- Project Title: ${proposalData.projectTitle || 'Not provided'}
- Problem Statement: ${proposalData.problemStatement || 'Not provided'}
- Community Need: ${proposalData.communityNeed || 'Not provided'}
- Target Population: ${proposalData.targetPopulation || 'Not provided'}
- Geographic Area: ${proposalData.geographicArea || 'Not provided'}

BEST PRACTICES TO FOLLOW:
1. Use outcome-based indicators that measure CHANGE, not just activities
2. Ensure indicators are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Include both quantitative AND qualitative data collection methods
4. Plan for baseline data collection BEFORE the program starts
5. Consider using validated assessment tools when available

For each outcome, provide:
1. outcome: The expected outcome statement (what change or benefit will occur)
2. indicator: SMART indicator for measuring this outcome
3. target: Specific, achievable numeric target
4. measurementMethod: Include both quantitative and qualitative methods
5. dataSource: Where data comes from (consider validated tools)
6. frequency: How often measured (include baseline/pre-post)

Return a JSON object with an "outcomes" array containing 3-4 outcome objects. Example:
{
  "outcomes": [
    {
      "outcome": "Participants will demonstrate improved health literacy and self-management skills",
      "indicator": "Percentage increase in health literacy scores using validated REALM-SF assessment",
      "target": "75% of participants will show at least 20% improvement from baseline",
      "measurementMethod": "Pre/post validated assessment (REALM-SF) plus qualitative focus groups",
      "dataSource": "Participant assessments at intake and program completion; quarterly focus groups",
      "frequency": "pre-post"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
        break;

      case 'evaluation_plan':
        prompt = `Generate a comprehensive evaluation plan for this grant project following best practices:

PROJECT CONTEXT:
- Project Title: ${proposalData.projectTitle || 'Not provided'}
- Problem Statement: ${proposalData.problemStatement || 'Not provided'}
- Community Need: ${proposalData.communityNeed || 'Not provided'}
- Target Population: ${proposalData.targetPopulation || 'Not provided'}
- Geographic Area: ${proposalData.geographicArea || 'Not provided'}
- Defined Outcomes: ${(proposalData.outcomes || []).map((o: any) => o.outcome).join('; ') || 'None defined yet'}

BEST PRACTICES TO INCORPORATE:
1. Use outcome-based indicators that measure CHANGE, not just activities
2. Ensure all indicators are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Include both quantitative AND qualitative data collection methods
4. Plan for baseline data collection BEFORE the program starts
5. Consider using validated assessment tools when available

Write a comprehensive evaluation plan (4-5 paragraphs) that includes:

1. EVALUATION APPROACH: Describe the overall evaluation methodology (formative and summative), logic model approach, and how evaluation supports continuous improvement.

2. DATA COLLECTION METHODS: Detail both quantitative methods (surveys, assessments, tracking data) AND qualitative methods (interviews, focus groups, observations). Mention specific validated tools if applicable.

3. BASELINE DATA COLLECTION: Explain how baseline data will be collected BEFORE program implementation to enable meaningful comparison.

4. DATA ANALYSIS & REPORTING: Describe how data will be analyzed, who will conduct analysis, and how findings will be reported to stakeholders.

5. QUALITY ASSURANCE: Address data quality, validity, reliability, and how the evaluation will be used for program improvement.

Write in professional grant proposal language. Be specific and actionable.`;
        break;

      case 'budget_items':
        prompt = `Generate 5-8 recommended budget line items with dollar amounts for this grant project:

PROJECT CONTEXT:
- Project Title: ${proposalData.projectTitle || 'Not provided'}
- Problem Statement: ${proposalData.problemStatement || 'Not provided'}
- Target Population: ${proposalData.targetPopulation || 'Not provided'}
- Geographic Area: ${proposalData.geographicArea || 'Not provided'}
- Project Activities: ${(proposalData.activities || []).map((a: any) => a.activity || a.title || a).join('; ') || 'Not provided'}
- Expected Outcomes: ${(proposalData.outcomes || []).map((o: any) => o.outcome).join('; ') || 'Not provided'}

BUDGET CATEGORIES TO USE:
- Personnel (staff salaries, wages)
- Fringe Benefits (health insurance, retirement, FICA)
- Travel (local and out-of-area travel)
- Equipment (items over $5,000)
- Supplies (office supplies, program materials)
- Contractual (consultants, subcontracts)
- Other Direct Costs (training, printing, communications)
- Indirect Costs (overhead, administrative costs)

For each budget item, provide:
1. category: One of the categories above
2. item: Specific description of the expense
3. amount: Recommended dollar amount (realistic for the project scope)
4. justification: Why this expense is necessary

Return a JSON object with a "budgetItems" array. Example:
{
  "budgetItems": [
    {
      "category": "Personnel",
      "item": "Project Coordinator (1.0 FTE @ $55,000/year)",
      "amount": 55000,
      "justification": "Full-time coordinator to manage daily program operations, coordinate with partners, and ensure program deliverables are met."
    },
    {
      "category": "Fringe Benefits",
      "item": "Benefits for Project Coordinator (30% of salary)",
      "amount": 16500,
      "justification": "Standard fringe benefits including health insurance, retirement contributions, and FICA."
    }
  ]
}

Generate realistic amounts based on typical nonprofit/grant budgets. Return ONLY the JSON object.`;
        break;

      case 'budget_narrative':
        prompt = `Generate a comprehensive budget narrative for this grant project:

PROJECT CONTEXT:
- Project Title: ${proposalData.projectTitle || 'Not provided'}
- Problem Statement: ${proposalData.problemStatement || 'Not provided'}
- Target Population: ${proposalData.targetPopulation || 'Not provided'}
- Geographic Area: ${proposalData.geographicArea || 'Not provided'}
- Project Activities: ${(proposalData.activities || []).map((a: any) => a.activity || a.title || a).join('; ') || 'Not provided'}
- Expected Outcomes: ${(proposalData.outcomes || []).map((o: any) => o.outcome).join('; ') || 'Not provided'}

BUDGET DETAILS:
- Total Budget: $${(proposalData.totalBudget || 0).toLocaleString()}
- Budget Items:
${(proposalData.budgetItems || []).map((item: any) => `  • ${item.category}: ${item.item} - $${(item.amount || 0).toLocaleString()}
    Justification: ${item.justification || 'Not provided'}`).join('\n')}

Write a comprehensive budget narrative (3-4 paragraphs) that:

1. OVERVIEW: Explain how the overall budget supports the project goals and is cost-effective for the proposed outcomes.

2. PERSONNEL & STAFFING: Justify personnel costs, explaining roles and why each position is necessary for project success.

3. PROGRAM COSTS: Explain how supplies, equipment, travel, and other direct costs support program activities and participant outcomes.

4. SUSTAINABILITY & VALUE: Address cost-effectiveness, how funds will be maximized, and any cost-sharing or leveraged resources.

Connect each budget category to specific project activities and outcomes. Write in professional grant proposal language.`;
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

    // Handle JSON responses for smart_goals, objectives, expected_outcomes, and budget_items
    if (section === 'smart_goals' || section === 'objectives' || section === 'expected_outcomes' || section === 'budget_items') {
      try {
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Different suggestions based on section type
          const suggestions = section === 'budget_items' 
            ? [
                'Review each budget item for accuracy',
                'Adjust amounts based on your actual costs',
                'Ensure all items have clear justifications',
                'Consider adding fringe benefits for personnel',
                'Include indirect costs if applicable'
              ]
            : [
                'Review each item for relevance to your project',
                'Adjust targets based on your capacity and timeline',
                'Ensure measurement methods are feasible',
                'Consider adding baseline data collection',
                'Include both quantitative and qualitative methods'
              ];
          
          return NextResponse.json({
            success: true,
            ...parsed,
            suggestions
          });
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
      }
    }

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
