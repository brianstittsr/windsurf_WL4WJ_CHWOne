import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting form enhancement analysis...');

    // Check for API key
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured properly'
      }, { status: 400 });
    }

    const { formTemplate, grantContext } = await request.json();

    if (!formTemplate) {
      return NextResponse.json({
        success: false,
        error: 'Form template is required'
      }, { status: 400 });
    }

    const systemMessage = `You are an expert in data collection form design for grant-funded community health programs. 
Your task is to analyze a form template and provide specific, actionable recommendations to improve it.

Focus on:
1. Field completeness - Are all necessary fields present?
2. Field types - Are the correct input types being used?
3. Validation - What validation rules should be added?
4. User experience - How can the form be more user-friendly?
5. Data quality - How can we ensure high-quality data collection?
6. Accessibility - Is the form accessible to all users?
7. Logic and flow - Does the field order make sense?

Provide recommendations in JSON format with this structure:
{
  "overallScore": 75,
  "recommendations": [
    {
      "category": "Field Completeness",
      "priority": "high",
      "issue": "Missing demographic information",
      "suggestion": "Add fields for age, gender, and ethnicity to ensure comprehensive participant data",
      "implementation": {
        "action": "add_field",
        "sectionId": "section-id",
        "field": {
          "label": "Age",
          "type": "number",
          "required": true,
          "validation": { "min": 0, "max": 120 }
        }
      }
    }
  ],
  "suggestedFields": [
    {
      "label": "Field Name",
      "type": "text|number|email|phone|date|select|multiselect|textarea",
      "required": true|false,
      "options": ["option1", "option2"],
      "validation": {},
      "helpText": "Helper text for the field"
    }
  ]
}`;

    const userMessage = `Analyze this form template and provide enhancement recommendations:

Form Name: ${formTemplate.name}
Form Purpose: ${formTemplate.purpose}
Description: ${formTemplate.description || 'No description'}

${grantContext ? `Grant Context:
Grant Name: ${grantContext.name || 'N/A'}
Grant Description: ${grantContext.description || 'N/A'}
` : ''}

Current Form Structure:
${JSON.stringify(formTemplate.sections, null, 2)}

Provide specific, actionable recommendations to improve this form.`;

    console.log('Calling OpenAI API for form enhancement analysis...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    console.log('OpenAI analysis complete');

    try {
      const recommendations = JSON.parse(responseContent);
      console.log('Successfully parsed recommendations');

      return NextResponse.json({
        success: true,
        recommendations
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI recommendations',
        details: responseContent
      }, { status: 422 });
    }

  } catch (error) {
    console.error('Error in form enhancement:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
