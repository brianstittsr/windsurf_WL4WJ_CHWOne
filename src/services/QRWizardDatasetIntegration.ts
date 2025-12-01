/**
 * QR Wizard <-> Datasets Admin Platform Integration
 * 
 * This service handles the integration between QR Wizard and Datasets Admin Platform.
 * It automatically creates datasets and stores participant data as records.
 */

import { datasetService } from './DatasetService';
import { CreateDataset, CreateDatasetRecord, DatasetField, DatasetFieldType } from '@/types/dataset.types';
import { ParticipantDataUpload } from '@/types/qr-tracking-wizard.types';

/**
 * Map QR Wizard field types to Dataset field types
 */
function mapFieldType(fieldName: string): DatasetFieldType {
  const lowerName = fieldName.toLowerCase();
  
  if (lowerName.includes('email')) return 'email';
  if (lowerName.includes('phone')) return 'phone';
  if (lowerName.includes('url') || lowerName.includes('website')) return 'url';
  if (lowerName.includes('date')) return 'date';
  if (lowerName.includes('age') || lowerName.includes('number') || lowerName.includes('count')) return 'number';
  if (lowerName.includes('notes') || lowerName.includes('description') || lowerName.includes('comments')) return 'text';
  
  return 'string';
}

/**
 * Create a dataset from QR Wizard participant upload
 */
export async function createDatasetFromQRWizard(
  programName: string,
  organizationId: string,
  userId: string,
  participantData: ParticipantDataUpload,
  standardFields: string[],
  customFields: Array<{ fieldName: string; fieldType?: string; required?: boolean }>
): Promise<{ datasetId: string; recordCount: number }> {
  
  try {
    // Build schema from fields
    const fields: DatasetField[] = [];
    let fieldOrder = 0;
    
    // Add standard fields
    standardFields.forEach(fieldName => {
      fields.push({
        id: `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`,
        name: fieldName.toLowerCase().replace(/\s+/g, '_'),
        label: fieldName,
        type: mapFieldType(fieldName),
        required: true,
        isSearchable: true,
        isSortable: true,
        displayOrder: fieldOrder++
      });
    });
    
    // Add custom fields
    customFields.forEach(field => {
      fields.push({
        id: `field_${field.fieldName.toLowerCase().replace(/\s+/g, '_')}`,
        name: field.fieldName.toLowerCase().replace(/\s+/g, '_'),
        label: field.fieldName,
        type: field.fieldType as DatasetFieldType || mapFieldType(field.fieldName),
        required: field.required || false,
        isSearchable: true,
        isSortable: true,
        displayOrder: fieldOrder++
      });
    });
    
    // Create dataset
    const datasetData: CreateDataset = {
      name: `${programName} - Participants`,
      description: `Participant data for ${programName} QR tracking program`,
      sourceApplication: 'QR Wizard',
      organizationId,
      createdBy: userId,
      schema: {
        fields,
        version: '1.0'
      },
      permissions: {
        owners: [userId],
        editors: [],
        viewers: [],
        publicAccess: 'none',
        apiAccess: true // Enable API access for QR code scanning
      },
      config: {
        validation: {
          strictMode: false, // Allow flexible data entry
          allowExtraFields: true,
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
    
    // Store participants as records
    if (participantData.participants && participantData.participants.length > 0) {
      const records: CreateDatasetRecord[] = participantData.participants.map(participant => {
        // Map participant data to dataset fields
        const mappedData: Record<string, any> = {};
        
        // Use field mapping if available
        if (participantData.fieldMapping && Object.keys(participantData.fieldMapping).length > 0) {
          Object.entries(participantData.fieldMapping).forEach(([csvHeader, targetField]) => {
            if (participant[csvHeader] !== undefined) {
              mappedData[targetField] = participant[csvHeader];
            }
          });
        } else {
          // Direct mapping
          Object.entries(participant).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
            mappedData[normalizedKey] = value;
          });
        }
        
        return {
          datasetId: dataset.id,
          data: mappedData,
          status: 'active',
          source: {
            application: 'QR Wizard',
            step: 'Step 4 - Participant Upload'
          }
        };
      });
      
      // Batch create records
      await datasetService.batchCreateRecords(dataset.id, records, userId);
    }
    
    return {
      datasetId: dataset.id,
      recordCount: participantData.participants?.length || 0
    };
    
  } catch (error) {
    console.error('Error creating dataset from QR Wizard:', error);
    throw error;
  }
}

/**
 * Add a single participant record to existing dataset
 */
export async function addParticipantRecord(
  datasetId: string,
  participantData: Record<string, any>,
  userId: string
): Promise<string> {
  try {
    const record: CreateDatasetRecord = {
      datasetId,
      data: participantData,
      status: 'active',
      source: {
        application: 'QR Wizard',
        step: 'Participant Addition'
      }
    };
    
    const createdRecord = await datasetService.createRecord(datasetId, record, userId);
    return createdRecord.id;
  } catch (error) {
    console.error('Error adding participant record:', error);
    throw error;
  }
}

/**
 * Update participant record
 */
export async function updateParticipantRecord(
  recordId: string,
  updates: Record<string, any>,
  userId: string
): Promise<void> {
  try {
    await datasetService.updateRecord(recordId, { data: updates }, userId);
  } catch (error) {
    console.error('Error updating participant record:', error);
    throw error;
  }
}

/**
 * Get all participants for a dataset
 */
export async function getParticipants(
  datasetId: string,
  page: number = 1,
  pageSize: number = 100
) {
  try {
    const result = await datasetService.queryRecords({
      datasetId,
      page,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return result;
  } catch (error) {
    console.error('Error getting participants:', error);
    throw error;
  }
}

/**
 * Search participants
 */
export async function searchParticipants(
  datasetId: string,
  searchQuery: string
) {
  try {
    const result = await datasetService.queryRecords({
      datasetId,
      search: searchQuery,
      pageSize: 100
    });
    
    return result;
  } catch (error) {
    console.error('Error searching participants:', error);
    throw error;
  }
}

/**
 * Record QR code scan event
 */
export async function recordQRScan(
  datasetId: string,
  participantId: string,
  scanData: {
    location?: string;
    timestamp: Date;
    scannedBy?: string;
    notes?: string;
  },
  userId: string
): Promise<void> {
  try {
    // Get existing record
    const record = await datasetService.getRecord(participantId);
    
    if (!record) {
      throw new Error('Participant record not found');
    }
    
    // Add scan event to record
    const scans = record.data.scans || [];
    scans.push({
      ...scanData,
      timestamp: scanData.timestamp.toISOString()
    });
    
    // Update record
    await datasetService.updateRecord(
      participantId,
      {
        data: {
          ...record.data,
          scans,
          lastScanAt: scanData.timestamp.toISOString(),
          scanCount: scans.length
        }
      },
      userId
    );
    
  } catch (error) {
    console.error('Error recording QR scan:', error);
    throw error;
  }
}

/**
 * Get dataset statistics for QR Wizard
 */
export async function getDatasetStats(datasetId: string) {
  try {
    const stats = await datasetService.getDatasetStatistics(datasetId);
    return stats;
  } catch (error) {
    console.error('Error getting dataset stats:', error);
    throw error;
  }
}

/**
 * Export participants to CSV
 */
export async function exportParticipantsToCSV(datasetId: string): Promise<string> {
  try {
    const dataset = await datasetService.getDataset(datasetId);
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    
    const records = await datasetService.queryRecords({
      datasetId,
      pageSize: 10000 // Get all records
    });
    
    // Build CSV
    const headers = dataset.schema.fields.map(f => f.label);
    const csvRows = [headers.join(',')];
    
    records.records.forEach(record => {
      const row = dataset.schema.fields.map(field => {
        const value = record.data[field.name] || '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Error exporting participants:', error);
    throw error;
  }
}
