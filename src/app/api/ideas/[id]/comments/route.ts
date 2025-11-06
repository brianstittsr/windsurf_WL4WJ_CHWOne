import { NextResponse } from 'next/server';
import IdeaService from '@/services/IdeaService';
import { getServerSession } from '@/lib/auth';
import { IdeaComment } from '@/types/idea.types';

// POST /api/ideas/[id]/comments - Add a comment to an idea
export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Prepare comment data
    const commentData: Omit<IdeaComment, 'timestamp'> = {
      id: crypto.randomUUID(), // Generate a unique ID
      userId: session.user.id,
      userName: session.user.name || 'Anonymous',
      content: data.content,
      isEdited: false,
    };

    // Add comment
    await IdeaService.addComment(id, commentData);

    return NextResponse.json({ message: 'Comment added successfully' });
  } catch (error: any) {
    console.error(`Error adding comment to idea ${context.params.id}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}
