import { NextRequest, NextResponse } from 'next/server';
import { datasetService } from '@/services/DatasetService';

/**
 * GET /api/datasets/[id]/records/[recordId]
 * Get a specific record
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; recordId: string } }
) {
  try {
    const record = await datasetService.getRecord(params.recordId);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found'
        },
        { status: 404 }
      );
    }

    // Verify record belongs to the dataset
    if (record.datasetId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record does not belong to this dataset'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch record'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/datasets/[id]/records/[recordId]
 * Update a record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; recordId: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    // Verify record exists and belongs to dataset
    const existingRecord = await datasetService.getRecord(params.recordId);
    if (!existingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found'
        },
        { status: 404 }
      );
    }

    if (existingRecord.datasetId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record does not belong to this dataset'
        },
        { status: 403 }
      );
    }

    await datasetService.updateRecord(params.recordId, body, userId);

    const updatedRecord = await datasetService.getRecord(params.recordId);

    return NextResponse.json({
      success: true,
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update record'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/datasets/[id]/records/[recordId]
 * Delete a record (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; recordId: string } }
) {
  try {
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    // Verify record exists and belongs to dataset
    const existingRecord = await datasetService.getRecord(params.recordId);
    if (!existingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found'
        },
        { status: 404 }
      );
    }

    if (existingRecord.datasetId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Record does not belong to this dataset'
        },
        { status: 403 }
      );
    }

    await datasetService.deleteRecord(params.recordId, userId);

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete record'
      },
      { status: 500 }
    );
  }
}
