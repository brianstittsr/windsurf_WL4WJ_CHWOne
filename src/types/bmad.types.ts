// BMAD Agent Types
export enum BmadAgentType {
  ANALYST = 'analyst',
  ORCHESTRATOR = 'orchestrator',
  DEVELOPER = 'developer'
}

// Dataset Types
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  format: 'csv' | 'excel' | 'json';
  size: number;
  createdAt: Date;
  updatedAt: Date;
  columns: DatasetColumn[];
  rowCount: number;
  userId: string;
  tags?: string[];
  metadata?: Record<string, any>;
  sourceUrl?: string;
  previewData?: any[];
}

export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  description?: string;
  nullable: boolean;
  uniqueValues?: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: string | number;
  missingCount?: number;
}

export interface TransformedDataset extends Dataset {
  transformations: Transformation[];
  sourceDatasetIds: string[];
}

export interface Transformation {
  id: string;
  type: 'filter' | 'sort' | 'join' | 'aggregate' | 'calculate' | 'pivot' | 'unpivot' | 'clean';
  params: Record<string, any>;
  description: string;
  createdAt: Date;
}

// Analysis Types
export interface AnalysisResult {
  id: string;
  datasetId: string;
  type: 'summary' | 'correlation' | 'timeSeries' | 'comparison' | 'custom';
  result: any;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Report Types
export interface ReportConfig {
  id?: string;
  title?: string;
  description?: string;
  datasets?: string[];
  sections?: ReportSection[];
  visualizations?: Visualization[];
  format?: 'pdf' | 'interactive';
  theme?: 'light' | 'dark' | 'professional' | 'colorful';
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  isTemplate?: boolean;
  status?: 'draft' | 'generating' | 'complete' | 'error';
}

export interface ReportSection {
  id: string;
  title: string;
  content?: string;
  type: 'text' | 'visualization' | 'table' | 'summary';
  order: number;
  visualizationId?: string;
  tableData?: any[];
  tableColumns?: string[];
}

export interface Visualization {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'map' | 'table';
  title: string;
  description?: string;
  data: any;
  options?: Record<string, any>;
  datasetId: string;
  dimensions?: string[];
  measures?: string[];
  filters?: Filter[];
}

export interface Filter {
  column: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'between';
  value: any;
  secondValue?: any; // For 'between' operator
}

export interface Report {
  id: string;
  config: ReportConfig;
  generatedContent?: any;
  pdfUrl?: string;
  datasetUrls?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  status: 'draft' | 'generating' | 'complete' | 'error';
  error?: string;
}

// Conversation Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  messages: Message[];
  reportConfigId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'complete' | 'error';
}

// BMAD Agent Service Types
export interface BmadAgentRequest {
  message?: string;
  currentConfig?: ReportConfig;
  availableDatasets?: Dataset[];
  analysisType?: string;
  transformations?: Transformation[];
  userId?: string;
  report?: any; // For report-related operations
  transformedDataset?: TransformedDataset; // For dataset export operations
  format?: string; // For export format operations
}

export interface BmadAgentResponse {
  message?: string;
  updatedConfig?: ReportConfig;
  readyToGenerate?: boolean;
  analysisResult?: AnalysisResult;
  transformedDataset?: TransformedDataset;
  error?: string;
}
