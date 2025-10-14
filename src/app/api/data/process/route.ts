import { NextRequest, NextResponse } from 'next/server';
import { DataProcessingService, ProcessedDataset } from '@/services/DataProcessingService';

const dataProcessingService = new DataProcessingService();

// GET /api/data/process - Get available files for processing
export async function GET() {
  try {
    const files = await dataProcessingService.getAvailableFiles();
    return NextResponse.json({
      success: true,
      files,
      message: `Found ${files.length} processable files`
    });
  } catch (error) {
    console.error('Error getting available files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get available files' },
      { status: 500 }
    );
  }
}

// POST /api/data/process - Process a specific file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'fileName is required' },
        { status: 400 }
      );
    }

    const result = await dataProcessingService.processFile(fileName);

    if (result.success && result.dataset) {
      return NextResponse.json({
        success: true,
        dataset: result.dataset,
        message: `Successfully processed ${fileName}`
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
