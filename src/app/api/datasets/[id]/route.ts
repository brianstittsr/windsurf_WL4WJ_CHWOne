import { NextRequest, NextResponse } from 'next/server';
import { datasetService } from '@/services/DatasetService';

/**
 * GET /api/datasets/[id]
 * Get a specific dataset by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    return NextResponse.json({
      success: true,
      data: dataset
    });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dataset'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/datasets/[id]
 * Update a dataset
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    await datasetService.updateDataset(params.id, body, userId);

    const updatedDataset = await datasetService.getDataset(params.id);

    return NextResponse.json({
      success: true,
      data: updatedDataset
    });
  } catch (error) {
    console.error('Error updating dataset:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update dataset'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/datasets/[id]
 * Delete a dataset (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    await datasetService.deleteDataset(params.id, userId);

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete dataset'
      },
      { status: 500 }
    );
  }
}
