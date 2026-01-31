/**
 * Dashboard Service
 * Provides data aggregation for dashboard widgets
 * Currently uses mock data; will integrate with real API endpoints
 */

import type {
  DashboardData,
  DashboardSummary,
  SalesVsPurchasesDataPoint,
  SalesByProductDataPoint,
  InventoryTrendDataPoint,
  LowStockItem,
  OverdueInvoice,
  Transaction,
} from '../../types/dashboard.types';
import {
  mockDashboardSummary,
  mockSalesVsPurchasesData,
  mockSalesByProductData,
  mockInventoryTrendData,
  mockLowStockItems,
  mockOverdueInvoices,
  mockLatestTransactions,
} from '../../mocks/dashboardMocks';

const SIMULATED_DELAY_MS = 500;

const simulateDelay = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
};

/**
 * Get KPI summary data
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  await simulateDelay();
  return mockDashboardSummary;
};

/**
 * Get sales vs purchases chart data
 */
export const getSalesVsPurchasesData = async (): Promise<SalesVsPurchasesDataPoint[]> => {
  await simulateDelay();
  return mockSalesVsPurchasesData;
};

/**
 * Get sales by product chart data
 */
export const getSalesByProductData = async (): Promise<SalesByProductDataPoint[]> => {
  await simulateDelay();
  return mockSalesByProductData;
};

/**
 * Get inventory trend chart data
 */
export const getInventoryTrendData = async (): Promise<InventoryTrendDataPoint[]> => {
  await simulateDelay();
  return mockInventoryTrendData;
};

/**
 * Get low stock items
 */
export const getLowStockItems = async (): Promise<LowStockItem[]> => {
  await simulateDelay();
  return mockLowStockItems;
};

/**
 * Get overdue invoices
 */
export const getOverdueInvoices = async (): Promise<OverdueInvoice[]> => {
  await simulateDelay();
  return mockOverdueInvoices;
};

/**
 * Get latest transactions
 */
export const getLatestTransactions = async (): Promise<Transaction[]> => {
  await simulateDelay();
  return mockLatestTransactions;
};

/**
 * Get all dashboard data in a single call
 * More efficient for initial load
 */
export const getAllDashboardData = async (): Promise<DashboardData> => {
  await simulateDelay();
  
  return {
    summary: mockDashboardSummary,
    salesVsPurchases: mockSalesVsPurchasesData,
    salesByProduct: mockSalesByProductData,
    inventoryTrend: mockInventoryTrendData,
    lowStockItems: mockLowStockItems,
    overdueInvoices: mockOverdueInvoices,
    latestTransactions: mockLatestTransactions,
  };
};

export default {
  getDashboardSummary,
  getSalesVsPurchasesData,
  getSalesByProductData,
  getInventoryTrendData,
  getLowStockItems,
  getOverdueInvoices,
  getLatestTransactions,
  getAllDashboardData,
};
