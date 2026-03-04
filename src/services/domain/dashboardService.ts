/**
 * Dashboard Service
 * Provides data aggregation for dashboard widgets via real API
 */

import type { DashboardData } from '../../types/dashboard.types';
import { getDashboardApi } from '../../generated/api/client';

/**
 * Get all dashboard data in a single call
 */
export const getAllDashboardData = async (companyId?: number): Promise<DashboardData> => {
  const api = getDashboardApi();
  const response = await api.getAll(companyId);
  return response.data as DashboardData;
};

export default {
  getAllDashboardData,
};
