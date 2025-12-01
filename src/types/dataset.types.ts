import { Timestamp } from 'firebase/firestore';

/**
 * Dataset Admin Platform - Type Definitions
 * Universal dataset management system for form submissions and data storage
 */

// ============================================================================
// DATASET FIELD TYPES
// ============================================================================

export type DatasetFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'phone'
  | 'url'
  | 'text'
  | 'select'
  | 'multiselect'
  | 'file'
  | 'json'
  | 'array';

export interface DatasetField {
  id: string;
  name: string;
  label: string;
  type: DatasetFieldType;
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  
  // Validation
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customRule?: string;
  };
  
  // For select/multiselect
  options?: string[];
  
  // Metadata
  description?: string;
  helpText?: string;
  placeholder?: string;
  
  // Display
  displayOrder?: number;
  isVisible?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
}

// ============================================================================
// DATASET SCHEMA
// ============================================================================

export interface DatasetSchema {
  fields: DatasetField[];
  version: string;
  primaryKey?: string;
  indexes?: string[];
  relationships?: DatasetRelationship[];
}

export interface DatasetRelationship {
  field: string;
  targetDataset: string;
  targetField: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

// ============================================================================
// DATASET METADATA
// ============================================================================

export interface DatasetMetadata {
  recordCount: number;
  lastRecordAt?: Timestamp;
  tags: string[];
  category: string;
  isPublic: boolean;
  size?: number; // in bytes
  lastExportAt?: Timestamp;
  lastImportAt?: Timestamp;
}

// ============================================================================
// DATASET PERMISSIONS
// ============================================================================

export interface DatasetPermissions {
  owners: string[]; // User IDs
  editors: string[]; // User IDs
  viewers: string[]; // User IDs
  publicAccess: 'none' | 'read' | 'write';
  apiAccess: boolean;
}

// ============================================================================
// DATASET CONFIGURATION
// ============================================================================

export interface DatasetConfig {
  // Data Validation
  validation: {
    strictMode: boolean;
    allowExtraFields: boolean;
    validateOnSubmit: boolean;
  };
  
  // Webhooks
  webhooks: {
    enabled: boolean;
    onCreate?: string; // URL
    onUpdate?: string; // URL
    onDelete?: string; // URL
  };
  
  // Notifications
  notifications: {
    emailOnSubmit: boolean;
    emailRecipients: string[];
    slackWebhook?: string;
  };
  
  // Data Retention
  retention: {
    enabled: boolean;
    days?: number;
    archiveOldRecords: boolean;
  };
}

// ============================================================================
// MAIN DATASET INTERFACE
// ============================================================================

export interface Dataset {
  id: string;
  name: string;
  description: string;
  sourceApplication: string; // e.g., "QR Wizard", "Form Builder", etc.
  organizationId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Schema
  schema: DatasetSchema;
  
  // Metadata
  metadata: DatasetMetadata;
  
  // Access Control
  permissions: DatasetPermissions;
  
  // Configuration
  config: DatasetConfig;
  
  // Status
  status: 'active' | 'archived' | 'deleted';
}

// ============================================================================
// DATASET RECORD
// ============================================================================

export interface DatasetRecord {
  id: string;
  datasetId: string;
  data: Record<string, any>; // Flexible data storage
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
  
  // Source tracking
  source?: {
    application: string;
    formId?: string;
    submissionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  
  // Status
  status: 'active' | 'archived' | 'deleted';
  version?: number;
}

// ============================================================================
// API KEY
// ============================================================================

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Hashed
  organizationId: string;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  
  // Permissions
  permissions: {
    datasets: string[]; // Dataset IDs or '*' for all
    actions: ('read' | 'write' | 'delete')[];
  };
  
  // Usage tracking
  usage: {
    lastUsedAt?: Timestamp;
    requestCount: number;
    rateLimit?: number; // requests per minute
  };
  
  // Status
  status: 'active' | 'revoked';
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface AuditLog {
  id: string;
  datasetId: string;
  recordId?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'schema_change';
  userId?: string;
  apiKeyId?: string;
  timestamp: Timestamp;
  
  // Details
  details: {
    before?: any;
    after?: any;
    changes?: Record<string, any>;
  };
  
  // Context
  context: {
    ipAddress?: string;
    userAgent?: string;
    source: 'web' | 'api' | 'webhook' | 'system';
  };
}

// ============================================================================
// DATASET ANALYTICS
// ============================================================================

export interface DatasetAnalytics {
  datasetId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  
  // Record statistics
  records: {
    total: number;
    created: number;
    updated: number;
    deleted: number;
  };
  
  // Field statistics
  fieldStats: Record<string, {
    type: DatasetFieldType;
    nullCount: number;
    uniqueCount: number;
    mostCommon?: any[];
    min?: number;
    max?: number;
    avg?: number;
  }>;
  
  // Activity
  activity: {
    submissions: number;
    exports: number;
    apiCalls: number;
    uniqueUsers: number;
  };
  
  // Time series data
  timeSeries?: {
    date: string;
    count: number;
  }[];
}

// ============================================================================
// DATASET EXPORT
// ============================================================================

export interface DatasetExport {
  id: string;
  datasetId: string;
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Options
  options: {
    includeHeaders: boolean;
    fields?: string[]; // Specific fields to export
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  
  // Result
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp;
}

// ============================================================================
// DATASET IMPORT
// ============================================================================

export interface DatasetImport {
  id: string;
  datasetId: string;
  format: 'csv' | 'json' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Options
  options: {
    updateExisting: boolean;
    skipInvalid: boolean;
    fieldMapping?: Record<string, string>;
  };
  
  // Result
  result?: {
    totalRows: number;
    successCount: number;
    failedCount: number;
    errors?: Array<{
      row: number;
      field?: string;
      message: string;
    }>;
  };
  
  // Metadata
  fileName: string;
  fileSize: number;
  createdBy: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// ============================================================================
// QUERY FILTERS
// ============================================================================

export interface DatasetQuery {
  datasetId: string;
  
  // Pagination
  page?: number;
  pageSize?: number;
  
  // Filters
  filters?: Record<string, any>;
  search?: string;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Fields
  fields?: string[]; // Specific fields to return
  
  // Date range
  dateRange?: {
    field: string;
    start: Date;
    end: Date;
  };
}

export interface DatasetQueryResult {
  records: DatasetRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// DATASET STATISTICS
// ============================================================================

export interface DatasetStatistics {
  totalDatasets: number;
  totalRecords: number;
  totalSize: number; // in bytes
  activeDatasets: number;
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  topDatasets: Array<{
    id: string;
    name: string;
    recordCount: number;
  }>;
}

// ============================================================================
// FORM SUBMISSION (from external apps)
// ============================================================================

export interface FormSubmission {
  formId: string;
  datasetId: string;
  data: Record<string, any>;
  
  // Metadata
  submittedAt: Timestamp;
  submittedBy?: string;
  source: {
    application: string;
    version?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  
  // Validation
  isValid: boolean;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// WEBHOOK EVENT
// ============================================================================

export interface WebhookEvent {
  id: string;
  datasetId: string;
  event: 'record.created' | 'record.updated' | 'record.deleted' | 'schema.changed';
  timestamp: Timestamp;
  
  // Payload
  payload: {
    record?: DatasetRecord;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  
  // Delivery
  delivery: {
    url: string;
    status: 'pending' | 'delivered' | 'failed';
    attempts: number;
    lastAttemptAt?: Timestamp;
    response?: {
      statusCode: number;
      body?: string;
    };
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type CreateDataset = Omit<Dataset, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>;
export type UpdateDataset = Partial<Omit<Dataset, 'id' | 'createdAt' | 'createdBy' | 'organizationId'>>;

export type CreateDatasetRecord = Omit<DatasetRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>;
export type UpdateDatasetRecord = Partial<Omit<DatasetRecord, 'id' | 'datasetId' | 'createdAt' | 'createdBy'>>;

// ============================================================================
// FIRESTORE COLLECTIONS
// ============================================================================

export const DATASET_COLLECTIONS = {
  DATASETS: 'datasets',
  RECORDS: 'datasetRecords',
  API_KEYS: 'datasetApiKeys',
  AUDIT_LOGS: 'datasetAuditLogs',
  EXPORTS: 'datasetExports',
  IMPORTS: 'datasetImports',
  WEBHOOKS: 'datasetWebhooks'
} as const;
