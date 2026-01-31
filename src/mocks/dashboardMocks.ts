/**
 * Mock data for dashboard development and testing
 */
import type {
  DashboardSummary,
  SalesVsPurchasesDataPoint,
  SalesByProductDataPoint,
  InventoryTrendDataPoint,
  LowStockItem,
  OverdueInvoice,
  Transaction,
} from '../types/dashboard.types';

export const mockDashboardSummary: DashboardSummary = {
  todaysSales: 245000,
  todaysPurchase: 189000,
  profitLoss: 56000,
  stockValue: 1250000,
  receivable: 320000,
  payable: 185000,
};

export const mockSalesVsPurchasesData: SalesVsPurchasesDataPoint[] = [
  { date: '2024-01-01', sales: 120000, purchases: 95000 },
  { date: '2024-01-02', sales: 145000, purchases: 110000 },
  { date: '2024-01-03', sales: 98000, purchases: 78000 },
  { date: '2024-01-04', sales: 165000, purchases: 120000 },
  { date: '2024-01-05', sales: 189000, purchases: 145000 },
  { date: '2024-01-06', sales: 210000, purchases: 160000 },
  { date: '2024-01-07', sales: 245000, purchases: 189000 },
];

export const mockSalesByProductData: SalesByProductDataPoint[] = [
  { product: 'LPG', sales: 450000, color: '#FF6B35' },
  { product: 'LNG', sales: 320000, color: '#3B82F6' },
  { product: 'CNG', sales: 180000, color: '#10B981' },
  { product: 'Other', sales: 95000, color: '#8B5CF6' },
];

export const mockInventoryTrendData: InventoryTrendDataPoint[] = [
  { month: 'Jan', value: 980000 },
  { month: 'Feb', value: 1020000 },
  { month: 'Mar', value: 1150000 },
  { month: 'Apr', value: 1080000 },
  { month: 'May', value: 1200000 },
  { month: 'Jun', value: 1350000 },
  { month: 'Jul', value: 1280000 },
  { month: 'Aug', value: 1420000 },
  { month: 'Sep', value: 1380000 },
  { month: 'Oct', value: 1500000 },
  { month: 'Nov', value: 1450000 },
  { month: 'Dec', value: 1250000 },
];

export const mockLowStockItems: LowStockItem[] = [
  {
    id: '1',
    itemName: 'LPG Cylinder 11.8kg',
    sku: 'LPG-CYL-118',
    currentStock: 5,
    reorderLevel: 50,
    urgency: 'critical',
  },
  {
    id: '2',
    itemName: 'Gas Regulator Standard',
    sku: 'GAS-REG-STD',
    currentStock: 12,
    reorderLevel: 30,
    urgency: 'critical',
  },
  {
    id: '3',
    itemName: 'LPG Cylinder 45kg',
    sku: 'LPG-CYL-45',
    currentStock: 25,
    reorderLevel: 40,
    urgency: 'warning',
  },
  {
    id: '4',
    itemName: 'Delivery Hose 2m',
    sku: 'DEL-HOSE-2M',
    currentStock: 45,
    reorderLevel: 50,
    urgency: 'low',
  },
  {
    id: '5',
    itemName: 'Safety Valve Set',
    sku: 'SAF-VALVE-01',
    currentStock: 8,
    reorderLevel: 25,
    urgency: 'critical',
  },
];

export const mockOverdueInvoices: OverdueInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0045',
    customerName: 'ABC Gas Distributors',
    amount: 85000,
    dueDate: '2024-01-05',
    daysOverdue: 15,
    status: 'Critical',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0052',
    customerName: 'City Fuel Services',
    amount: 42000,
    dueDate: '2024-01-10',
    daysOverdue: 10,
    status: 'Overdue',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0058',
    customerName: 'Metro Energy Ltd',
    amount: 125000,
    dueDate: '2024-01-12',
    daysOverdue: 8,
    status: 'Overdue',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0061',
    customerName: 'Quick Gas Station',
    amount: 28000,
    dueDate: '2024-01-15',
    daysOverdue: 5,
    status: 'Warning',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-0063',
    customerName: 'Green Energy Co',
    amount: 67000,
    dueDate: '2024-01-17',
    daysOverdue: 3,
    status: 'Warning',
  },
];

export const mockLatestTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN-2024-00125',
    customerName: 'ABC Gas Distributors',
    date: '2024-01-20',
    amount: 45000,
    type: 'Sale',
    status: 'Completed',
  },
  {
    id: '2',
    transactionId: 'TXN-2024-00124',
    customerName: 'Metro Energy Ltd',
    date: '2024-01-20',
    amount: 89000,
    type: 'Sale',
    status: 'Completed',
  },
  {
    id: '3',
    transactionId: 'TXN-2024-00123',
    customerName: 'LPG Suppliers Co',
    date: '2024-01-19',
    amount: 125000,
    type: 'Purchase',
    status: 'Completed',
  },
  {
    id: '4',
    transactionId: 'TXN-2024-00122',
    customerName: 'City Fuel Services',
    date: '2024-01-19',
    amount: 32000,
    type: 'Sale',
    status: 'Pending',
  },
  {
    id: '5',
    transactionId: 'TXN-2024-00121',
    customerName: 'Quick Gas Station',
    date: '2024-01-18',
    amount: 15000,
    type: 'Return',
    status: 'Completed',
  },
  {
    id: '6',
    transactionId: 'TXN-2024-00120',
    customerName: 'Green Energy Co',
    date: '2024-01-18',
    amount: 78000,
    type: 'Payment',
    status: 'Completed',
  },
  {
    id: '7',
    transactionId: 'TXN-2024-00119',
    customerName: 'National Gas Corp',
    date: '2024-01-17',
    amount: 156000,
    type: 'Sale',
    status: 'Completed',
  },
  {
    id: '8',
    transactionId: 'TXN-2024-00118',
    customerName: 'Premium Fuels Ltd',
    date: '2024-01-17',
    amount: 92000,
    type: 'Purchase',
    status: 'Pending',
  },
];

// Aggregate mock data
export const mockDashboardData = {
  summary: mockDashboardSummary,
  salesVsPurchases: mockSalesVsPurchasesData,
  salesByProduct: mockSalesByProductData,
  inventoryTrend: mockInventoryTrendData,
  lowStockItems: mockLowStockItems,
  overdueInvoices: mockOverdueInvoices,
  latestTransactions: mockLatestTransactions,
};
