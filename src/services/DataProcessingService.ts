import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { promisify } from 'util';

export interface ProcessedDataset {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'csv' | 'image' | 'json';
  originalFile: string;
  data: any[];
  columns: string[];
  rowCount: number;
  createdAt: Date;
  metadata: {
    source: string;
    description?: string;
    tags?: string[];
  };
}

export interface DataProcessingResult {
  success: boolean;
  dataset?: ProcessedDataset;
  error?: string;
}

export class DataProcessingService {
  private datafilesPath: string;

  constructor() {
    this.datafilesPath = path.join(process.cwd(), 'datafiles');
  }

  async processFile(fileName: string): Promise<DataProcessingResult> {
    try {
      const filePath = path.join(this.datafilesPath, fileName);

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: `File ${fileName} not found in datafiles directory`
        };
      }

      const fileExtension = path.extname(fileName).toLowerCase();
      const fileNameWithoutExt = path.basename(fileName, fileExtension);

      switch (fileExtension) {
        case '.pdf':
          return await this.processPDF(filePath, fileNameWithoutExt);
        case '.xlsx':
        case '.xls':
          return await this.processExcel(filePath, fileNameWithoutExt);
        case '.csv':
          return await this.processCSV(filePath, fileNameWithoutExt);
        case '.jpg':
        case '.jpeg':
        case '.png':
          return await this.processImage(filePath, fileNameWithoutExt);
        default:
          return {
            success: false,
            error: `Unsupported file type: ${fileExtension}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async processPDF(filePath: string, fileName: string): Promise<DataProcessingResult> {
    try {
      const pdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      // Extract text content (simplified - in real implementation, use pdf-parse or similar)
      const textContent = `PDF Document: ${fileName}\nPages: ${pageCount}`;

      // Mock data extraction - in real implementation, use AI/ML for data extraction
      const mockData = [{
        document_type: 'PDF',
        filename: fileName,
        page_count: pageCount,
        extracted_text: textContent,
        processed_at: new Date().toISOString()
      }];

      const dataset: ProcessedDataset = {
        id: `dataset_${Date.now()}`,
        name: fileName,
        type: 'pdf',
        originalFile: fileName,
        data: mockData,
        columns: Object.keys(mockData[0]),
        rowCount: mockData.length,
        createdAt: new Date(),
        metadata: {
          source: 'datafiles',
          description: `Processed PDF document: ${fileName}`,
          tags: ['pdf', 'document']
        }
      };

      return { success: true, dataset };
    } catch (error) {
      return {
        success: false,
        error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async processExcel(filePath: string, fileName: string): Promise<DataProcessingResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        return {
          success: false,
          error: 'Excel file contains no data'
        };
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1).map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      const dataset: ProcessedDataset = {
        id: `dataset_${Date.now()}`,
        name: fileName,
        type: 'excel',
        originalFile: fileName,
        data: rows,
        columns: headers,
        rowCount: rows.length,
        createdAt: new Date(),
        metadata: {
          source: 'datafiles',
          description: `Processed Excel spreadsheet: ${fileName}`,
          tags: ['excel', 'spreadsheet']
        }
      };

      return { success: true, dataset };
    } catch (error) {
      return {
        success: false,
        error: `Excel processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async processCSV(filePath: string, fileName: string): Promise<DataProcessingResult> {
    return new Promise((resolve) => {
      const fileContent = fs.readFileSync(filePath, 'utf8');

      Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            resolve({
              success: false,
              error: `CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`
            });
            return;
          }

          const dataset: ProcessedDataset = {
            id: `dataset_${Date.now()}`,
            name: fileName,
            type: 'csv',
            originalFile: fileName,
            data: results.data as any[],
            columns: results.meta.fields || [],
            rowCount: results.data.length,
            createdAt: new Date(),
            metadata: {
              source: 'datafiles',
              description: `Processed CSV file: ${fileName}`,
              tags: ['csv', 'data']
            }
          };

          resolve({ success: true, dataset });
        },
        error: (error) => {
          resolve({
            success: false,
            error: `CSV processing failed: ${error.message}`
          });
        }
      });
    });
  }

  private async processImage(filePath: string, fileName: string): Promise<DataProcessingResult> {
    try {
      // Mock image processing - in real implementation, use OCR or image recognition AI
      const mockData = [{
        image_type: 'image',
        filename: fileName,
        processed_at: new Date().toISOString(),
        extracted_data: 'Image processing would extract text/data using OCR AI services',
        metadata: {
          file_size: fs.statSync(filePath).size,
          extension: path.extname(fileName)
        }
      }];

      const dataset: ProcessedDataset = {
        id: `dataset_${Date.now()}`,
        name: fileName,
        type: 'image',
        originalFile: fileName,
        data: mockData,
        columns: Object.keys(mockData[0]),
        rowCount: mockData.length,
        createdAt: new Date(),
        metadata: {
          source: 'datafiles',
          description: `Processed image file: ${fileName}`,
          tags: ['image', 'visual']
        }
      };

      return { success: true, dataset };
    } catch (error) {
      return {
        success: false,
        error: `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getAvailableFiles(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.datafilesPath);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.pdf', '.xlsx', '.xls', '.csv', '.jpg', '.jpeg', '.png'].includes(ext);
      });
    } catch (error) {
      console.error('Error reading datafiles directory:', error);
      return [];
    }
  }

  async mergeDatasets(datasets: ProcessedDataset[]): Promise<ProcessedDataset> {
    if (datasets.length === 0) {
      throw new Error('No datasets provided for merging');
    }

    // Simple merge strategy - combine all data arrays
    const mergedData: any[] = [];
    const allColumns = new Set<string>();

    datasets.forEach(dataset => {
      mergedData.push(...dataset.data);
      dataset.columns.forEach(col => allColumns.add(col));
    });

    return {
      id: `merged_${Date.now()}`,
      name: `Merged Dataset (${datasets.length} sources)`,
      type: 'json', // Merged data is JSON
      originalFile: 'multiple_sources',
      data: mergedData,
      columns: Array.from(allColumns),
      rowCount: mergedData.length,
      createdAt: new Date(),
      metadata: {
        source: 'merged',
        description: `Merged dataset from ${datasets.length} sources`,
        tags: ['merged', 'combined']
      }
    };
  }
}
