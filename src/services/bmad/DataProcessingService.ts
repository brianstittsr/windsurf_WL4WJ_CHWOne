import { Dataset, DatasetColumn, TransformedDataset } from '@/types/bmad.types';
import { v4 as uuidv4 } from 'uuid';

// This would normally be imported from libraries
// For now, we'll mock these imports to avoid adding dependencies
const mockXLSX = {
  read: (data: any, opts: any) => {
    // Mock implementation
    return { SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } };
  },
  utils: {
    sheet_to_json: (sheet: any) => {
      // Mock implementation
      return [{ col1: 'value1', col2: 'value2' }];
    }
  }
};

const mockPapaParse = {
  parse: (csv: string, options: any) => {
    // Mock implementation
    return {
      data: [
        ['col1', 'col2'],
        ['value1', 'value2']
      ],
      errors: []
    };
  }
};

class DataProcessingService {
  /**
   * Process uploaded file and convert to dataset
   */
  async processFile(
    file: File,
    name: string,
    description: string,
    userId: string
  ): Promise<Dataset> {
    try {
      const format = this.getFileFormat(file.name);
      const rawData = await this.readFile(file, format);
      const columns = this.inferColumns(rawData);
      const previewData = rawData.slice(0, 10);
      
      const dataset: Dataset = {
        id: uuidv4(),
        name,
        description,
        format,
        size: file.size,
        createdAt: new Date(),
        updatedAt: new Date(),
        columns,
        rowCount: rawData.length,
        userId,
        previewData
      };
      
      // In a real implementation, we would store the full dataset
      // For now, we'll just return the dataset metadata
      return dataset;
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Determine file format from extension
   */
  private getFileFormat(filename: string): 'csv' | 'excel' | 'json' {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'json':
        return 'json';
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }
  
  /**
   * Read file contents based on format
   */
  private async readFile(file: File, format: 'csv' | 'excel' | 'json'): Promise<any[]> {
    const buffer = await file.arrayBuffer();
    
    switch (format) {
      case 'csv':
        return this.parseCSV(new TextDecoder().decode(buffer));
      case 'excel':
        return this.parseExcel(buffer);
      case 'json':
        return this.parseJSON(new TextDecoder().decode(buffer));
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  /**
   * Parse CSV data
   */
  private parseCSV(csvData: string): any[] {
    try {
      // In a real implementation, we would use PapaParse
      // For now, we'll return mock data
      const result = mockPapaParse.parse(csvData, {
        header: true,
        skipEmptyLines: true
      });
      
      if (result.errors && result.errors.length > 0) {
        throw new Error(`CSV parsing error: ${result.errors[0]}`);
      }
      
      return result.data as any[];
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Parse Excel data
   */
  private parseExcel(buffer: ArrayBuffer): any[] {
    try {
      // In a real implementation, we would use XLSX
      // For now, we'll return mock data
      const workbook = mockXLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      // Use type assertion to tell TypeScript this is safe
      const worksheet = workbook.Sheets[sheetName as keyof typeof workbook.Sheets];
      
      return mockXLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Parse JSON data
   */
  private parseJSON(jsonData: string): any[] {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Handle both array and object formats
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's an object with a data property that's an array
        if (Array.isArray(parsed.data)) {
          return parsed.data;
        }
        // If it's just an object, wrap it in an array
        return [parsed];
      }
      
      throw new Error('JSON data must be an array or an object with a data array');
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Infer column types from data
   */
  private inferColumns(data: any[]): DatasetColumn[] {
    if (!data || data.length === 0) {
      return [];
    }
    
    const firstRow = data[0];
    const columns: DatasetColumn[] = [];
    
    // Get all unique keys from all rows
    const allKeys = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });
    
    // Process each column
    allKeys.forEach(key => {
      const values = data.map(row => row[key]).filter(val => val !== undefined && val !== null);
      const nonNullValues = values.filter(val => val !== undefined && val !== null);
      const uniqueValues = new Set(nonNullValues).size;
      
      // Determine column type
      let type: DatasetColumn['type'] = 'string';
      
      if (nonNullValues.length > 0) {
        const firstValue = nonNullValues[0];
        
        if (typeof firstValue === 'number') {
          type = 'number';
        } else if (typeof firstValue === 'boolean') {
          type = 'boolean';
        } else if (firstValue instanceof Date) {
          type = 'date';
        } else if (typeof firstValue === 'object' && firstValue !== null) {
          if (Array.isArray(firstValue)) {
            type = 'array';
          } else {
            type = 'object';
          }
        }
      }
      
      // Calculate statistics for number columns
      let min, max, mean, median;
      if (type === 'number') {
        const numValues = nonNullValues as number[];
        min = Math.min(...numValues);
        max = Math.max(...numValues);
        mean = numValues.reduce((sum, val) => sum + val, 0) / numValues.length;
        
        // Calculate median
        const sorted = [...numValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        median = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      }
      
      columns.push({
        name: key,
        type,
        nullable: values.length !== nonNullValues.length,
        uniqueValues,
        min,
        max,
        mean,
        median,
        missingCount: data.length - nonNullValues.length
      });
    });
    
    return columns;
  }
  
  /**
   * Get datasets for a specific user
   */
  async getUserDatasets(userId: string): Promise<Dataset[]> {
    // In a real implementation, we would fetch datasets from a database
    // For now, we'll return mock data
    return [
      {
        id: uuidv4(),
        name: 'Sample Dataset 1',
        description: 'Sample demographic data',
        format: 'csv',
        size: 1024 * 50, // 50KB
        createdAt: new Date(),
        updatedAt: new Date(),
        columns: [
          { name: 'id', type: 'string', nullable: false, uniqueValues: 100, missingCount: 0 },
          { name: 'age', type: 'number', nullable: false, uniqueValues: 50, min: 18, max: 85, mean: 42.5, median: 41, missingCount: 0 },
          { name: 'gender', type: 'string', nullable: false, uniqueValues: 3, missingCount: 0 },
          { name: 'income', type: 'number', nullable: true, uniqueValues: 75, min: 15000, max: 150000, mean: 65000, median: 62000, missingCount: 5 }
        ],
        rowCount: 100,
        userId,
        previewData: Array(5).fill(0).map((_, i) => ({
          id: `P${i + 1}`,
          age: 25 + i * 10,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          income: 50000 + i * 10000
        }))
      },
      {
        id: uuidv4(),
        name: 'Sample Dataset 2',
        description: 'Sample health data',
        format: 'csv',
        size: 1024 * 75, // 75KB
        createdAt: new Date(),
        updatedAt: new Date(),
        columns: [
          { name: 'id', type: 'string', nullable: false, uniqueValues: 100, missingCount: 0 },
          { name: 'height', type: 'number', nullable: false, uniqueValues: 40, min: 150, max: 200, mean: 170, median: 168, missingCount: 0 },
          { name: 'weight', type: 'number', nullable: false, uniqueValues: 60, min: 45, max: 120, mean: 75, median: 72, missingCount: 0 },
          { name: 'blood_pressure', type: 'string', nullable: true, uniqueValues: 50, missingCount: 10 }
        ],
        rowCount: 100,
        userId,
        previewData: Array(5).fill(0).map((_, i) => ({
          id: `P${i + 1}`,
          height: 160 + i * 5,
          weight: 60 + i * 5,
          blood_pressure: `${110 + i * 5}/${70 + i * 2}`
        }))
      }
    ];
  }

  /**
   * Preview merge of two datasets
   */
  async previewMerge(
    dataset1Id: string,
    dataset2Id: string,
    mergeStrategy: any
  ): Promise<any[]> {
    // In a real implementation, we would fetch the datasets and generate a preview
    // For now, we'll return mock data
    return Array(5).fill(0).map((_, i) => ({
      id: `R${i + 1}`,
      name: `Result ${i + 1}`,
      value1: Math.floor(Math.random() * 100),
      value2: Math.floor(Math.random() * 100),
      combined: `Combined Value ${i + 1}`
    }));
  }

  /**
   * Merge datasets
   * This is an overloaded method that can handle either two datasets with a merge strategy,
   * or multiple datasets with a merge configuration
   */
  async mergeDatasets(
    datasetsOrId: Dataset[] | string,
    mergeConfigOrId: { keyColumns: { datasetId: string; column: string }[]; includeColumns: { datasetId: string; columns: string[] }[] } | string,
    mergeStrategyOrUndefined?: any,
    userIdOrUndefined?: string
  ): Promise<Dataset | TransformedDataset> {
    // Handle the two-dataset case
    if (typeof datasetsOrId === 'string' && typeof mergeConfigOrId === 'string') {
      const dataset1Id = datasetsOrId;
      const dataset2Id = mergeConfigOrId;
      const mergeStrategy = mergeStrategyOrUndefined;
      const userId = userIdOrUndefined || '';
      
      // In a real implementation, we would fetch the datasets and merge them
      // For now, we'll return a mock merged dataset
      return {
        id: `merged-${Date.now()}`,
        name: mergeStrategy.name || 'Merged Dataset',
        description: mergeStrategy.description || 'Merged from two datasets',
        format: 'csv',
        size: 1024 * 100, // 100KB
        createdAt: new Date(),
        updatedAt: new Date(),
        columns: [
          { name: 'id', type: 'string', nullable: false, uniqueValues: 100, missingCount: 0 },
          { name: 'name', type: 'string', nullable: false, uniqueValues: 100, missingCount: 0 },
          { name: 'value1', type: 'number', nullable: false, uniqueValues: 50, min: 0, max: 100, mean: 50, median: 50, missingCount: 0 },
          { name: 'value2', type: 'number', nullable: false, uniqueValues: 50, min: 0, max: 100, mean: 50, median: 50, missingCount: 0 },
          { name: 'combined', type: 'string', nullable: false, uniqueValues: 100, missingCount: 0 }
        ],
        rowCount: 100,
        userId,
        previewData: Array(5).fill(0).map((_, i) => ({
          id: `R${i + 1}`,
          name: `Result ${i + 1}`,
          value1: Math.floor(Math.random() * 100),
          value2: Math.floor(Math.random() * 100),
          combined: `Combined Value ${i + 1}`
        }))
      };
    }
    
    // Handle the multiple datasets case
    const datasets = datasetsOrId as Dataset[];
    const mergeConfig = mergeConfigOrId as { keyColumns: { datasetId: string; column: string }[]; includeColumns: { datasetId: string; columns: string[] }[] };
    
    // In a real implementation, we would fetch the full datasets and merge them
    // For now, we'll return a mock merged dataset
    
    const baseDataset = datasets[0];
    
    const mergedDataset: TransformedDataset = {
      ...baseDataset,
      id: uuidv4(),
      name: `Merged Dataset (${datasets.map(d => d.name).join(', ')})`,
      description: `Merged from ${datasets.length} datasets`,
      transformations: [{
        id: uuidv4(),
        type: 'join',
        params: mergeConfig,
        description: `Merged ${datasets.length} datasets using key columns`,
        createdAt: new Date()
      }],
      sourceDatasetIds: datasets.map(d => d.id),
      updatedAt: new Date(),
      // Combine columns from all datasets
      columns: datasets.flatMap(d => 
        d.columns.map(c => ({
          ...c,
          name: `${d.name}.${c.name}` // Prefix with dataset name to avoid conflicts
        }))
      ),
      rowCount: Math.max(...datasets.map(d => d.rowCount)) // Estimate
    };
    
    return mergedDataset;
  }
}

export const dataProcessingService = new DataProcessingService();
