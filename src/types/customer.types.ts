// Customer types aligned with backend API model

export type CustomerStatus = 'Active' | 'Inactive';

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  creditLimit: number | string;
  paymentTerms: string;
  notes: string;
  companyId: number | string;
  status: CustomerStatus;
}

export interface Customer extends CustomerFormData {
  id: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export const initialCustomerFormState: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  taxId: '',
  creditLimit: '',
  paymentTerms: '',
  notes: '',
  companyId: '',
  status: 'Active',
};

export const CUSTOMER_STATUS_OPTIONS: CustomerStatus[] = ['Active', 'Inactive'];

// Re-export API types from customerApi service for consistency
import type { CustomerData as CustomerApiData } from '../services/customerApi';
export type { CustomerApiData };

// Transform API data to form data
export const apiToFormData = (apiData: CustomerApiData): CustomerFormData => ({
  name: apiData.name || '',
  email: apiData.email || '',
  phone: apiData.phone || '',
  address: apiData.address || '',
  city: apiData.city || '',
  state: apiData.state || '',
  country: apiData.country || '',
  postalCode: apiData.postalCode || '',
  taxId: apiData.taxId || '',
  creditLimit: apiData.creditLimit?.toString() || '',
  paymentTerms: apiData.paymentTerms || '',
  notes: apiData.notes || '',
  companyId: apiData.companyId?.toString() || '',
  status: apiData.isActive ? 'Active' : 'Inactive',
});

// Transform form data to API request
export const formDataToApiRequest = (formData: CustomerFormData): {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  companyId: number;
  isActive?: boolean;
} => ({
  name: formData.name,
  email: formData.email,
  phone: formData.phone || undefined,
  address: formData.address || undefined,
  city: formData.city || undefined,
  state: formData.state || undefined,
  country: formData.country || undefined,
  postalCode: formData.postalCode || undefined,
  taxId: formData.taxId || undefined,
  creditLimit: formData.creditLimit ? Number(formData.creditLimit) : undefined,
  paymentTerms: formData.paymentTerms || undefined,
  notes: formData.notes || undefined,
  companyId: Number(formData.companyId),
  isActive: formData.status === 'Active',
});
