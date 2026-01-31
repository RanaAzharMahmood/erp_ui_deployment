import { useState, useEffect, useCallback } from 'react';
import { getBankAccountsApi, BankAccount, BankAccountFilters } from '../generated/api/client';

export type { BankAccount } from '../generated/api/client';

export interface UseBankAccountsOptions {
  activeOnly?: boolean;
  companyId?: number;
}

// Type for API bank account response
interface ApiBankAccountResponse {
  id?: number;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  branchCode?: string;
  swiftCode?: string;
  iban?: string;
  accountType?: string;
  currency?: string;
  openingBalance?: number;
  currentBalance?: number;
  companyId?: number;
  companyName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Type for API response wrapper
interface BankAccountsApiResponse {
  data?: ApiBankAccountResponse[] | { data?: ApiBankAccountResponse[] };
}

// Helper function to map bank account data
const mapToBankAccount = (ba: ApiBankAccountResponse, useDefaultActive = false): BankAccount => ({
  id: ba.id ?? 0,
  accountName: ba.accountName ?? '',
  accountNumber: ba.accountNumber ?? '',
  bankName: ba.bankName ?? '',
  branchName: ba.branchName,
  branchCode: ba.branchCode,
  swiftCode: ba.swiftCode,
  iban: ba.iban,
  accountType: (ba.accountType as 'savings' | 'current' | 'checking' | undefined) ?? 'current',
  currency: ba.currency || '',
  openingBalance: ba.openingBalance || 0,
  currentBalance: ba.currentBalance || 0,
  companyId: ba.companyId,
  companyName: ba.companyName || '',
  isActive: useDefaultActive ? (ba.isActive ?? true) : (ba.isActive ?? false),
  createdAt: ba.createdAt || '',
  updatedAt: ba.updatedAt || '',
});

export const useBankAccounts = (options: UseBankAccountsOptions = {}) => {
  const { activeOnly = true, companyId } = options;
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBankAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bankAccountsApi = getBankAccountsApi();
      const filters: BankAccountFilters = {};
      if (activeOnly) {
        filters.isActive = true;
      }
      if (companyId) {
        filters.companyId = companyId;
      }
      const response = await bankAccountsApi.getAll(filters) as BankAccountsApiResponse;
      const responseData = response?.data;
      const data: ApiBankAccountResponse[] = Array.isArray(responseData)
        ? responseData
        : (responseData as { data?: ApiBankAccountResponse[] })?.data || [];

      const mappedBankAccounts: BankAccount[] = Array.isArray(data)
        ? data.map((ba: ApiBankAccountResponse) => mapToBankAccount(ba))
        : [];

      setBankAccounts(mappedBankAccounts);
    } catch (err: unknown) {
      console.error('Error loading bank accounts:', err);
      setError('Failed to load bank accounts');
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, companyId]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const refetch = useCallback(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  return { bankAccounts, loading, error, refetch };
};
