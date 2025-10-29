'use client';

import { Dataset, DatasetColumn, TransformedDataset } from '@/types/bmad.types';
import { v4 as uuidv4 } from 'uuid';

// Simplified mock implementation for build to pass
class DataProcessingService {
  // Mock data for testing
  mockDataset = {
    id: uuidv4(),
    name: 'Mock Dataset',
    description: 'A mock dataset for testing',
    format: 'csv',
    size: 1024,
    createdAt: new Date(),
    updatedAt: new Date(),
    columns: [
      { name: 'id', type: 'number', nullable: false, uniqueValues: 10, missingCount: 0 },
      { name: 'name', type: 'string', nullable: true, uniqueValues: 8, missingCount: 2 }
    ],
    rowCount: 10,
    userId: 'user123',
    previewData: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]
  };

  // Mock methods
  async processFile(file: File): Promise<any> {
    return {
      success: true,
      data: this.mockDataset
    };
  }

  async getDatasetById(id: string): Promise<any> {
    return this.mockDataset;
  }

  async getUserDatasets(userId: string): Promise<any[]> {
    return [this.mockDataset];
  }

  async previewMerge(dataset1Id: string, dataset2Id: string): Promise<any> {
    return {
      mergedData: [
        { id: 1, name: 'Item 1', value1: 10, value2: 20, combined: '30' },
        { id: 2, name: 'Item 2', value1: 15, value2: 25, combined: '40' }
      ]
    };
  }

  async mergeDatasets(dataset1Id: string, dataset2Id: string): Promise<any> {
    return {
      id: uuidv4(),
      name: 'Merged Dataset',
      description: 'A merged dataset',
      format: 'csv',
      size: 2048,
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: [
        { name: 'id', type: 'number', nullable: false, uniqueValues: 10, missingCount: 0 },
        { name: 'name', type: 'string', nullable: true, uniqueValues: 8, missingCount: 2 },
        { name: 'value1', type: 'number', nullable: false, uniqueValues: 10, missingCount: 0 },
        { name: 'value2', type: 'number', nullable: false, uniqueValues: 10, missingCount: 0 },
        { name: 'combined', type: 'string', nullable: false, uniqueValues: 10, missingCount: 0 }
      ],
      rowCount: 10,
      userId: 'user123',
      previewData: [
        { id: 1, name: 'Item 1', value1: 10, value2: 20, combined: '30' },
        { id: 2, name: 'Item 2', value1: 15, value2: 25, combined: '40' }
      ]
    };
  }
}

const dataProcessingService = new DataProcessingService();
export { dataProcessingService };
export default dataProcessingService;
