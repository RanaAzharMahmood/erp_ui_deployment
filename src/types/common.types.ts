// Common types used across the application

export type Status = 'Active' | 'Prospect' | 'Inactive';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Company extends BaseEntity {
  companyName: string;
  industry: string;
  user: string;
  ntnNumber: string;
  website?: string;
  salesTaxNumber?: string;
  companyEmail: string;
  address?: string;
  status: Status;
  subscriptionEnd: string;
  logo?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  cnic: string;
  contactNumber: string;
  principalActivity: string;
  companyName: string;
  ntnNumber: string;
  salesTaxNumber: string;
  taxOffice: string;
  address: string;
  status: Status;
}

export interface Vendor extends BaseEntity {
  name: string;
  email: string;
  cnic: string;
  contactNumber: string;
  principalActivity: string;
  companyName: string;
  ntnNumber: string;
  salesTaxNumber: string;
  taxOffice: string;
  address: string;
  status: Status;
}

export interface Tax extends BaseEntity {
  taxId: string;
  taxName: string;
  taxPercentage: number | string;
  taxDate?: string;
  note?: string;
  companyId?: number;
  companyName?: string;
  isActive: boolean;
  status?: Status;
}

export interface Category extends BaseEntity {
  categoryName: string;
  companyId?: number;
  companyName?: string;
  description?: string;
  isActive: boolean;
}

export interface Item extends BaseEntity {
  itemName: string;
  categoryId?: number;
  categoryName?: string;
  companyId?: number;
  companyName?: string;
  unit?: string;
  buyingPrice?: number;
  sellingPrice?: number;
  quantity?: number;
  description?: string;
  isActive: boolean;
}

export interface BankAccount extends BaseEntity {
  companyId?: number;
  companyName: string;
  bankName: string;
  branchName: string;
  accountTitle: string;
  accountNumber: string;
  date: string;
  details: string;
  status: 'Active' | 'Inactive';
}

export interface BankDeposit extends BaseEntity {
  companyId?: number;
  companyName: string;
  date: string;
  bankAccount: string;
  depositNumber: string;
  totalAmount: number;
  status: 'Submit' | 'Reject';
}

export interface Expense extends BaseEntity {
  date: string;
  companyId?: number;
  companyName: string;
  payFor: string;
  grossAmount: number;
  netAmount: number;
  status: 'Active' | 'Paid' | 'Overdue' | 'Pending';
}

export interface JournalEntry extends BaseEntity {
  date: string;
  accountName: string;
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
  companyId?: number;
  companyName: string;
  reference: string;
  debit: number;
  credit: number;
  status: 'Approved' | 'Draft' | 'Pending';
}

export interface OtherPayment extends BaseEntity {
  companyId?: number;
  companyName: string;
  number: string;
  date: string;
  reference: string;
  contactName: string;
  totalAmount: number;
  status: 'Submit' | 'Draft' | 'Reject';
}

export interface UserRole {
  id: number;
  name: string;
}

export interface UserCompanyAccess {
  companyId: number;
  companyName: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  cnic?: string;
  phone?: string;
  about?: string;
  imageUrl?: string;
  status: 'Active' | 'Inactive';
  roleId?: number;
  roleName?: string;
  companyAccess: UserCompanyAccess[];
}

// Form data types (without id and timestamps)
export type CompanyFormData = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type VendorFormData = Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;
export type TaxFormData = Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>;
export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryFormData = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type BankAccountFormData = Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>;
export type BankDepositFormData = Omit<BankDeposit, 'id' | 'createdAt' | 'updatedAt'>;
export type ExpenseFormData = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type JournalEntryFormData = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type OtherPaymentFormData = Omit<OtherPayment, 'id' | 'createdAt' | 'updatedAt'>;

// Filter and search types
export interface FilterOptions {
  status?: Status | 'All';
  company?: string;
  searchTerm?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
