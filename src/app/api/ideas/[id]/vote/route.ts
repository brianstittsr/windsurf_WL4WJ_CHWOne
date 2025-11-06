import { NextResponse } from 'next/server';
import IdeaService from '@/services/IdeaService';
import { getServerSession } from '@/lib/auth';

// POST /api/ideas/[id]/vote - Vote on an idea
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Validate vote value
    if (data.value !== 1 && data.value !== -1) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    // Add vote
    await IdeaService.voteOnIdea(id, session.user.id, data.value);

    return NextResponse.json({ message: 'Vote recorded successfully' });
  } catch (error: any) {
    console.error(`Error voting on idea ${params.id}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to record vote' }, { status: 500 });
  }
}
