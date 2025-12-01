import { NextRequest, NextResponse } from 'next/server';
import { datasetService } from '@/services/DatasetService';
import { CreateDataset } from '@/types/dataset.types';

/**
 * GET /api/datasets
 * List all datasets with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const sourceApplication = searchParams.get('sourceApplication');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const datasets = await datasetService.listDatasets({
      organizationId: organizationId || undefined,
      sourceApplication: sourceApplication || undefined,
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      success: true,
      data: datasets,
      count: datasets.length
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch datasets'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/datasets
 * Create a new dataset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    // Validate required fields
    if (!body.name || !body.sourceApplication || !body.organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, sourceApplication, organizationId'
        },
        { status: 400 }
      );
    }

    const datasetData: CreateDataset = {
      name: body.name,
      description: body.description || '',
      sourceApplication: body.sourceApplication,
      organizationId: body.organizationId,
      createdBy: userId,
      schema: body.schema || { fields: [], version: '1.0' },
      permissions: body.permissions || {
        owners: [userId],
        editors: [],
        viewers: [],
        publicAccess: 'none',
        apiAccess: false
      },
      config: body.config || {
        validation: {
          strictMode: true,
          allowExtraFields: false,
          validateOnSubmit: true
        },
        webhooks: {
          enabled: false
        },
        notifications: {
          emailOnSubmit: false,
          emailRecipients: []
        },
        retention: {
          enabled: false,
          archiveOldRecords: false
        }
      },
      status: 'active'
    };

    const dataset = await datasetService.createDataset(datasetData, userId);

    return NextResponse.json(
      {
        success: true,
        data: dataset
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating dataset:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create dataset'
      },
      { status: 500 }
    );
  }
}
