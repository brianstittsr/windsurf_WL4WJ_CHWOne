import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo - replace with database
let projects: any[] = [];
let contributions: any[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    projects,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({
        success: false,
        error: 'Title is required',
      }, { status: 400 });
    }

    const newProject = {
      id: Date.now().toString(),
      title,
      description: description || '',
      contributors: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    projects.push(newProject);

    return NextResponse.json({
      success: true,
      project: newProject,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
    }, { status: 500 });
  }
}
