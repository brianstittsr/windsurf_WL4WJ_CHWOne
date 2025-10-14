import { NextRequest, NextResponse } from 'next/server';
import { DataProcessingService, ProcessedDataset } from '@/services/DataProcessingService';

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

    const mergedDataset = await dataProcessingService.mergeDatasets(datasets as ProcessedDataset[]);

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
