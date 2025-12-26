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
  taxPercentage: string;
  taxDate?: string;
  note?: string;
  status: Status;
}

// Form data types (without id and timestamps)
export type CompanyFormData = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type VendorFormData = Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;
export type TaxFormData = Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>;

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
