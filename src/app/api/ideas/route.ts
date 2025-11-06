import { NextResponse } from 'next/server';
import IdeaService, { CreateIdeaData } from '@/services/IdeaService';
import { getServerSession } from '@/lib/auth';

// POST /api/ideas - Create a new idea
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare idea data
    const ideaData: CreateIdeaData = {
      title: data.title,
      description: data.description,
      category: data.category,
      submittedBy: {
        userId: session.user.id,
        name: session.user.name || 'Anonymous',
        email: session.user.email || '',
        role: data.submitterRole || 'User',
      },
      organizationId: data.organizationId,
      chwAssociationId: data.chwAssociationId,
      attachments: data.attachments || [],
    };

    // Create the idea
    const createdIdea = await IdeaService.createIdea(ideaData);

    return NextResponse.json({ 
      idea: createdIdea,
      message: 'Idea submitted successfully' 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating idea:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit idea' }, { status: 500 });
  }
}

// GET /api/ideas - Get all ideas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    
    // Get ideas
    const ideas = await IdeaService.getAllIdeas(status, limit);
    
    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch ideas' }, { status: 500 });
  }
}
