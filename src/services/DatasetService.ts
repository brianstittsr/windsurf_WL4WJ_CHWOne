import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dataset,
  DatasetRecord,
  DatasetQuery,
  DatasetQueryResult,
  CreateDataset,
  UpdateDataset,
  CreateDatasetRecord,
  UpdateDatasetRecord,
  DATASET_COLLECTIONS,
  DatasetStatistics,
  ApiKey
} from '@/types/dataset.types';

/**
 * Dataset Service
 * Centralized service for all dataset operations
 */
class DatasetService {
  // ============================================================================
  // DATASET CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new dataset
   */
  async createDataset(data: CreateDataset, userId: string): Promise<Dataset> {
    const datasetId = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const inputData = data as any;
    const dataset: Dataset = {
      ...data,
      id: datasetId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        recordCount: 0,
        tags: inputData.metadata?.tags || [],
        category: inputData.metadata?.category || 'general',
        isPublic: inputData.metadata?.isPublic || false
      },
      status: 'active'
    };

    const datasetRef = doc(db, DATASET_COLLECTIONS.DATASETS, datasetId);
    await setDoc(datasetRef, dataset);

    // Log creation
    await this.logAudit({
      datasetId,
      action: 'create',
      userId,
      details: { after: dataset }
    });

    return dataset;
  }

  /**
   * Get dataset by ID
   */
  async getDataset(datasetId: string): Promise<Dataset | null> {
    const datasetRef = doc(db, DATASET_COLLECTIONS.DATASETS, datasetId);
    const datasetSnap = await getDoc(datasetRef);

    if (!datasetSnap.exists()) {
      return null;
    }

    return datasetSnap.data() as Dataset;
  }

  /**
   * List datasets with filters
   */
  async listDatasets(filters?: {
    organizationId?: string;
    sourceApplication?: string;
    status?: string;
    limit?: number;
  }): Promise<Dataset[]> {
    let q = query(collection(db, DATASET_COLLECTIONS.DATASETS));

    if (filters?.organizationId) {
      q = query(q, where('organizationId', '==', filters.organizationId));
    }

    if (filters?.sourceApplication) {
      q = query(q, where('sourceApplication', '==', filters.sourceApplication));
    }

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Dataset);
  }

  /**
   * Update dataset
   */
  async updateDataset(
    datasetId: string,
    updates: UpdateDataset,
    userId: string
  ): Promise<void> {
    const datasetRef = doc(db, DATASET_COLLECTIONS.DATASETS, datasetId);
    
    // Get current data for audit
    const currentData = await this.getDataset(datasetId);

    await updateDoc(datasetRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    // Log update
    await this.logAudit({
      datasetId,
      action: 'update',
      userId,
      details: {
        before: currentData,
        after: updates
      }
    });
  }

  /**
   * Delete dataset (soft delete)
   */
  async deleteDataset(datasetId: string, userId: string): Promise<void> {
    await this.updateDataset(
      datasetId,
      { status: 'deleted' },
      userId
    );

    // Log deletion
    await this.logAudit({
      datasetId,
      action: 'delete',
      userId,
      details: {}
    });
  }

  // ============================================================================
  // RECORD CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new record
   */
  async createRecord(
    datasetId: string,
    data: CreateDatasetRecord,
    userId?: string
  ): Promise<DatasetRecord> {
    const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const record: DatasetRecord = {
      ...data,
      id: recordId,
      datasetId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      status: 'active',
      version: 1
    };

    // Save record
    const recordRef = doc(db, DATASET_COLLECTIONS.RECORDS, recordId);
    await setDoc(recordRef, record);

    // Update dataset record count
    const datasetRef = doc(db, DATASET_COLLECTIONS.DATASETS, datasetId);
    await updateDoc(datasetRef, {
      'metadata.recordCount': increment(1),
      'metadata.lastRecordAt': Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Log creation
    await this.logAudit({
      datasetId,
      recordId,
      action: 'create',
      userId,
      details: { after: record }
    });

    return record;
  }

  /**
   * Get record by ID
   */
  async getRecord(recordId: string): Promise<DatasetRecord | null> {
    const recordRef = doc(db, DATASET_COLLECTIONS.RECORDS, recordId);
    const recordSnap = await getDoc(recordRef);

    if (!recordSnap.exists()) {
      return null;
    }

    return recordSnap.data() as DatasetRecord;
  }

  /**
   * Query records with filters and pagination
   */
  async queryRecords(queryParams: DatasetQuery): Promise<DatasetQueryResult> {
    let q = query(
      collection(db, DATASET_COLLECTIONS.RECORDS),
      where('datasetId', '==', queryParams.datasetId),
      where('status', '==', 'active')
    );

    // Apply filters
    if (queryParams.filters) {
      Object.entries(queryParams.filters).forEach(([field, value]) => {
        q = query(q, where(`data.${field}`, '==', value));
      });
    }

    // Apply sorting
    if (queryParams.sortBy) {
      const order = queryParams.sortOrder || 'asc';
      q = query(q, orderBy(queryParams.sortBy, order));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    // Apply pagination
    const pageSize = queryParams.pageSize || 25;
    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => doc.data() as DatasetRecord);

    // Get total count (in production, use a separate count query or cache)
    const totalRecords = records.length; // Simplified for now

    return {
      records,
      total: totalRecords,
      page: queryParams.page || 1,
      pageSize,
      totalPages: Math.ceil(totalRecords / pageSize)
    };
  }

  /**
   * Update record
   */
  async updateRecord(
    recordId: string,
    updates: UpdateDatasetRecord,
    userId?: string
  ): Promise<void> {
    const recordRef = doc(db, DATASET_COLLECTIONS.RECORDS, recordId);
    
    // Get current data for audit
    const currentData = await this.getRecord(recordId);

    await updateDoc(recordRef, {
      ...updates,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
      version: increment(1)
    });

    // Log update
    if (currentData) {
      await this.logAudit({
        datasetId: currentData.datasetId,
        recordId,
        action: 'update',
        userId,
        details: {
          before: currentData,
          after: updates
        }
      });
    }
  }

  /**
   * Delete record (soft delete)
   */
  async deleteRecord(recordId: string, userId?: string): Promise<void> {
    const record = await this.getRecord(recordId);
    
    if (!record) {
      throw new Error('Record not found');
    }

    await this.updateRecord(
      recordId,
      { status: 'deleted' },
      userId
    );

    // Update dataset record count
    const datasetRef = doc(db, DATASET_COLLECTIONS.DATASETS, record.datasetId);
    await updateDoc(datasetRef, {
      'metadata.recordCount': increment(-1),
      updatedAt: Timestamp.now()
    });

    // Log deletion
    await this.logAudit({
      datasetId: record.datasetId,
      recordId,
      action: 'delete',
      userId,
      details: {}
    });
  }

  /**
   * Batch create records
   */
  async batchCreateRecords(
    datasetId: string,
    records: CreateDatasetRecord[],
    userId?: string
  ): Promise<DatasetRecord[]> {
    const batch = writeBatch(db);
    const createdRecords: DatasetRecord[] = [];

    records.forEach(recordData => {
      const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const record: DatasetRecord = {
        ...recordData,
        id: recordId,
        datasetId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        status: 'active',
        version: 1
      };

      const recordRef = doc(db, DATASET_COLLECTIONS.RECORDS, recordId);
      batch.set(recordRef, record);
      createdRecords.push(record);
    });

    // Update dataset record count
    const datasetRef = doc(db, DATASET_COLLECTIONS.DATASETS, datasetId);
    batch.update(datasetRef, {
      'metadata.recordCount': increment(records.length),
      'metadata.lastRecordAt': Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await batch.commit();

    // Log batch creation
    await this.logAudit({
      datasetId,
      action: 'create',
      userId,
      details: { after: { count: records.length } }
    });

    return createdRecords;
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  /**
   * Get dataset statistics
   */
  async getStatistics(organizationId?: string): Promise<DatasetStatistics> {
    let datasetsQuery = query(collection(db, DATASET_COLLECTIONS.DATASETS));
    
    if (organizationId) {
      datasetsQuery = query(datasetsQuery, where('organizationId', '==', organizationId));
    }

    const datasetsSnapshot = await getDocs(datasetsQuery);
    const datasets = datasetsSnapshot.docs.map(doc => doc.data() as Dataset);

    const totalRecords = datasets.reduce((sum, ds) => sum + (ds.metadata.recordCount || 0), 0);
    const activeDatasets = datasets.filter(ds => ds.status === 'active').length;

    // Get top datasets by record count
    const topDatasets = datasets
      .sort((a, b) => (b.metadata.recordCount || 0) - (a.metadata.recordCount || 0))
      .slice(0, 5)
      .map(ds => ({
        id: ds.id,
        name: ds.name,
        recordCount: ds.metadata.recordCount || 0
      }));

    return {
      totalDatasets: datasets.length,
      totalRecords,
      totalSize: 0, // Calculate if needed
      activeDatasets,
      recentActivity: {
        last24h: 0, // Implement with timestamp queries
        last7d: 0,
        last30d: 0
      },
      topDatasets
    };
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  /**
   * Log audit event
   */
  private async logAudit(params: {
    datasetId: string;
    recordId?: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'schema_change';
    userId?: string;
    apiKeyId?: string;
    details: any;
  }): Promise<void> {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const auditLog = {
      id: logId,
      datasetId: params.datasetId,
      recordId: params.recordId,
      action: params.action,
      userId: params.userId,
      apiKeyId: params.apiKeyId,
      timestamp: Timestamp.now(),
      details: params.details,
      context: {
        source: 'web' as const
      }
    };

    const logRef = doc(db, DATASET_COLLECTIONS.AUDIT_LOGS, logId);
    await setDoc(logRef, auditLog);
  }

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  /**
   * Generate API key
   */
  async generateApiKey(params: {
    name: string;
    organizationId: string;
    userId: string;
    permissions: ApiKey['permissions'];
    expiresIn?: number; // days
  }): Promise<ApiKey> {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiKeyValue = `sk_${Math.random().toString(36).substr(2, 32)}`;

    const apiKey: ApiKey = {
      id: keyId,
      name: params.name,
      key: apiKeyValue, // In production, hash this
      organizationId: params.organizationId,
      createdBy: params.userId,
      createdAt: Timestamp.now(),
      expiresAt: params.expiresIn 
        ? Timestamp.fromDate(new Date(Date.now() + params.expiresIn * 24 * 60 * 60 * 1000))
        : undefined,
      permissions: params.permissions,
      usage: {
        requestCount: 0
      },
      status: 'active'
    };

    const keyRef = doc(db, DATASET_COLLECTIONS.API_KEYS, keyId);
    await setDoc(keyRef, apiKey);

    return apiKey;
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    const keyRef = doc(db, DATASET_COLLECTIONS.API_KEYS, keyId);
    await updateDoc(keyRef, {
      status: 'revoked'
    });
  }

  /**
   * List API keys
   */
  async listApiKeys(organizationId: string): Promise<ApiKey[]> {
    const q = query(
      collection(db, DATASET_COLLECTIONS.API_KEYS),
      where('organizationId', '==', organizationId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ApiKey);
  }
}

// Export singleton instance
export const datasetService = new DatasetService();
export default datasetService;
