import { NextRequest, NextResponse } from 'next/server';

// In-memory storage - replace with database
let contributions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    // Extract the id from the URL path
    const urlParts = request.url.split('/');
    const projectId = urlParts[urlParts.length - 2]; // Get the ID from the URL path
    const body = await request.json();
    const { outputType } = body; // 'one-pager', 'pitch-package', 'both'

    // Fetch contributions for this project
    const projectContributions = contributions.filter(c => c.projectId === projectId);

    if (projectContributions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No contributions found for this project',
      }, { status: 400 });
    }

    // Group contributions by section
    const contributionsBySection: { [key: string]: any[] } = {};
    projectContributions.forEach(contribution => {
      if (!contributionsBySection[contribution.section]) {
        contributionsBySection[contribution.section] = [];
      }
      contributionsBySection[contribution.section].push(contribution);
    });

    // Synthesize content using AI-like logic (simplified)
    const synthesizedContent = synthesizeDocument(contributionsBySection, outputType);

    // Generate documents
    const documents = await generateDocuments(synthesizedContent, outputType);

    return NextResponse.json({
      success: true,
      documents,
      synthesizedContent,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate documents',
    }, { status: 500 });
  }
}

function synthesizeDocument(contributionsBySection: { [key: string]: any[] }, outputType: string) {
  const sections = Object.keys(contributionsBySection);

  let synthesized = {
    title: 'Funding Proposal',
    executiveSummary: '',
    problemStatement: '',
    solution: '',
    marketAnalysis: '',
    financials: '',
    team: '',
    milestones: '',
    fundingNeeds: '',
  };

  // Simple synthesis logic - combine all contributions for each section
  sections.forEach(section => {
    const sectionContributions = contributionsBySection[section];
    const combinedContent = sectionContributions.map(c => c.content).join('\n\n');

    // Map to standardized sections
    switch (section.toLowerCase()) {
      case 'executive summary':
        synthesized.executiveSummary = combinedContent;
        break;
      case 'problem statement':
        synthesized.problemStatement = combinedContent;
        break;
      case 'solution overview':
        synthesized.solution = combinedContent;
        break;
      case 'market analysis':
      case 'target audience':
      case 'competitive landscape':
        synthesized.marketAnalysis += combinedContent + '\n\n';
        break;
      case 'business model':
      case 'financial projections':
        synthesized.financials += combinedContent + '\n\n';
        break;
      case 'team & experience':
        synthesized.team = combinedContent;
        break;
      case 'milestones & timeline':
        synthesized.milestones = combinedContent;
        break;
      case 'funding requirements':
      case 'use of funds':
        synthesized.fundingNeeds += combinedContent + '\n\n';
        break;
    }
  });

  return synthesized;
}

async function generateDocuments(synthesizedContent: any, outputType: string) {
  const documents: Array<{
    type: string;
    format: string;
    content: string | any;
    filename: string;
  }> = [];

  if (outputType === 'one-pager' || outputType === 'both') {
    // Generate 1-pager PDF content
    const onePagerContent = generateOnePagerContent(synthesizedContent);
    documents.push({
      type: 'one-pager',
      format: 'pdf',
      content: onePagerContent,
      filename: 'funding-proposal-one-pager.pdf',
    });
  }

  if (outputType === 'pitch-package' || outputType === 'both') {
    // Generate pitch package PowerPoint content
    const pitchContent = generatePitchPackageContent(synthesizedContent);
    documents.push({
      type: 'pitch-package',
      format: 'pptx',
      content: pitchContent,
      filename: 'funding-proposal-pitch-package.pptx',
    });
  }

  return documents;
}

function generateOnePagerContent(content: any) {
  return `
# ${content.title}

## Executive Summary
${content.executiveSummary}

## Problem Statement
${content.problemStatement}

## Solution
${content.solution}

## Market Analysis
${content.marketAnalysis}

## Financial Projections
${content.financials}

## Team
${content.team}

## Milestones
${content.milestones}

## Funding Requirements
${content.fundingNeeds}
  `.trim();
}

function generatePitchPackageContent(content: any) {
  // Simplified PowerPoint structure - in real implementation, use pptxgenjs
  return {
    slides: [
      {
        title: 'Title Slide',
        content: content.title,
      },
      {
        title: 'Executive Summary',
        content: content.executiveSummary,
      },
      {
        title: 'Problem Statement',
        content: content.problemStatement,
      },
      {
        title: 'Solution',
        content: content.solution,
      },
      {
        title: 'Market Analysis',
        content: content.marketAnalysis,
      },
      {
        title: 'Financial Projections',
        content: content.financials,
      },
      {
        title: 'Team',
        content: content.team,
      },
      {
        title: 'Milestones',
        content: content.milestones,
      },
      {
        title: 'Funding Requirements',
        content: content.fundingNeeds,
      },
    ],
  };
}
