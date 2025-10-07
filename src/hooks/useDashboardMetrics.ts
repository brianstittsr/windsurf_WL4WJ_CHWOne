import { useState, useEffect } from 'react';
import { OrganizationMetrics } from '@/types/firebase/schema';
import { analyticsService } from '@/services/analyticsService';

export function useDashboardMetrics(organization: 'general' | 'region5' | 'wl4wj') {
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getOrganizationMetrics(organization);
        if (mounted) {
          setMetrics(data);
        }
      } catch (err) {
        if (mounted) {
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

    fetchMetrics();

    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
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
