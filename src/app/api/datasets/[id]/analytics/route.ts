import { NextRequest, NextResponse } from 'next/server';
import { datasetService } from '@/services/DatasetService';

/**
 * GET /api/datasets/[id]/analytics
 * Get analytics and statistics for a dataset
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

    // Get records to calculate statistics
    const records = await datasetService.queryRecords({
      datasetId: params.id,
      pageSize: 1000 // Get a sample for analytics
    });

    // Calculate field statistics
    const fieldStats: Record<string, any> = {};
    
    dataset.schema.fields.forEach(field => {
      const values = records.records
        .map(r => r.data[field.name])
        .filter(v => v !== null && v !== undefined);

      fieldStats[field.name] = {
        type: field.type,
        totalValues: values.length,
        nullCount: records.records.length - values.length,
        uniqueCount: new Set(values).size
      };

      // For numeric fields, calculate min/max/avg
      if (field.type === 'number') {
        const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          fieldStats[field.name].min = Math.min(...numericValues);
          fieldStats[field.name].max = Math.max(...numericValues);
          fieldStats[field.name].avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        }
      }

      // For string fields, get most common values
      if (field.type === 'string' || field.type === 'select') {
        const valueCounts: Record<string, number> = {};
        values.forEach(v => {
          const str = String(v);
          valueCounts[str] = (valueCounts[str] || 0) + 1;
        });
        
        const sorted = Object.entries(valueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        fieldStats[field.name].mostCommon = sorted.map(([value, count]) => ({
          value,
          count,
          percentage: (count / values.length) * 100
        }));
      }
    });

    // Calculate growth metrics (mock data for now)
    const analytics = {
      overview: {
        totalRecords: dataset.metadata.recordCount,
        totalFields: dataset.schema.fields.length,
        requiredFields: dataset.schema.fields.filter(f => f.required).length,
        searchableFields: dataset.schema.fields.filter(f => f.isSearchable).length
      },
      fieldStats,
      activity: {
        last24h: 0, // TODO: Calculate from audit logs
        last7d: 0,
        last30d: 0
      },
      storage: {
        size: dataset.metadata.size || 0,
        sizeFormatted: formatBytes(dataset.metadata.size || 0)
      },
      timestamps: {
        created: dataset.createdAt,
        updated: dataset.updatedAt,
        lastRecord: dataset.metadata.lastRecordAt
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics'
      },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
