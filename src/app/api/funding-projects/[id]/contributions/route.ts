import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo - replace with database
let contributions: any[] = [];

// Define the correct type for route handlers in Next.js App Router
type RouteContext = {
  params: { id: string }
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const projectId = params.id;
  const projectContributions = contributions.filter(c => c.projectId === projectId);

  return NextResponse.json({
    success: true,
    contributions: projectContributions,
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { contributorName, contributorEmail, section, content } = body;

    if (!contributorName || !section || !content) {
      return NextResponse.json({
        success: false,
        error: 'Name, section, and content are required',
      }, { status: 400 });
    }

    const newContribution = {
      id: Date.now().toString(),
      projectId,
      contributorName,
      contributorEmail: contributorEmail || '',
      section,
      content,
      submittedAt: new Date().toISOString(),
    };

    contributions.push(newContribution);

    return NextResponse.json({
      success: true,
      contribution: newContribution,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to submit contribution',
    }, { status: 500 });
  }
}
