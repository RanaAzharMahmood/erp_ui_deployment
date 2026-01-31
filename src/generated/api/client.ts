import { Configuration, UsersApi, CategoriesApi, AuthApi, CompaniesApi, ItemsApi, PartiesApi } from './';

// Bank Account Types
export type BankAccountType = 'checking' | 'savings' | 'current';

export interface BankAccount {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  branchCode?: string;
  swiftCode?: string;
  iban?: string;
  accountType: BankAccountType;
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
  accountType: BankAccountType;
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
  accountType?: BankAccountType;
  currency?: string;
  openingBalance?: number;
  currentBalance?: number;
  companyId?: number;
  isActive?: boolean;
}

export interface BankAccountApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BankAccountPaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface BankAccountFilters {
  isActive?: boolean;
  accountType?: BankAccountType;
  companyId?: number;
  bankName?: string;
}

// Tax Types
export type TaxType = 'inclusive' | 'exclusive';

export interface Tax {
  id: number;
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  description?: string;
  companyId?: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxRequest {
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  description?: string;
  companyId?: number;
}

export interface UpdateTaxRequest {
  name?: string;
  code?: string;
  rate?: number;
  type?: TaxType;
  description?: string;
  companyId?: number;
  isActive?: boolean;
}

export interface TaxApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TaxFilters {
  isActive?: boolean;
  companyId?: number;
  type?: TaxType;
}

// Chart of Account Types
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface ChartOfAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentId?: number | null;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  isSystemAccount: boolean;
  companyId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: ChartOfAccount;
  children?: ChartOfAccount[];
}

export interface CreateChartOfAccountRequest {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentId?: number;
  description?: string;
  openingBalance?: number;
  currentBalance?: number;
  isSystemAccount?: boolean;
  companyId: number;
}

export interface UpdateChartOfAccountRequest {
  accountCode?: string;
  accountName?: string;
  accountType?: AccountType;
  parentId?: number | null;
  description?: string;
  openingBalance?: number;
  currentBalance?: number;
  isSystemAccount?: boolean;
  isActive?: boolean;
}

export interface ChartOfAccountApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ChartOfAccountFilters {
  accountType?: AccountType;
  companyId?: number;
  isActive?: boolean;
}

// Custom fetch wrapper that includes credentials for httpOnly cookie authentication
// Falls back to localStorage token for backward compatibility during migration
const fetchWithCredentials: typeof fetch = (url: string | Request | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers || {});

  // Fallback: Add Authorization header from localStorage if available
  // This provides backward compatibility during migration to cookie-based auth
  const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const updatedInit: RequestInit = {
    ...init,
    headers,
    // Include credentials to send httpOnly cookies
    credentials: 'include',
  };

  return fetch(url, updatedInit);
};

// Custom fetch for auth endpoints (includes credentials for cookie operations)
const fetchWithCredentialsOnly: typeof fetch = (url: string | Request | URL, init?: RequestInit) => {
  const updatedInit: RequestInit = {
    ...init,
    // Include credentials to receive/send httpOnly cookies
    credentials: 'include',
  };

  return fetch(url, updatedInit);
};

const getApiConfig = () => {
  return new Configuration({
    basePath: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000',
  });
};

// Bank Accounts API Client
export class BankAccountsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: BankAccountFilters): Promise<BankAccountApiResponse<BankAccountPaginatedResponse<BankAccount>>> {
    const queryParams = new URLSearchParams();
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.accountType) queryParams.append('accountType', filters.accountType);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.bankName) queryParams.append('bankName', filters.bankName);

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/bank-accounts${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bank accounts');
    }

    return response.json();
  }

  async getById(id: number): Promise<BankAccountApiResponse<BankAccount>> {
    const url = `${this.basePath}/v1/api/bank-accounts/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bank account');
    }

    return response.json();
  }

  async create(data: CreateBankAccountRequest): Promise<BankAccountApiResponse<BankAccount>> {
    const url = `${this.basePath}/v1/api/bank-accounts`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create bank account');
    }

    return response.json();
  }

  async update(id: number, data: UpdateBankAccountRequest): Promise<BankAccountApiResponse<BankAccount>> {
    const url = `${this.basePath}/v1/api/bank-accounts/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update bank account');
    }

    return response.json();
  }

  async delete(id: number): Promise<BankAccountApiResponse<null>> {
    const url = `${this.basePath}/v1/api/bank-accounts/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete bank account');
    }

    return response.json();
  }
}

// Chart of Accounts API Client
export class ChartOfAccountsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAllAccounts(filters?: ChartOfAccountFilters): Promise<ChartOfAccountApiResponse<ChartOfAccount[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.accountType) queryParams.append('accountType', filters.accountType);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/chart-of-accounts${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chart of accounts');
    }

    return response.json();
  }

  async getAccountById(id: number, includeRelations?: boolean): Promise<ChartOfAccountApiResponse<ChartOfAccount>> {
    const queryParams = includeRelations ? `?includeRelations=true` : '';
    const url = `${this.basePath}/v1/api/chart-of-accounts/${id}${queryParams}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chart of account');
    }

    return response.json();
  }

  async getAccountHierarchy(companyId: number, accountType?: AccountType): Promise<ChartOfAccountApiResponse<ChartOfAccount[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('companyId', String(companyId));
    if (accountType) queryParams.append('accountType', accountType);

    const url = `${this.basePath}/v1/api/chart-of-accounts/hierarchy?${queryParams.toString()}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch account hierarchy');
    }

    return response.json();
  }

  async createAccount(data: CreateChartOfAccountRequest): Promise<ChartOfAccountApiResponse<ChartOfAccount>> {
    const url = `${this.basePath}/v1/api/chart-of-accounts`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create chart of account');
    }

    return response.json();
  }

  async updateAccount(id: number, data: UpdateChartOfAccountRequest): Promise<ChartOfAccountApiResponse<ChartOfAccount>> {
    const url = `${this.basePath}/v1/api/chart-of-accounts/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update chart of account');
    }

    return response.json();
  }

  async deleteAccount(id: number): Promise<ChartOfAccountApiResponse<null>> {
    const url = `${this.basePath}/v1/api/chart-of-accounts/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete chart of account');
    }

    return response.json();
  }
}

// Customers API Types
export interface CustomerClientData {
  id: number;
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
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerClientRequest {
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
}

export interface UpdateCustomerClientRequest {
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
  isActive?: boolean;
}

export interface CustomerClientApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CustomerPaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface CustomerClientFilters {
  isActive?: boolean;
  companyId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// Customers API Client
export class CustomersApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: CustomerClientFilters): Promise<CustomerClientApiResponse<CustomerPaginatedResponse<CustomerClientData>>> {
    const queryParams = new URLSearchParams();
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/customers${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customers');
    }

    return response.json();
  }

  async getById(id: number): Promise<CustomerClientApiResponse<CustomerClientData>> {
    const url = `${this.basePath}/v1/api/customers/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer');
    }

    return response.json();
  }

  async create(data: CreateCustomerClientRequest): Promise<CustomerClientApiResponse<CustomerClientData>> {
    const url = `${this.basePath}/v1/api/customers`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create customer');
    }

    return response.json();
  }

  async update(id: number, data: UpdateCustomerClientRequest): Promise<CustomerClientApiResponse<CustomerClientData>> {
    const url = `${this.basePath}/v1/api/customers/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update customer');
    }

    return response.json();
  }

  async delete(id: number): Promise<CustomerClientApiResponse<null>> {
    const url = `${this.basePath}/v1/api/customers/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete customer');
    }

    return response.json();
  }
}

// Vendors API Types
export interface Vendor {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorRequest {
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
}

export interface UpdateVendorRequest {
  name?: string;
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
  isActive?: boolean;
}

export interface VendorApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface VendorPaginatedResponse {
  data: Vendor[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface VendorFilters {
  isActive?: boolean;
  companyId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

// Vendors API Client
export class VendorsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: VendorFilters): Promise<VendorApiResponse<Vendor[]> & { pagination: { total: number; limit: number; offset: number } }> {
    const queryParams = new URLSearchParams();
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/vendors${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vendors');
    }

    return response.json();
  }

  async getById(id: number): Promise<VendorApiResponse<Vendor>> {
    const url = `${this.basePath}/v1/api/vendors/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vendor');
    }

    return response.json();
  }

  async create(data: CreateVendorRequest): Promise<VendorApiResponse<Vendor>> {
    const url = `${this.basePath}/v1/api/vendors`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create vendor');
    }

    return response.json();
  }

  async update(id: number, data: UpdateVendorRequest): Promise<VendorApiResponse<Vendor>> {
    const url = `${this.basePath}/v1/api/vendors/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update vendor');
    }

    return response.json();
  }

  async delete(id: number): Promise<VendorApiResponse<null>> {
    const url = `${this.basePath}/v1/api/vendors/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete vendor');
    }

    return response.json();
  }
}

// Journal Entry Types
export type JournalEntryStatus = 'draft' | 'posted' | 'void';

export interface JournalEntryLine {
  id?: number;
  journalEntryId?: number;
  accountId: number;
  accountName?: string;
  accountCode?: string;
  description?: string;
  debit: number;
  credit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  date: string;
  reference?: string;
  description?: string;
  totalDebit: number;
  totalCredit: number;
  status: JournalEntryStatus;
  postedAt?: string;
  postedBy?: number;
  postedByName?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  lines?: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryLineRequest {
  accountId: number;
  description?: string;
  debit: number;
  credit: number;
}

export interface CreateJournalEntryRequest {
  date: string;
  reference?: string;
  description?: string;
  companyId: number;
  lines: CreateJournalEntryLineRequest[];
}

export interface UpdateJournalEntryRequest {
  date?: string;
  reference?: string;
  description?: string;
  lines?: CreateJournalEntryLineRequest[];
}

export interface JournalEntryApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface JournalEntryPaginatedResponse {
  data: JournalEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface JournalEntryFilters {
  status?: JournalEntryStatus;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Journal Entries API Client
export class JournalEntriesApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: JournalEntryFilters): Promise<JournalEntryApiResponse<JournalEntryPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/journal-entries${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch journal entries');
    }

    return response.json();
  }

  async getById(id: number): Promise<JournalEntryApiResponse<JournalEntry>> {
    const url = `${this.basePath}/v1/api/journal-entries/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch journal entry');
    }

    return response.json();
  }

  async create(data: CreateJournalEntryRequest): Promise<JournalEntryApiResponse<JournalEntry>> {
    const url = `${this.basePath}/v1/api/journal-entries`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create journal entry');
    }

    return response.json();
  }

  async update(id: number, data: UpdateJournalEntryRequest): Promise<JournalEntryApiResponse<JournalEntry>> {
    const url = `${this.basePath}/v1/api/journal-entries/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update journal entry');
    }

    return response.json();
  }

  async post(id: number): Promise<JournalEntryApiResponse<JournalEntry>> {
    const url = `${this.basePath}/v1/api/journal-entries/${id}/post`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to post journal entry');
    }

    return response.json();
  }

  async void(id: number): Promise<JournalEntryApiResponse<JournalEntry>> {
    const url = `${this.basePath}/v1/api/journal-entries/${id}/void`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to void journal entry');
    }

    return response.json();
  }

  async delete(id: number): Promise<JournalEntryApiResponse<null>> {
    const url = `${this.basePath}/v1/api/journal-entries/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete journal entry');
    }

    return response.json();
  }
}

// Taxes API Client
export class TaxesApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: TaxFilters): Promise<TaxApiResponse<Tax[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.type) queryParams.append('type', filters.type);

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/taxes${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch taxes');
    }

    return response.json();
  }

  async getById(id: number): Promise<TaxApiResponse<Tax>> {
    const url = `${this.basePath}/v1/api/taxes/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tax');
    }

    return response.json();
  }

  async create(data: CreateTaxRequest): Promise<TaxApiResponse<Tax>> {
    const url = `${this.basePath}/v1/api/taxes`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create tax');
    }

    return response.json();
  }

  async update(id: number, data: UpdateTaxRequest): Promise<TaxApiResponse<Tax>> {
    const url = `${this.basePath}/v1/api/taxes/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update tax');
    }

    return response.json();
  }

  async delete(id: number): Promise<TaxApiResponse<null>> {
    const url = `${this.basePath}/v1/api/taxes/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete tax');
    }

    return response.json();
  }
}

// Create API instances with credentials support
export const getUsersApi = () => new UsersApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getCategoriesApi = () => new CategoriesApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getAuthApi = () => new AuthApi(getApiConfig(), undefined, fetchWithCredentialsOnly as any);
export const getCompaniesApi = () => new CompaniesApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getItemsApi = () => new ItemsApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getPartiesApi = () => new PartiesApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getBankAccountsApi = () => new BankAccountsApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getChartOfAccountsApi = () => new ChartOfAccountsApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getTaxesApi = () => new TaxesApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getVendorsApi = () => new VendorsApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getCustomersApi = () => new CustomersApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Expense Types
export type ExpenseStatus = 'draft' | 'approved' | 'paid' | 'void';
export type PaymentMethod = 'cash' | 'bank' | 'credit';

export interface Expense {
  id: number;
  expenseNumber: string;
  date: string;
  vendorId?: number;
  vendorName?: string;
  accountId: number;
  categoryId?: number;
  categoryName?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: number;
  reference?: string;
  description?: string;
  attachmentUrl?: string;
  status: ExpenseStatus;
  approvedAt?: string;
  approvedBy?: number;
  approverName?: string;
  paidAt?: string;
  companyId?: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  expenseNumber?: string;
  date: string;
  vendorId?: number;
  accountId: number;
  categoryId?: number;
  amount: number;
  taxAmount?: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: number;
  reference?: string;
  description?: string;
  attachmentUrl?: string;
  status?: ExpenseStatus;
  companyId?: number;
}

export interface UpdateExpenseRequest {
  expenseNumber?: string;
  date?: string;
  vendorId?: number;
  accountId?: number;
  categoryId?: number;
  amount?: number;
  taxAmount?: number;
  paymentMethod?: PaymentMethod;
  bankAccountId?: number;
  reference?: string;
  description?: string;
  attachmentUrl?: string;
  companyId?: number;
  isActive?: boolean;
}

export interface ExpenseApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ExpensePaginatedResponse {
  data: Expense[];
  total: number;
  limit: number;
  offset: number;
}

export interface ExpenseFilters {
  status?: ExpenseStatus;
  vendorId?: number;
  categoryId?: number;
  companyId?: number;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Expenses API Client
export class ExpensesApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: ExpenseFilters): Promise<ExpenseApiResponse<ExpensePaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.vendorId) queryParams.append('vendorId', String(filters.vendorId));
    if (filters?.categoryId) queryParams.append('categoryId', String(filters.categoryId));
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/expenses${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch expenses');
    }

    return response.json();
  }

  async getById(id: number): Promise<ExpenseApiResponse<Expense>> {
    const url = `${this.basePath}/v1/api/expenses/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch expense');
    }

    return response.json();
  }

  async create(data: CreateExpenseRequest): Promise<ExpenseApiResponse<Expense>> {
    const url = `${this.basePath}/v1/api/expenses`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create expense');
    }

    return response.json();
  }

  async update(id: number, data: UpdateExpenseRequest): Promise<ExpenseApiResponse<Expense>> {
    const url = `${this.basePath}/v1/api/expenses/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update expense');
    }

    return response.json();
  }

  async approve(id: number): Promise<ExpenseApiResponse<Expense>> {
    const url = `${this.basePath}/v1/api/expenses/${id}/approve`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve expense');
    }

    return response.json();
  }

  async markPaid(id: number): Promise<ExpenseApiResponse<Expense>> {
    const url = `${this.basePath}/v1/api/expenses/${id}/pay`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark expense as paid');
    }

    return response.json();
  }

  async void(id: number): Promise<ExpenseApiResponse<Expense>> {
    const url = `${this.basePath}/v1/api/expenses/${id}/void`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to void expense');
    }

    return response.json();
  }

  async delete(id: number): Promise<ExpenseApiResponse<null>> {
    const url = `${this.basePath}/v1/api/expenses/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete expense');
    }

    return response.json();
  }
}

export const getExpensesApi = () => new ExpensesApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getJournalEntriesApi = () => new JournalEntriesApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Bank Deposit Types
export type BankDepositStatus = 'pending' | 'completed' | 'void';

export interface BankDeposit {
  id: number;
  depositNumber: string;
  date: string;
  bankAccountId: number;
  bankAccountName?: string;
  amount: number;
  reference?: string;
  description?: string;
  depositedBy?: string;
  status: BankDepositStatus;
  completedAt?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankDepositRequest {
  depositNumber?: string;
  date: string;
  bankAccountId: number;
  amount: number;
  reference?: string;
  description?: string;
  depositedBy?: string;
  companyId: number;
}

export interface UpdateBankDepositRequest {
  date?: string;
  bankAccountId?: number;
  amount?: number;
  reference?: string;
  description?: string;
  depositedBy?: string;
}

export interface BankDepositApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BankDepositPaginatedResponse {
  data: BankDeposit[];
  total: number;
  limit: number;
  offset: number;
}

export interface BankDepositFilters {
  status?: BankDepositStatus;
  bankAccountId?: number;
  companyId?: number;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Bank Deposits API Client
export class BankDepositsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: BankDepositFilters): Promise<BankDepositApiResponse<BankDepositPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.bankAccountId) queryParams.append('bankAccountId', String(filters.bankAccountId));
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/bank-deposits${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bank deposits');
    }

    return response.json();
  }

  async getById(id: number): Promise<BankDepositApiResponse<BankDeposit>> {
    const url = `${this.basePath}/v1/api/bank-deposits/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bank deposit');
    }

    return response.json();
  }

  async create(data: CreateBankDepositRequest): Promise<BankDepositApiResponse<BankDeposit>> {
    const url = `${this.basePath}/v1/api/bank-deposits`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create bank deposit');
    }

    return response.json();
  }

  async update(id: number, data: UpdateBankDepositRequest): Promise<BankDepositApiResponse<BankDeposit>> {
    const url = `${this.basePath}/v1/api/bank-deposits/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update bank deposit');
    }

    return response.json();
  }

  async complete(id: number): Promise<BankDepositApiResponse<BankDeposit>> {
    const url = `${this.basePath}/v1/api/bank-deposits/${id}/complete`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete bank deposit');
    }

    return response.json();
  }

  async void(id: number): Promise<BankDepositApiResponse<BankDeposit>> {
    const url = `${this.basePath}/v1/api/bank-deposits/${id}/void`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to void bank deposit');
    }

    return response.json();
  }

  async delete(id: number): Promise<BankDepositApiResponse<null>> {
    const url = `${this.basePath}/v1/api/bank-deposits/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete bank deposit');
    }

    return response.json();
  }
}

// Product Types
export interface ProductData {
  id: number;
  name: string;
  code: string;
  sku?: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  minPrice?: number;
  taxId?: number;
  trackInventory: boolean;
  reorderLevel: number;
  currentStock: number;
  lowStockAlert: boolean;
  barcode?: string;
  imageUrl?: string;
  weight?: number;
  dimensions?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  code: string;
  sku?: string;
  description?: string;
  categoryId: number;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  minPrice?: number;
  taxId?: number;
  trackInventory?: boolean;
  reorderLevel?: number;
  currentStock?: number;
  lowStockAlert?: boolean;
  barcode?: string;
  imageUrl?: string;
  weight?: number;
  dimensions?: string;
  companyId: number;
}

export interface UpdateProductRequest {
  name?: string;
  code?: string;
  sku?: string;
  description?: string;
  categoryId?: number;
  unitOfMeasure?: string;
  costPrice?: number;
  sellingPrice?: number;
  minPrice?: number;
  taxId?: number;
  trackInventory?: boolean;
  reorderLevel?: number;
  lowStockAlert?: boolean;
  barcode?: string;
  imageUrl?: string;
  weight?: number;
  dimensions?: string;
  isActive?: boolean;
}

export interface AdjustStockRequest {
  quantity: number;
  type: 'add' | 'subtract' | 'set';
}

export interface ProductApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductPaginatedResponse {
  data: ProductData[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductFilters {
  categoryId?: number;
  companyId?: number;
  isActive?: boolean;
  lowStock?: boolean;
  trackInventory?: boolean;
  limit?: number;
  offset?: number;
}

// Products API Client
export class ProductsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: ProductFilters): Promise<ProductApiResponse<ProductPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.categoryId) queryParams.append('categoryId', String(filters.categoryId));
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.lowStock !== undefined) queryParams.append('lowStock', String(filters.lowStock));
    if (filters?.trackInventory !== undefined) queryParams.append('trackInventory', String(filters.trackInventory));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/products${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    return response.json();
  }

  async getById(id: number): Promise<ProductApiResponse<ProductData>> {
    const url = `${this.basePath}/v1/api/products/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product');
    }

    return response.json();
  }

  async create(data: CreateProductRequest): Promise<ProductApiResponse<ProductData>> {
    const url = `${this.basePath}/v1/api/products`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    return response.json();
  }

  async update(id: number, data: UpdateProductRequest): Promise<ProductApiResponse<ProductData>> {
    const url = `${this.basePath}/v1/api/products/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    return response.json();
  }

  async adjustStock(id: number, data: AdjustStockRequest): Promise<ProductApiResponse<ProductData>> {
    const url = `${this.basePath}/v1/api/products/${id}/adjust-stock`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to adjust product stock');
    }

    return response.json();
  }

  async delete(id: number): Promise<ProductApiResponse<null>> {
    const url = `${this.basePath}/v1/api/products/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }

    return response.json();
  }
}

export const getBankDepositsApi = () => new BankDepositsApi(getApiConfig(), undefined, fetchWithCredentials as any);
export const getProductsApi = () => new ProductsApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Sales Return Types
export type SalesReturnStatus = 'draft' | 'approved' | 'completed' | 'cancelled';

export interface SalesReturnLine {
  id?: number;
  salesReturnId?: number;
  itemId: number;
  itemName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxName?: string;
  taxRate?: number;
  taxAmount: number;
  lineTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReturn {
  id: number;
  returnNumber: string;
  date: string;
  customerId: number;
  customerName?: string;
  salesInvoiceId?: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  reason?: string;
  status: SalesReturnStatus;
  notes?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  lines?: SalesReturnLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesReturnLineRequest {
  itemId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxAmount: number;
  lineTotal: number;
}

export interface CreateSalesReturnRequest {
  date: string;
  customerId: number;
  salesInvoiceId?: number;
  reason?: string;
  notes?: string;
  companyId: number;
  lines: CreateSalesReturnLineRequest[];
}

export interface UpdateSalesReturnRequest {
  date?: string;
  customerId?: number;
  salesInvoiceId?: number;
  reason?: string;
  notes?: string;
  lines?: CreateSalesReturnLineRequest[];
}

export interface SalesReturnApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SalesReturnPaginatedResponse {
  data: SalesReturn[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalesReturnFilters {
  status?: SalesReturnStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Sales Returns API Client
export class SalesReturnsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: SalesReturnFilters): Promise<SalesReturnApiResponse<SalesReturnPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.customerId) queryParams.append('customerId', String(filters.customerId));
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/sales-returns${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sales returns');
    }

    return response.json();
  }

  async getById(id: number): Promise<SalesReturnApiResponse<SalesReturn>> {
    const url = `${this.basePath}/v1/api/sales-returns/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sales return');
    }

    return response.json();
  }

  async create(data: CreateSalesReturnRequest): Promise<SalesReturnApiResponse<SalesReturn>> {
    const url = `${this.basePath}/v1/api/sales-returns`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create sales return');
    }

    return response.json();
  }

  async update(id: number, data: UpdateSalesReturnRequest): Promise<SalesReturnApiResponse<SalesReturn>> {
    const url = `${this.basePath}/v1/api/sales-returns/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update sales return');
    }

    return response.json();
  }

  async approve(id: number): Promise<SalesReturnApiResponse<SalesReturn>> {
    const url = `${this.basePath}/v1/api/sales-returns/${id}/approve`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve sales return');
    }

    return response.json();
  }

  async complete(id: number): Promise<SalesReturnApiResponse<SalesReturn>> {
    const url = `${this.basePath}/v1/api/sales-returns/${id}/complete`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete sales return');
    }

    return response.json();
  }

  async cancel(id: number): Promise<SalesReturnApiResponse<SalesReturn>> {
    const url = `${this.basePath}/v1/api/sales-returns/${id}/cancel`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel sales return');
    }

    return response.json();
  }

  async delete(id: number): Promise<SalesReturnApiResponse<null>> {
    const url = `${this.basePath}/v1/api/sales-returns/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete sales return');
    }

    return response.json();
  }
}

export const getSalesReturnsApi = () => new SalesReturnsApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Sales Invoice Types
export type SalesInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface SalesInvoiceLine {
  id?: number;
  salesInvoiceId?: number;
  itemId: number;
  itemName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxName?: string;
  taxRate?: number;
  taxAmount: number;
  lineTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesInvoice {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  customerId: number;
  customerName?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  status: SalesInvoiceStatus;
  notes?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  lines?: SalesInvoiceLine[];
  receiptImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesInvoiceLineRequest {
  itemId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxAmount: number;
  lineTotal: number;
}

export interface CreateSalesInvoiceRequest {
  date: string;
  dueDate?: string;
  customerId: number;
  discount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  notes?: string;
  companyId: number;
  lines: CreateSalesInvoiceLineRequest[];
  receiptImage?: string;
}

export interface UpdateSalesInvoiceRequest {
  date?: string;
  dueDate?: string;
  customerId?: number;
  discount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  notes?: string;
  status?: SalesInvoiceStatus;
  lines?: CreateSalesInvoiceLineRequest[];
  receiptImage?: string;
}

export interface SalesInvoiceApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SalesInvoicePaginatedResponse {
  data: SalesInvoice[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalesInvoiceFilters {
  status?: SalesInvoiceStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Sales Invoices API Client
export class SalesInvoicesApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: SalesInvoiceFilters): Promise<SalesInvoiceApiResponse<SalesInvoicePaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.customerId) queryParams.append('customerId', String(filters.customerId));
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/sales-invoices${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sales invoices');
    }

    return response.json();
  }

  async getById(id: number): Promise<SalesInvoiceApiResponse<SalesInvoice>> {
    const url = `${this.basePath}/v1/api/sales-invoices/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sales invoice');
    }

    return response.json();
  }

  async getNextNumber(): Promise<SalesInvoiceApiResponse<{ nextNumber: string }>> {
    const url = `${this.basePath}/v1/api/sales-invoices/next-number`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get next invoice number');
    }

    return response.json();
  }

  async create(data: CreateSalesInvoiceRequest): Promise<SalesInvoiceApiResponse<SalesInvoice>> {
    const url = `${this.basePath}/v1/api/sales-invoices`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create sales invoice');
    }

    return response.json();
  }

  async update(id: number, data: UpdateSalesInvoiceRequest): Promise<SalesInvoiceApiResponse<SalesInvoice>> {
    const url = `${this.basePath}/v1/api/sales-invoices/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update sales invoice');
    }

    return response.json();
  }

  async markPaid(id: number, paidAmount?: number): Promise<SalesInvoiceApiResponse<SalesInvoice>> {
    const url = `${this.basePath}/v1/api/sales-invoices/${id}/pay`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paidAmount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark invoice as paid');
    }

    return response.json();
  }

  async cancel(id: number): Promise<SalesInvoiceApiResponse<SalesInvoice>> {
    const url = `${this.basePath}/v1/api/sales-invoices/${id}/cancel`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel sales invoice');
    }

    return response.json();
  }

  async delete(id: number): Promise<SalesInvoiceApiResponse<null>> {
    const url = `${this.basePath}/v1/api/sales-invoices/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete sales invoice');
    }

    return response.json();
  }
}

export const getSalesInvoicesApi = () => new SalesInvoicesApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Purchase Invoice Types
export type PurchaseInvoiceStatus = 'draft' | 'received' | 'paid' | 'overdue' | 'cancelled';

export interface PurchaseInvoiceLine {
  id?: number;
  purchaseInvoiceId?: number;
  itemId: number;
  itemName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxName?: string;
  taxRate?: number;
  taxAmount: number;
  lineTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseInvoice {
  id: number;
  billNumber: string;
  date: string;
  dueDate?: string;
  vendorId: number;
  vendorName?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  status: PurchaseInvoiceStatus;
  notes?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  lines?: PurchaseInvoiceLine[];
  receiptImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseInvoiceLineRequest {
  itemId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxAmount: number;
  lineTotal: number;
}

export interface CreatePurchaseInvoiceRequest {
  date: string;
  dueDate?: string;
  vendorId: number;
  discount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  notes?: string;
  companyId: number;
  lines: CreatePurchaseInvoiceLineRequest[];
  receiptImage?: string;
}

export interface UpdatePurchaseInvoiceRequest {
  date?: string;
  dueDate?: string;
  vendorId?: number;
  discount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  accountNumber?: string;
  remarks?: string;
  notes?: string;
  status?: PurchaseInvoiceStatus;
  lines?: CreatePurchaseInvoiceLineRequest[];
  receiptImage?: string;
}

export interface PurchaseInvoiceApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PurchaseInvoicePaginatedResponse {
  data: PurchaseInvoice[];
  total: number;
  limit: number;
  offset: number;
}

export interface PurchaseInvoiceFilters {
  status?: PurchaseInvoiceStatus;
  vendorId?: number;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Purchase Invoices API Client
export class PurchaseInvoicesApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: PurchaseInvoiceFilters): Promise<PurchaseInvoiceApiResponse<PurchaseInvoicePaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.vendorId) queryParams.append('vendorId', String(filters.vendorId));
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/purchase-invoices${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch purchase invoices');
    }

    return response.json();
  }

  async getById(id: number): Promise<PurchaseInvoiceApiResponse<PurchaseInvoice>> {
    const url = `${this.basePath}/v1/api/purchase-invoices/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch purchase invoice');
    }

    return response.json();
  }

  async getNextNumber(): Promise<PurchaseInvoiceApiResponse<{ nextNumber: string }>> {
    const url = `${this.basePath}/v1/api/purchase-invoices/next-number`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get next bill number');
    }

    return response.json();
  }

  async create(data: CreatePurchaseInvoiceRequest): Promise<PurchaseInvoiceApiResponse<PurchaseInvoice>> {
    const url = `${this.basePath}/v1/api/purchase-invoices`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create purchase invoice');
    }

    return response.json();
  }

  async update(id: number, data: UpdatePurchaseInvoiceRequest): Promise<PurchaseInvoiceApiResponse<PurchaseInvoice>> {
    const url = `${this.basePath}/v1/api/purchase-invoices/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update purchase invoice');
    }

    return response.json();
  }

  async markPaid(id: number, paidAmount?: number): Promise<PurchaseInvoiceApiResponse<PurchaseInvoice>> {
    const url = `${this.basePath}/v1/api/purchase-invoices/${id}/pay`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paidAmount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark invoice as paid');
    }

    return response.json();
  }

  async cancel(id: number): Promise<PurchaseInvoiceApiResponse<PurchaseInvoice>> {
    const url = `${this.basePath}/v1/api/purchase-invoices/${id}/cancel`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel purchase invoice');
    }

    return response.json();
  }

  async delete(id: number): Promise<PurchaseInvoiceApiResponse<null>> {
    const url = `${this.basePath}/v1/api/purchase-invoices/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete purchase invoice');
    }

    return response.json();
  }
}

export const getPurchaseInvoicesApi = () => new PurchaseInvoicesApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Purchase Return Types
export type PurchaseReturnStatus = 'draft' | 'approved' | 'completed' | 'cancelled';

export interface PurchaseReturnLine {
  id?: number;
  purchaseReturnId?: number;
  itemId: number;
  itemName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxName?: string;
  taxRate?: number;
  taxAmount: number;
  lineTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseReturn {
  id: number;
  returnNumber: string;
  date: string;
  vendorId: number;
  vendorName?: string;
  purchaseInvoiceId?: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  reason?: string;
  status: PurchaseReturnStatus;
  notes?: string;
  companyId: number;
  companyName?: string;
  isActive: boolean;
  lines?: PurchaseReturnLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseReturnLineRequest {
  itemId: number;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxAmount: number;
  lineTotal: number;
}

export interface CreatePurchaseReturnRequest {
  date: string;
  vendorId: number;
  purchaseInvoiceId?: number;
  reason?: string;
  notes?: string;
  companyId: number;
  lines: CreatePurchaseReturnLineRequest[];
}

export interface UpdatePurchaseReturnRequest {
  date?: string;
  vendorId?: number;
  purchaseInvoiceId?: number;
  reason?: string;
  notes?: string;
  lines?: CreatePurchaseReturnLineRequest[];
}

export interface PurchaseReturnApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PurchaseReturnPaginatedResponse {
  data: PurchaseReturn[];
  total: number;
  limit: number;
  offset: number;
}

export interface PurchaseReturnFilters {
  status?: PurchaseReturnStatus;
  vendorId?: number;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Purchase Returns API Client
export class PurchaseReturnsApi {
  private basePath: string;
  private fetch: typeof fetch;

  constructor(configuration?: Configuration, basePath?: string, customFetch?: typeof fetch) {
    this.basePath = configuration?.basePath || basePath || 'http://localhost:8000';
    this.fetch = customFetch || fetch;
  }

  async getAll(filters?: PurchaseReturnFilters): Promise<PurchaseReturnApiResponse<PurchaseReturnPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.vendorId) queryParams.append('vendorId', String(filters.vendorId));
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.companyId) queryParams.append('companyId', String(filters.companyId));
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters?.limit !== undefined) queryParams.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append('offset', String(filters.offset));

    const queryString = queryParams.toString();
    const url = `${this.basePath}/v1/api/purchase-returns${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch purchase returns');
    }

    return response.json();
  }

  async getById(id: number): Promise<PurchaseReturnApiResponse<PurchaseReturn>> {
    const url = `${this.basePath}/v1/api/purchase-returns/${id}`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch purchase return');
    }

    return response.json();
  }

  async getNextNumber(): Promise<PurchaseReturnApiResponse<{ nextNumber: string }>> {
    const url = `${this.basePath}/v1/api/purchase-returns/next-number`;

    const response = await this.fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get next return number');
    }

    return response.json();
  }

  async create(data: CreatePurchaseReturnRequest): Promise<PurchaseReturnApiResponse<PurchaseReturn>> {
    const url = `${this.basePath}/v1/api/purchase-returns`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create purchase return');
    }

    return response.json();
  }

  async update(id: number, data: UpdatePurchaseReturnRequest): Promise<PurchaseReturnApiResponse<PurchaseReturn>> {
    const url = `${this.basePath}/v1/api/purchase-returns/${id}`;

    const response = await this.fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update purchase return');
    }

    return response.json();
  }

  async approve(id: number): Promise<PurchaseReturnApiResponse<PurchaseReturn>> {
    const url = `${this.basePath}/v1/api/purchase-returns/${id}/approve`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve purchase return');
    }

    return response.json();
  }

  async complete(id: number): Promise<PurchaseReturnApiResponse<PurchaseReturn>> {
    const url = `${this.basePath}/v1/api/purchase-returns/${id}/complete`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete purchase return');
    }

    return response.json();
  }

  async cancel(id: number): Promise<PurchaseReturnApiResponse<PurchaseReturn>> {
    const url = `${this.basePath}/v1/api/purchase-returns/${id}/cancel`;

    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel purchase return');
    }

    return response.json();
  }

  async delete(id: number): Promise<PurchaseReturnApiResponse<null>> {
    const url = `${this.basePath}/v1/api/purchase-returns/${id}`;

    const response = await this.fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete purchase return');
    }

    return response.json();
  }
}

export const getPurchaseReturnsApi = () => new PurchaseReturnsApi(getApiConfig(), undefined, fetchWithCredentials as any);

// Export default instances for backward compatibility
export const usersApi = getUsersApi();
export const categoriesApi = getCategoriesApi();
export const authApi = getAuthApi();
export const companiesApi = getCompaniesApi();
export const itemsApi = getItemsApi();
export const partiesApi = getPartiesApi();
export const bankAccountsApi = getBankAccountsApi();
export const chartOfAccountsApi = getChartOfAccountsApi();
export const taxesApi = getTaxesApi();
export const vendorsApi = getVendorsApi();
export const customersApi = getCustomersApi();
export const expensesApi = getExpensesApi();
export const journalEntriesApi = getJournalEntriesApi();
export const bankDepositsApi = getBankDepositsApi();
export const productsApi = getProductsApi();
export const salesReturnsApi = getSalesReturnsApi();
export const salesInvoicesApi = getSalesInvoicesApi();
export const purchaseInvoicesApi = getPurchaseInvoicesApi();
export const purchaseReturnsApi = getPurchaseReturnsApi();