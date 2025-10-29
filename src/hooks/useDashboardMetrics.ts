import { useState, useEffect } from 'react';
import { OrganizationMetrics } from '@/types/firebase/schema';
import { analyticsService } from '@/services/analyticsService';

export function useDashboardMetrics(organization: 'general' | 'region5' | 'wl4wj') {
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(
    analyticsService.getDefaultOrganizationMetrics(organization)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        setError(null);
        
        // DATA OPERATIONS DISABLED - Fetch returns immediately with mock data
        const data = await analyticsService.getOrganizationMetrics(organization);
        
        if (mounted) {
          setMetrics(data);
        }
      } catch (err) {
        if (mounted) {
          console.warn('Metrics fetch failed, using defaults:', err);
          setError(err instanceof Error ? err.message : 'Failed to load metrics');
          // Set default metrics on error
          setMetrics(analyticsService.getDefaultOrganizationMetrics(organization));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // DATA OPERATIONS DISABLED - Only fetch once, no auto-refresh
    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, [organization]);

  const refreshMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getRealTimeMetrics(organization);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh metrics');
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics
  };
}
