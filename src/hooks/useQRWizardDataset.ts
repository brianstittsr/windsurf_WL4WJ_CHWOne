/**
 * React Hook for QR Wizard <-> Datasets Admin Integration
 * 
 * Provides easy-to-use functions for integrating QR Wizard with Datasets Admin Platform
 */

import { useState, useCallback } from 'react';
import {
  createDatasetFromQRWizard,
  addParticipantRecord,
  updateParticipantRecord,
  getParticipants,
  searchParticipants,
  recordQRScan,
  getDatasetStats,
  exportParticipantsToCSV
} from '@/services/QRWizardDatasetIntegration';
import { ParticipantDataUpload } from '@/types/qr-tracking-wizard.types';
import { useAuth } from '@/contexts/AuthContext';

export function useQRWizardDataset() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);

  /**
   * Create dataset from participant upload
   */
  const createDataset = useCallback(async (
    programName: string,
    participantData: ParticipantDataUpload,
    standardFields: string[],
    customFields: Array<{ fieldName: string; fieldType?: string; required?: boolean }>
  ) => {
    if (!currentUser) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createDatasetFromQRWizard(
        programName,
        (currentUser as any).organizationId || currentUser.uid,
        currentUser.uid,
        participantData,
        standardFields,
        customFields
      );

      setDatasetId(result.datasetId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dataset';
      setError(errorMessage);
      console.error('Error creating dataset:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Add a single participant
   */
  const addParticipant = useCallback(async (
    targetDatasetId: string,
    participantData: Record<string, any>
  ) => {
    if (!currentUser) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const recordId = await addParticipantRecord(
        targetDatasetId,
        participantData,
        currentUser.uid
      );
      return recordId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add participant';
      setError(errorMessage);
      console.error('Error adding participant:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Update participant data
   */
  const updateParticipant = useCallback(async (
    recordId: string,
    updates: Record<string, any>
  ) => {
    if (!currentUser) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await updateParticipantRecord(recordId, updates, currentUser.uid);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update participant';
      setError(errorMessage);
      console.error('Error updating participant:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Get all participants
   */
  const fetchParticipants = useCallback(async (
    targetDatasetId: string,
    page: number = 1,
    pageSize: number = 100
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getParticipants(targetDatasetId, page, pageSize);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch participants';
      setError(errorMessage);
      console.error('Error fetching participants:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search participants
   */
  const searchForParticipants = useCallback(async (
    targetDatasetId: string,
    query: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchParticipants(targetDatasetId, query);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search participants';
      setError(errorMessage);
      console.error('Error searching participants:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Record a QR code scan
   */
  const recordScan = useCallback(async (
    targetDatasetId: string,
    participantId: string,
    scanData: {
      location?: string;
      timestamp: Date;
      scannedBy?: string;
      notes?: string;
    }
  ) => {
    if (!currentUser) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await recordQRScan(targetDatasetId, participantId, scanData, currentUser.uid);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record scan';
      setError(errorMessage);
      console.error('Error recording scan:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Get dataset statistics
   */
  const fetchStats = useCallback(async (targetDatasetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const stats = await getDatasetStats(targetDatasetId);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export participants to CSV
   */
  const exportToCSV = useCallback(async (targetDatasetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const csv = await exportParticipantsToCSV(targetDatasetId);
      
      // Create download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participants_${targetDatasetId}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export';
      setError(errorMessage);
      console.error('Error exporting:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    datasetId,
    
    // Actions
    createDataset,
    addParticipant,
    updateParticipant,
    fetchParticipants,
    searchForParticipants,
    recordScan,
    fetchStats,
    exportToCSV,
    
    // Helpers
    clearError: () => setError(null),
    setDatasetId
  };
}
