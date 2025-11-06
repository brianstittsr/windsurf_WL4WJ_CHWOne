import { NextResponse } from 'next/server';
import IdeaService, { UpdateIdeaStatusData } from '@/services/IdeaService';
import { getServerSession } from '@/lib/auth';
import { IdeaComment } from '@/types/idea.types';

// GET /api/ideas/[id] - Get a specific idea
export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
    }

    const idea = await IdeaService.getIdea(id);
    
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json({ idea });
  } catch (error: any) {
    console.error(`Error fetching idea ${context.params.id}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to fetch idea' }, { status: 500 });
  }
}

// PATCH /api/ideas/[id] - Update idea status (admin only)
export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Check authentication and authorization
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status (adjust this based on your auth system)
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: UpdateIdeaStatusData = {
      status: data.status,
      adminNotes: data.adminNotes,
      priority: data.priority,
      implementationDetails: data.implementationDetails,
    };

    // Update idea status
    await IdeaService.updateIdeaStatus(id, updateData);

    return NextResponse.json({ message: 'Idea updated successfully' });
  } catch (error: any) {
    console.error(`Error updating idea ${context.params.id}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to update idea' }, { status: 500 });
  }
}

// POST /api/ideas/[id]/comments - Add a comment to an idea
export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we're adding a comment or voting
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Handle comments
    if (pathname.endsWith('/comments')) {
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
    }
    
    // Handle votes
    if (pathname.endsWith('/vote')) {
      const data = await req.json();
      
      // Validate vote value
      if (data.value !== 1 && data.value !== -1) {
        return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
      }

      // Add vote
      await IdeaService.voteOnIdea(id, session.user.id, data.value);

      return NextResponse.json({ message: 'Vote recorded successfully' });
    }

    // Default error for unrecognized endpoints
    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error: any) {
    console.error(`Error processing request for idea ${context.params.id}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
