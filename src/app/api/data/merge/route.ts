import { NextRequest, NextResponse } from 'next/server';
import { DataProcessingService } from '@/services/DataProcessingService';

interface ProcessedDataset {
  id: string;
  data: any[];
  columns: string[];
}

const dataProcessingService = new DataProcessingService();

// POST /api/data/merge - Merge multiple datasets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasets } = body;

    if (!datasets || !Array.isArray(datasets) || datasets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'datasets array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate dataset structure
    for (const dataset of datasets) {
      if (!dataset.id || !dataset.data || !Array.isArray(dataset.data)) {
        return NextResponse.json(
          { success: false, error: 'Invalid dataset structure. Each dataset must have id and data array' },
          { status: 400 }
        );
      }
    }

        // Mock the merge functionality for now
    const mergedData = datasets.flatMap(d => d.data);
    const mergedColumns = [...new Set(datasets.flatMap(d => d.columns))];
    const mergedDataset = {
      id: 'merged-' + Date.now(),
      data: mergedData,
      columns: mergedColumns
    };

    return NextResponse.json({
      success: true,
      dataset: mergedDataset,
      message: `Successfully merged ${datasets.length} datasets`
    });
  } catch (error) {
    console.error('Error merging datasets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to merge datasets' },
      { status: 500 }
    );
  }
}
