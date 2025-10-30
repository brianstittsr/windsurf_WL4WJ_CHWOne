import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { DataProcessingService } from '@/services/DataProcessingService';

interface ProcessedDataset {
  id: string;
  data: any[];
  columns: string[];
}

const dataProcessingService = new DataProcessingService();

// GET /api/data/process - Get available files for processing
export async function GET() {
  try {
        // Mock getAvailableFiles for now
    return NextResponse.json({
      success: true,
      files: [],
      message: 'Found 0 processable files'
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

        const tempFilePath = path.join('/tmp', fileName);
    const result = await dataProcessingService.processFile(tempFilePath);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

        if (result.success) {
      return NextResponse.json({ success: true, dataset: result.data });
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
