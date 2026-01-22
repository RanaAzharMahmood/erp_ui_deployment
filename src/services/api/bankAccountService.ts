/**
 * Bank Account API Service
 * Provides CRUD operations for bank accounts
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type AccountType = 'checking' | 'savings' | 'current';

export interface BankAccount {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  branchCode?: string;
  swiftCode?: string;
  iban?: string;
  accountType: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  companyId?: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  branchCode?: string;
  swiftCode?: string;
  iban?: string;
  accountType: AccountType;
  currency?: string;
  openingBalance?: number;
  currentBalance?: number;
  companyId?: number;
}

export interface UpdateBankAccountRequest {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  branchCode?: string;
  swiftCode?: string;
  iban?: string;
  accountType?: AccountType;
  currency?: string;
  openingBalance?: number;
  currentBalance?: number;
  companyId?: number;
  isActive?: boolean;
}

export interface BankAccountFilters {
  isActive?: boolean;
  accountType?: AccountType;
  companyId?: number;
  bankName?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class BankAccountService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/v1/api/bank-accounts`;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private buildQueryString(filters?: BankAccountFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    if (filters.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    if (filters.accountType) {
      params.append('accountType', filters.accountType);
    }
    if (filters.companyId) {
      params.append('companyId', String(filters.companyId));
    }
    if (filters.bankName) {
      params.append('bankName', filters.bankName);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getAll(filters?: BankAccountFilters): Promise<ApiResponse<PaginatedResponse<BankAccount>>> {
    const queryString = this.buildQueryString(filters);
    const response = await fetch(`${this.baseUrl}${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getById(id: number): Promise<ApiResponse<BankAccount>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async create(data: CreateBankAccountRequest): Promise<ApiResponse<BankAccount>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async update(id: number, data: UpdateBankAccountRequest): Promise<ApiResponse<BankAccount>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const bankAccountService = new BankAccountService();
export default bankAccountService;
