import { NextRequest, NextResponse } from 'next/server';
import { datasetService } from '@/services/DatasetService';
import { CreateDatasetRecord } from '@/types/dataset.types';

/**
 * GET /api/datasets/[id]/records
 * List all records for a dataset with pagination and filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    const result = await datasetService.queryRecords({
      datasetId: params.id,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 25,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: (sortOrder as 'asc' | 'desc') || undefined
    });

    return NextResponse.json({
      success: true,
      data: result.records,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch records'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/datasets/[id]/records
 * Create a new record in the dataset
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    // Validate that data is provided
    if (!body.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: data'
        },
        { status: 400 }
      );
    }

    // Get dataset to validate against schema
    const dataset = await datasetService.getDataset(params.id);
    if (!dataset) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dataset not found'
        },
        { status: 404 }
      );
    }

    // Validate required fields
    if (dataset.config.validation.strictMode) {
      const requiredFields = dataset.schema.fields.filter(f => f.required);
      const missingFields = requiredFields.filter(
        f => !body.data[f.name] || body.data[f.name] === ''
      );

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields',
            missingFields: missingFields.map(f => f.name)
          },
          { status: 400 }
        );
      }
    }

    const recordData: CreateDatasetRecord = {
      datasetId: params.id,
      data: body.data,
      status: 'active',
      source: body.source
    };

    const record = await datasetService.createRecord(params.id, recordData, userId);

    return NextResponse.json(
      {
        success: true,
        data: record
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create record'
      },
      { status: 500 }
    );
  }
}
