/**
 * Shared types for Invoice and Return pages
 */

// =============================================================================
// Line Item Types
// =============================================================================

export interface LineItem {
  id: string;
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type LineItemField = keyof LineItem;

// =============================================================================
// Entity Reference Types (for dropdowns)
// =============================================================================

export interface CompanyOption {
  id: number;
  name: string;
}

export interface CustomerOption {
  id: string;
  name: string;
}

export interface VendorOption {
  id: string;
  name: string;
}

export interface TaxOption {
  id: string;
  name: string;
  percentage: number;
}

export interface ItemOption {
  id: string;
  name: string;
  rate: number;
}

export interface SalesInvoiceOption {
  id: string;
  invoiceNumber: string;
  customerId: string;
}

export interface PurchaseInvoiceOption {
  id: string;
  billNumber: string;
  vendorId: string;
}

// =============================================================================
// Raw Data Types (from API)
// =============================================================================

export interface RawCompanyData {
  id: number;
  companyName: string;
  [key: string]: unknown;
}

export interface RawCustomerData {
  id: string;
  customerName?: string;
  name?: string;
  [key: string]: unknown;
}

export interface RawVendorData {
  id: string;
  vendorName?: string;
  name?: string;
  [key: string]: unknown;
}

export interface RawTaxData {
  id: string;
  taxName: string;
  taxPercentage: number;
  [key: string]: unknown;
}

export interface RawInventoryItemData {
  id: string;
  itemName?: string;
  name?: string;
  salePrice?: number;
  purchasePrice?: number;
  rate?: number;
  [key: string]: unknown;
}

export interface RawSalesInvoiceData {
  id?: string;
  invoiceNumber: string;
  customerId: string;
  companyId?: number | '';
  companyName?: string;
  customerName?: string;
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  status: InvoiceStatus;
  taxId?: string;
  paidAmount?: number;
  discount?: number;
  lineItems?: LineItem[];
  receiptImage?: string;
  grossAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RawPurchaseInvoiceData {
  id: string;
  billNumber: string;
  vendorId: string;
  companyId?: number | '';
  companyName?: string;
  vendorName?: string;
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  status: InvoiceStatus;
  taxId?: string;
  paidAmount?: number;
  discount?: number;
  lineItems?: LineItem[];
  receiptImage?: string;
  grossAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RawSalesReturnData {
  id: string;
  returnNumber: string;
  customerId: string;
  companyId?: number | '';
  companyName?: string;
  customerName?: string;
  originalInvoice?: string;
  date: string;
  returnReason?: string;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  status: ReturnStatus;
  taxId?: string;
  refundAmount?: number;
  lineItems?: LineItem[];
  receiptImage?: string;
  grossAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RawPurchaseReturnData {
  id: string;
  billNumber: string;
  vendorId: string;
  companyId?: number | '';
  companyName?: string;
  vendorName?: string;
  originalInvoice?: string;
  date: string;
  returnReason?: string;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  status: ReturnStatus;
  taxId?: string;
  refundAmount?: number;
  lineItems?: LineItem[];
  receiptImage?: string;
  grossAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// =============================================================================
// Form Data Types
// =============================================================================

export type InvoiceStatus = 'Paid' | 'Overdue' | 'Pending';
export type ReturnStatus = 'Pending' | 'Approved' | 'Rejected';

export interface SalesInvoiceFormData {
  companyId: number | '';
  customerId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  paymentMethod: string;
  accountNumber: string;
  remarks: string;
  status: InvoiceStatus;
  taxId: string;
  paidAmount: number;
  discount: number;
}

export interface PurchaseInvoiceFormData {
  companyId: number | '';
  vendorId: string;
  billNumber: string;
  date: string;
  dueDate: string;
  paymentMethod: string;
  accountNumber: string;
  remarks: string;
  status: InvoiceStatus;
  taxId: string;
  paidAmount: number;
  discount: number;
}

export interface SalesReturnFormData {
  companyId: number | '';
  customerId: string;
  returnNumber: string;
  originalInvoice: string;
  date: string;
  returnReason: string;
  paymentMethod: string;
  accountNumber: string;
  remarks: string;
  status: ReturnStatus;
  taxId: string;
  refundAmount: number;
}

export interface PurchaseReturnFormData {
  companyId: number | '';
  vendorId: string;
  billNumber: string;
  originalInvoice: string;
  date: string;
  returnReason: string;
  paymentMethod: string;
  accountNumber: string;
  remarks: string;
  status: ReturnStatus;
  taxId: string;
  refundAmount: number;
}

// =============================================================================
// Form Field Types (for dynamic form handling)
// =============================================================================

export type SalesInvoiceFormField = keyof SalesInvoiceFormData;
export type PurchaseInvoiceFormField = keyof PurchaseInvoiceFormData;
export type SalesReturnFormField = keyof SalesReturnFormData;
export type PurchaseReturnFormField = keyof PurchaseReturnFormData;

// Union type for select change values
export type SelectChangeValue = string | number;
