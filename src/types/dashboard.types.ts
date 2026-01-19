/**
 * Dashboard type definitions
 */

// KPI Summary data
export interface DashboardSummary {
  todaysSales: number;
  todaysPurchase: number;
  profitLoss: number;
  stockValue: number;
  receivable: number;
  payable: number;
}

// Chart data types
export interface SalesVsPurchasesDataPoint {
  date: string;
  sales: number;
  purchases: number;
}

export interface SalesByProductDataPoint {
  product: string;
  sales: number;
  color?: string;
}

export interface InventoryTrendDataPoint {
  month: string;
  value: number;
}

// Table data types
export interface LowStockItem {
  id: string;
  itemName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  urgency: 'critical' | 'warning' | 'low';
}

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: 'Overdue' | 'Critical' | 'Warning';
}

export interface Transaction {
  id: string;
  transactionId: string;
  customerName: string;
  date: string;
  amount: number;
  type: 'Sale' | 'Purchase' | 'Return' | 'Payment';
  status: 'Completed' | 'Pending' | 'Cancelled';
}

// Dashboard data aggregate
export interface DashboardData {
  summary: DashboardSummary;
  salesVsPurchases: SalesVsPurchasesDataPoint[];
  salesByProduct: SalesByProductDataPoint[];
  inventoryTrend: InventoryTrendDataPoint[];
  lowStockItems: LowStockItem[];
  overdueInvoices: OverdueInvoice[];
  latestTransactions: Transaction[];
}

// KPI Card props
export interface KPICardData {
  title: string;
  value: number;
  icon: React.ReactNode;
  backgroundColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
