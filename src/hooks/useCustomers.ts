import { useState, useEffect, useCallback } from 'react';
import { customerApi, CustomerData } from '../services/customerApi';

// Type for API customer response
interface ApiCustomerResponse {
  id?: number;
  name?: string;
  email?: string;
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
  companyId?: number;
  companyName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to map customer data
const mapToCustomer = (c: ApiCustomerResponse, useDefaultActive = false): CustomerData => ({
  id: c.id ?? 0,
  name: c.name ?? '',
  email: c.email || '',
  phone: c.phone,
  address: c.address,
  city: c.city,
  state: c.state,
  country: c.country,
  postalCode: c.postalCode,
  taxId: c.taxId,
  creditLimit: c.creditLimit,
  paymentTerms: c.paymentTerms,
  notes: c.notes,
  companyId: c.companyId ?? 0,
  companyName: c.companyName,
  isActive: useDefaultActive ? (c.isActive ?? true) : (c.isActive ?? false),
  createdAt: c.createdAt || '',
  updatedAt: c.updatedAt || '',
});

export const useCustomers = (activeOnly: boolean = true) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.getCustomers({ isActive: activeOnly });
      const data: ApiCustomerResponse[] = response?.data?.data || [];

      const mappedCustomers: CustomerData[] = Array.isArray(data)
        ? data.map((c: ApiCustomerResponse) => mapToCustomer(c))
        : [];

      setCustomers(mappedCustomers);
    } catch (err: unknown) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const refetch = useCallback(() => {
    loadCustomers();
  }, [loadCustomers]);

  return { customers, loading, error, refetch };
};
