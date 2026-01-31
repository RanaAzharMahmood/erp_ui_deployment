import { useState, useEffect, useCallback } from 'react';
import { getVendorsApi, Vendor } from '../generated/api/client';

// Type for vendor data from API or localStorage
interface VendorData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  paymentTerms?: string;
  bankName?: string;
  bankAccountNo?: string;
  notes?: string;
  companyId?: number;
  companyName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to map vendor data to Vendor type
const mapToVendor = (v: VendorData, useDefaultActive = false): Vendor => ({
  id: v.id,
  name: v.name,
  email: v.email,
  phone: v.phone,
  address: v.address,
  city: v.city,
  state: v.state,
  country: v.country,
  postalCode: v.postalCode,
  taxId: v.taxId,
  paymentTerms: v.paymentTerms,
  bankName: v.bankName,
  bankAccountNo: v.bankAccountNo,
  notes: v.notes,
  companyId: v.companyId,
  companyName: v.companyName,
  isActive: useDefaultActive ? (v.isActive ?? true) : (v.isActive ?? false),
  createdAt: v.createdAt ?? '',
  updatedAt: v.updatedAt ?? '',
});

export const useVendors = (activeOnly: boolean = true) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vendorsApi = getVendorsApi();
      const response = await vendorsApi.getAll({ isActive: activeOnly });
      const data = response?.data || [];

      const mappedVendors: Vendor[] = Array.isArray(data)
        ? data.map((v: VendorData) => mapToVendor(v))
        : [];

      setVendors(mappedVendors);
    } catch (err: unknown) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const refetch = useCallback(() => {
    loadVendors();
  }, [loadVendors]);

  return { vendors, loading, error, refetch };
};
