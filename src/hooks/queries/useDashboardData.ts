/**
 * Dashboard Data Hook
 * Manages loading, error, and data states for dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '../../types/dashboard.types';
import { getAllDashboardData } from '../../services/domain/dashboardService';

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dashboardData = await getAllDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
};

export default useDashboardData;
