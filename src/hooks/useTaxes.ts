import { useState, useEffect, useCallback } from 'react';
import { getTaxesApi, Tax, TaxType } from '../generated/api/client';

// Type for tax data from API or localStorage
interface TaxData {
  id: number;
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  description?: string;
  companyId?: number;
  companyName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to map tax data to Tax type
const mapToTax = (t: TaxData, useDefaultActive = false): Tax => ({
  id: t.id,
  name: t.name,
  code: t.code,
  rate: t.rate,
  type: t.type,
  description: t.description,
  companyId: t.companyId,
  companyName: t.companyName,
  isActive: useDefaultActive ? (t.isActive ?? true) : (t.isActive ?? false),
  createdAt: t.createdAt ?? '',
  updatedAt: t.updatedAt ?? '',
});

export const useTaxes = (activeOnly: boolean = true) => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTaxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const taxesApi = getTaxesApi();
      const response = await taxesApi.getAll({ isActive: activeOnly });
      const data = response?.data || [];

      const mappedTaxes: Tax[] = Array.isArray(data)
        ? data.map((t: TaxData) => mapToTax(t))
        : [];

      setTaxes(mappedTaxes);
    } catch (err: unknown) {
      console.error('Error loading taxes:', err);
      setError('Failed to load taxes');
      setTaxes([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadTaxes();
  }, [loadTaxes]);

  const refetch = useCallback(() => {
    loadTaxes();
  }, [loadTaxes]);

  return { taxes, loading, error, refetch };
};
