import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Dataset } from '@/types/bmad.types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

function findCommonColumns(datasets: Dataset[]) {
  if (datasets.length < 2) return [];
  const [first, ...rest] = datasets.map(
    (dataset) => new Set((dataset.columns || []).map((col) => col.name))
  );
  return Array.from(first).filter((column) => rest.every((set) => set.has(column)));
}

function findBestKeyColumns(datasets: Dataset[]) {
  const commonColumns = findCommonColumns(datasets);
  // Prefer string columns that look like identifiers
  return commonColumns.filter((column) => {
    const lower = column.toLowerCase();
    return lower.includes('id') || lower.includes('key') || lower.includes('code') || lower.includes('zip');
  });
}

function buildFallbackMergeRecommendation(datasets: Dataset[]) {
  const commonColumns = findCommonColumns(datasets);
  const keyColumns = findBestKeyColumns(datasets);

  let mergeType: 'union' | 'intersection' | 'inner' | 'left' | 'right' | 'outer';
  let reasoning: string;

  if (keyColumns.length > 0) {
    mergeType = 'inner';
    reasoning = `OpenAI is unavailable, so a heuristic recommendation was used. The datasets share identifier-like columns (${keyColumns.join(', ')}), so an inner join will keep only matching records and produce the cleanest combined dataset for reporting.`;
  } else if (commonColumns.length > 0) {
    mergeType = 'union';
    reasoning = `OpenAI is unavailable, so a heuristic recommendation was used. The datasets share some common columns (${commonColumns.join(', ')}) but no clear identifier keys. A union merge will stack all rows together using those common fields.`;
  } else {
    mergeType = 'union';
    reasoning = 'OpenAI is unavailable, so a heuristic recommendation was used. The datasets do not share any common columns, so a union merge is the safest way to combine all records.';
  }

  return {
    success: true,
    mergeType,
    keyColumns: keyColumns.length > 0 ? keyColumns : commonColumns.slice(0, 1),
    reasoning,
    reportTitle: `Merged Report: ${datasets.map((d) => d.name).join(' + ')}`,
    reportDescription: `Combined report generated from ${datasets.length} datasets using a ${mergeType} merge.`
  };
}

export async function POST(request: NextRequest) {
  try {
    const { datasets } = (await request.json()) as { datasets: Dataset[] };

    if (!Array.isArray(datasets) || datasets.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least two datasets are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.warn('OpenAI API key not configured. Returning fallback merge recommendation.');
      return NextResponse.json(buildFallbackMergeRecommendation(datasets));
    }

    const datasetInfo = datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      rowCount: dataset.rowCount,
      columns: (dataset.columns || []).map((col) => ({
        name: col.name,
        type: col.type
      }))
    }));

    const commonColumns = findCommonColumns(datasets);

    const systemMessage = `You are an expert data analyst and report designer for community health worker programs. Recommend the best way to merge multiple datasets for a unified report.`;

    const prompt = `The user wants to report on multiple datasets at once. Please recommend the best merge strategy.

Datasets:
${JSON.stringify(datasetInfo, null, 2)}

Columns that appear in more than one dataset: ${commonColumns.join(', ') || 'None'}

Choose a merge strategy from: union, intersection, inner, left, right, outer.

- union: best when datasets have similar structures and should be stacked (appended) together.
- intersection: best when only common columns across all datasets matter.
- inner: keep only rows that match across datasets on the key columns.
- left: keep all rows from the first dataset and add matching data from the others.
- right: keep all rows from the second dataset and add matching data from the first.
- outer: keep all rows from both datasets, matching where possible.

Recommend one or more key columns when a join strategy is chosen. Key columns should be columns that exist in every dataset and have stable identifiers (e.g., client_id, chw_id, zip_code).

Return ONLY a JSON object with this shape:
{
  "mergeType": "union|intersection|inner|left|right|outer",
  "keyColumns": ["columnName"],
  "reasoning": "Explain why this strategy is best for reporting on these datasets together.",
  "reportTitle": "Suggested report title",
  "reportDescription": "Suggested report description"
}`;

    let parsed: Record<string, unknown>;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      const raw = completion.choices[0]?.message?.content || '';
      parsed = JSON.parse(raw);
    } catch (aiError) {
      console.warn('OpenAI merge recommendation failed, using fallback:', aiError);
      return NextResponse.json(buildFallbackMergeRecommendation(datasets));
    }

    const allowedTypes = ['union', 'intersection', 'inner', 'left', 'right', 'outer'];
    const mergeType = allowedTypes.includes(parsed.mergeType as string) ? (parsed.mergeType as string) : 'union';

    return NextResponse.json({
      success: true,
      mergeType,
      keyColumns: Array.isArray(parsed.keyColumns) ? parsed.keyColumns : [],
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      reportTitle: typeof parsed.reportTitle === 'string' ? parsed.reportTitle : '',
      reportDescription: typeof parsed.reportDescription === 'string' ? parsed.reportDescription : ''
    });
  } catch (error) {
    console.error('Error recommending merge strategy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recommend merge strategy'
      },
      { status: 500 }
    );
  }
}
