import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { chwId, query, profile } = await request.json();

    if (!query || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use OpenAI to analyze the query and match with CHW profile
    const prompt = `You are a job matching AI for Community Health Workers (CHWs) in North Carolina.

CHW Profile:
- Expertise: ${profile.expertise.join(', ')}
- Additional Expertise: ${profile.additionalExpertise || 'None'}
- Languages: ${profile.languages.join(', ')}
- Location: ${profile.location}
- Years of Experience: ${profile.yearsOfExperience}

User Query: "${query}"

Based on this profile and query, suggest 5 relevant CHW job opportunities in North Carolina. For each job, provide:
1. Job title
2. Organization name
3. Location (city, county)
4. Brief description
5. Required skills
6. Match score (0-100) based on the CHW's profile
7. Match reasons (why this job fits the CHW)

Format the response as a JSON array of job objects.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful job matching assistant for Community Health Workers. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Parse the AI response
    let jobs = [];
    try {
      jobs = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return mock data if parsing fails
      jobs = generateMockJobs(profile);
    }

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error: any) {
    console.error('AI Job Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search for jobs' },
      { status: 500 }
    );
  }
}

function generateMockJobs(profile: any) {
  return [
    {
      id: 'job-1',
      title: 'Community Health Worker - Diabetes Care',
      organization: 'Wake County Health Department',
      location: { city: 'Raleigh', state: 'NC', county: 'Wake' },
      description: 'Seeking a CHW to support diabetes management programs in Wake County.',
      requiredSkills: ['Diabetes Management', 'Health Education', 'Community Outreach'],
      matchScore: 85,
      matchReasons: [
        'Expertise in diabetes care',
        'Located in your service area',
        'Matches your experience level',
      ],
    },
    {
      id: 'job-2',
      title: 'Bilingual Community Health Worker',
      organization: 'Durham Community Health Center',
      location: { city: 'Durham', state: 'NC', county: 'Durham' },
      description: 'Bilingual CHW needed to serve Spanish-speaking communities.',
      requiredSkills: ['Spanish Language', 'Cultural Competency', 'Health Navigation'],
      matchScore: 78,
      matchReasons: [
        'Bilingual skills match',
        'Community outreach experience',
        'Nearby location',
      ],
    },
  ];
}
