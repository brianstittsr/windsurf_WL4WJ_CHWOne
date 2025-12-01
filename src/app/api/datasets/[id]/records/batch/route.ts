import { NextRequest, NextResponse } from 'next/server';
import { datasetService } from '@/services/DatasetService';
import { CreateDatasetRecord } from '@/types/dataset.types';

/**
 * POST /api/datasets/[id]/records/batch
 * Create multiple records at once
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // TODO: Get userId from authentication
    const userId = 'current-user-id';

    // Validate that records array is provided
    if (!body.records || !Array.isArray(body.records)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid field: records (must be an array)'
        },
        { status: 400 }
      );
    }

    if (body.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Records array cannot be empty'
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

    // Validate each record
    const validationErrors: Array<{ index: number; errors: string[] }> = [];
    
    if (dataset.config.validation.strictMode) {
      const requiredFields = dataset.schema.fields.filter(f => f.required);
      
      body.records.forEach((record: any, index: number) => {
        const errors: string[] = [];
        
        if (!record.data) {
          errors.push('Missing data field');
        } else {
          const missingFields = requiredFields.filter(
            f => !record.data[f.name] || record.data[f.name] === ''
          );
          
          if (missingFields.length > 0) {
            errors.push(`Missing required fields: ${missingFields.map(f => f.name).join(', ')}`);
          }
        }
        
        if (errors.length > 0) {
          validationErrors.push({ index, errors });
        }
      });
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for some records',
          validationErrors
        },
        { status: 400 }
      );
    }

    // Create records
    const recordsData: CreateDatasetRecord[] = body.records.map((record: any) => ({
      datasetId: params.id,
      data: record.data,
      status: 'active',
      source: record.source
    }));

    const createdRecords = await datasetService.batchCreateRecords(
      params.id,
      recordsData,
      userId
    );

    return NextResponse.json(
      {
        success: true,
        data: createdRecords,
        count: createdRecords.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating batch records:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create batch records'
      },
      { status: 500 }
    );
  }
}
