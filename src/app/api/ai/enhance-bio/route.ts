import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { bio, expertise, yearsOfExperience } = await request.json();

    if (!bio) {
      return NextResponse.json(
        { error: 'Bio text is required' },
        { status: 400 }
      );
    }

    // Create a prompt to enhance the bio
    const prompt = `You are a professional resume and bio writer specializing in healthcare. 
    
Please enhance the following Community Health Worker (CHW) professional bio to make it more compelling, professional, and impactful while maintaining authenticity.

Current Bio:
${bio}

${expertise && expertise.length > 0 ? `Areas of Expertise: ${expertise.join(', ')}` : ''}
${yearsOfExperience ? `Years of Experience: ${yearsOfExperience}` : ''}

Guidelines:
- Keep it concise (2-3 sentences or 50-75 words)
- Highlight passion for community health
- Emphasize relevant experience and expertise
- Use professional but warm tone
- Make it engaging and authentic
- Focus on impact and value to the community
- Do not add information that wasn't in the original bio
- Improve grammar, clarity, and flow

Enhanced Bio:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional bio writer specializing in healthcare and community health workers. You enhance bios to be more professional, compelling, and impactful while maintaining authenticity.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const enhancedBio = completion.choices[0]?.message?.content?.trim() || bio;

    return NextResponse.json({
      enhancedBio,
      originalBio: bio
    });

  } catch (error: any) {
    console.error('Error enhancing bio:', error);
    
    // Return original bio if AI enhancement fails
    return NextResponse.json(
      { 
        error: 'Failed to enhance bio',
        message: error.message,
        enhancedBio: (await request.json()).bio // Return original bio as fallback
      },
      { status: 500 }
    );
  }
}
