import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

// Dynamic import for pdf-parse (Node.js only)
let pdfParse: any = null;
if (typeof window === 'undefined') {
  try {
    pdfParse = require('pdf-parse');
  } catch (e) {
    console.warn('pdf-parse not available, PDF processing will be limited');
  }
}

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
  data?: any;
  error?: string;
  fileName?: string;
  fileType?: string;
  columns?: string[];
}

class DataProcessingService {
  private datafilesPath: string;

  constructor() {
    this.datafilesPath = path.join(process.cwd(), 'datafiles');
  }

  async processFile(filePath: string): Promise<DataProcessingResult> {
    try {
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(fileName).toLowerCase();
      const fileNameWithoutExt = path.basename(fileName, fileExtension);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: `File ${fileName} not found`
        };
      }

      switch (fileExtension) {
        case '.pdf':
          return await this.processPDF(filePath, fileNameWithoutExt);
        case '.csv':
          return await this.processCSV(filePath, fileNameWithoutExt);
        default:
          return {
            success: false,
            error: `Unsupported file type: ${fileExtension}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async processPDF(filePath: string, fileName: string): Promise<DataProcessingResult> {
    try {
      if (!pdfParse) {
        return {
          success: false,
          error: 'PDF processing library not available. Please install pdf-parse: npm install pdf-parse'
        };
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      // Extract text content
      const textContent = pdfData.text;
      const pageCount = pdfData.numpages;
      const info = pdfData.info || {};

      // Parse text into structured data
      const lines = textContent.split('\n').filter((line: string) => line.trim().length > 0);
      
      // Create dataset with extracted information
      const extractedData = [{
        document_type: 'PDF',
        filename: fileName,
        page_count: pageCount,
        title: info.Title || fileName,
        author: info.Author || 'Unknown',
        subject: info.Subject || '',
        keywords: info.Keywords || '',
        extracted_text: textContent,
        line_count: lines.length,
        processed_at: new Date().toISOString()
      }];

      const dataset: ProcessedDataset = {
        id: `dataset_${Date.now()}`,
        name: fileName,
        type: 'pdf',
        originalFile: fileName,
        data: extractedData,
        columns: Object.keys(extractedData[0]),
        rowCount: extractedData.length,
        createdAt: new Date(),
        metadata: {
          source: 'datafiles',
          description: `Processed PDF document: ${fileName} (${pageCount} pages, ${lines.length} lines)`,
          tags: ['pdf', 'document', 'grant']
        }
      };

      return { 
        success: true, 
        dataset,
        data: extractedData,
        fileName,
        fileType: '.pdf',
        columns: Object.keys(extractedData[0])
      };
    } catch (error) {
      return {
        success: false,
        error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async processCSV(filePath: string, fileName: string): Promise<DataProcessingResult> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      return new Promise((resolve) => {
        Papa.parse(fileContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const dataset: ProcessedDataset = {
              id: `dataset_${Date.now()}`,
              name: fileName,
              type: 'csv',
              originalFile: fileName,
              data: results.data,
              columns: results.meta.fields || [],
              rowCount: results.data.length,
              createdAt: new Date(),
              metadata: {
                source: 'datafiles',
                description: `Processed CSV file: ${fileName}`,
                tags: ['csv', 'data']
              }
            };

            resolve({
              success: true,
              dataset,
              data: results.data,
              fileName,
              fileType: '.csv',
              columns: results.meta.fields || []
            });
          },
          error: (error) => {
            resolve({
              success: false,
              error: `CSV parsing failed: ${error.message}`
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: `CSV processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async listAvailableFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.datafilesPath)) {
        return [];
      }
      const files = fs.readdirSync(this.datafilesPath);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.pdf', '.csv'].includes(ext);
      });
    } catch (error) {
      console.error('Error reading datafiles directory:', error);
      return [];
    }
  }
}

const dataProcessingService = new DataProcessingService();
export { DataProcessingService, dataProcessingService };
export default dataProcessingService;
