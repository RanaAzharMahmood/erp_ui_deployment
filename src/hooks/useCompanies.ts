import { useState, useEffect, useCallback } from 'react';
import { getCompaniesApi } from '../generated/api/client';

export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  logoUrl?: string;
  ntnNumber?: string;
  salesTaxRegistrationNo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Type for API company response
interface ApiCompanyResponse {
  id?: number;
  name?: string;
  companyName?: string;
  address?: string;
  city?: string;
  phone?: string;
  logoUrl?: string;
  ntnNumber?: string;
  salesTaxRegistrationNo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Type for API response wrapper
interface CompaniesApiResponse {
  data?: ApiCompanyResponse[] | { data?: ApiCompanyResponse[] };
}

// Helper function to map company data
const mapToCompany = (c: ApiCompanyResponse, useDefaultActive = false): Company => ({
  id: c.id ?? 0,
  name: c.name || c.companyName || '',
  address: c.address,
  city: c.city,
  phone: c.phone,
  logoUrl: c.logoUrl,
  ntnNumber: c.ntnNumber,
  salesTaxRegistrationNo: c.salesTaxRegistrationNo,
  isActive: useDefaultActive ? (c.isActive ?? true) : (c.isActive ?? false),
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export const useCompanies = (activeOnly: boolean = true) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const companiesApi = getCompaniesApi();
      const response = await companiesApi.v1ApiCompaniesGet(activeOnly) as CompaniesApiResponse;
      const responseData = response?.data;
      const data: ApiCompanyResponse[] = Array.isArray(responseData)
        ? responseData
        : (responseData as { data?: ApiCompanyResponse[] })?.data || [];

      const mappedCompanies: Company[] = Array.isArray(data)
        ? data.map((c: ApiCompanyResponse) => mapToCompany(c))
        : [];

      setCompanies(mappedCompanies);
    } catch (err: unknown) {
      console.error('Error loading companies:', err);
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const refetch = useCallback(() => {
    loadCompanies();
  }, [loadCompanies]);

  return { companies, loading, error, refetch };
};
