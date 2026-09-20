import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Dataset, ReportConfig } from '@/types/bmad.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

function buildFallbackRecommendation(datasets: Dataset[], userPrompt?: string) {
  const numericColumns = datasets.flatMap((dataset) =>
    (dataset.columns || []).filter((col) => col.type === 'number').map((col) => `${dataset.name}.${col.name}`)
  );
  const categoricalColumns = datasets.flatMap((dataset) =>
    (dataset.columns || []).filter((col) => col.type === 'string').map((col) => `${dataset.name}.${col.name}`)
  );

  const title = datasets.length === 1
    ? `Report: ${datasets[0].name}`
    : `Combined Report: ${datasets.map((d) => d.name).join(', ')}`;

  const recommendation = [
    'OpenAI is unavailable, so a heuristic recommendation was generated based on the dataset columns.',
    userPrompt ? `Focus requested: ${userPrompt}` : '',
    `This report includes ${datasets.length} dataset${datasets.length === 1 ? '' : 's'} with ${datasets.reduce((sum, d) => sum + (d.rowCount || 0), 0).toLocaleString()} total rows.`,
    numericColumns.length > 0
      ? `Numeric fields available for analysis: ${numericColumns.slice(0, 5).join(', ')}${numericColumns.length > 5 ? '...' : ''}.`
      : 'No numeric fields were detected, so the report will focus on descriptive summaries.',
    categoricalColumns.length > 0
      ? `Categorical fields available for grouping: ${categoricalColumns.slice(0, 5).join(', ')}${categoricalColumns.length > 5 ? '...' : ''}.`
      : '',
    'Suggested visualizations show key numeric measures grouped by the most relevant categorical columns.'
  ].filter(Boolean).join('\n\n');

  const sections: ReportConfig['sections'] = [
    {
      id: 'section-1',
      title: 'Executive Summary',
      type: 'summary',
      order: 0,
      content: recommendation
    },
    {
      id: 'section-2',
      title: 'Dataset Overview',
      type: 'text',
      order: 1,
      content: datasets.map((dataset) => `- ${dataset.name}: ${(dataset.rowCount || 0).toLocaleString()} rows, ${(dataset.columns || []).length} columns`).join('\n')
    },
    {
      id: 'section-3',
      title: 'Key Findings',
      type: 'summary',
      order: 2,
      content: numericColumns.length > 0
        ? `The report highlights average, minimum, and maximum values for numeric columns such as ${numericColumns.slice(0, 3).join(', ')}.`
        : 'The report summarizes the most common categorical values and overall record counts.'
    }
  ];

  const visualizations: ReportConfig['visualizations'] = datasets
    .map((dataset) => {
      const cat = (dataset.columns || []).find((col) => col.type === 'string');
      const measure = (dataset.columns || []).find((col) => col.type === 'number');
      if (!cat || !measure) return null;
      return {
        id: `viz-${dataset.id}`,
        type: 'bar' as const,
        title: `${measure.name} by ${cat.name} (${dataset.name})`,
        description: `Aggregated ${measure.name} grouped by ${cat.name}`,
        datasetId: dataset.id,
        dimensions: [cat.name],
        measures: [measure.name],
        data: {}
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return {
    success: true,
    recommendation,
    suggestedConfig: {
      title,
      description: `Professional report generated from ${datasets.length} dataset${datasets.length === 1 ? '' : 's'}.`,
      datasets: datasets.map((d) => d.id),
      sections,
      visualizations
    } as ReportConfig
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasets, currentConfig, userPrompt } = body as {
      datasets: Dataset[];
      currentConfig?: ReportConfig;
      userPrompt?: string;
    };

    if (!Array.isArray(datasets) || datasets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one dataset is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.warn('OpenAI API key not configured. Returning fallback recommendation.');
      return NextResponse.json(buildFallbackRecommendation(datasets, userPrompt));
    }

    const datasetSummaries = datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description || '',
      format: dataset.format,
      rowCount: dataset.rowCount,
      columns: (dataset.columns || []).map((col) => ({
        name: col.name,
        type: col.type,
        ...(col.mean !== undefined ? { mean: col.mean } : {}),
        ...(col.min !== undefined ? { min: col.min } : {}),
        ...(col.max !== undefined ? { max: col.max } : {}),
        ...(col.uniqueValues !== undefined ? { uniqueValues: col.uniqueValues } : {})
      }))
    }));

    const currentTitle = currentConfig?.title || '';
    const currentDescription = currentConfig?.description || '';

    const systemMessage = `You are an expert data analyst and report designer for community health worker (CHW) programs. Help the user create a professional, insight-driven report from the datasets they selected.`;

    const prompt = `The user wants to build a data report from the following datasets:

${JSON.stringify(datasetSummaries, null, 2)}

${currentTitle ? `Current report title: ${currentTitle}` : ''}
${currentDescription ? `Current report description: ${currentDescription}` : ''}
${userPrompt ? `User's specific request: ${userPrompt}` : ''}

Please recommend:
1. A clear, professional report title
2. A concise description of what the report will cover
3. 3-5 report sections, each with a title, type (text, summary, table, or visualization), and order
4. For visualization sections, suggest chart type (bar, line, pie, table), title, datasetId, dimensions, and measures

Return ONLY a JSON object matching this shape:
{
  "title": "...",
  "description": "...",
  "recommendation": "A paragraph explaining why these sections and visualizations are recommended and what insights they may reveal.",
  "sections": [
    { "title": "...", "type": "text|summary|table|visualization", "order": 0, "content": "..." }
  ],
  "visualizations": [
    { "type": "bar|line|pie|table", "title": "...", "datasetId": "...", "dimensions": ["..."], "measures": ["..."] }
  ]
}`;

    let parsed: Record<string, unknown>;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      });

      const raw = completion.choices[0]?.message?.content || '';
      parsed = JSON.parse(raw);
    } catch (aiError) {
      console.warn('OpenAI recommendation failed, using fallback:', aiError);
      return NextResponse.json(buildFallbackRecommendation(datasets, userPrompt));
    }

    const suggestedConfig: Partial<ReportConfig> = {
      title: typeof parsed.title === 'string' ? parsed.title : currentTitle,
      description: typeof parsed.description === 'string' ? parsed.description : currentDescription,
      datasets: datasets.map((d) => d.id)
    };

    if (Array.isArray(parsed.sections)) {
      suggestedConfig.sections = parsed.sections.map((section: any, index: number) => ({
        id: `section-${index + 1}`,
        title: section.title || `Section ${index + 1}`,
        type: ['text', 'summary', 'table', 'visualization'].includes(section.type) ? section.type : 'text',
        order: typeof section.order === 'number' ? section.order : index,
        content: section.content || ''
      }));
    }

    if (Array.isArray(parsed.visualizations)) {
      suggestedConfig.visualizations = parsed.visualizations.map((viz: any, index: number) => ({
        id: `viz-${index + 1}`,
        type: ['bar', 'line', 'pie', 'table'].includes(viz.type) ? viz.type : 'bar',
        title: viz.title || `Visualization ${index + 1}`,
        description: viz.description || '',
        datasetId: viz.datasetId || datasets[0]?.id || '',
        dimensions: Array.isArray(viz.dimensions) ? viz.dimensions : [],
        measures: Array.isArray(viz.measures) ? viz.measures : [],
        data: {}
      }));
    }

    return NextResponse.json({
      success: true,
      recommendation: typeof parsed.recommendation === 'string' ? parsed.recommendation : '',
      suggestedConfig
    });
  } catch (error) {
    console.error('Error recommending report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendation'
      },
      { status: 500 }
    );
  }
}
