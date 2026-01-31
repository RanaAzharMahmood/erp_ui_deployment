/**
 * Expense API Service
 * Handles all expense-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export interface CreateExpenseData {
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

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  isActive?: boolean;
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

export interface ExpenseListResponse {
  success: boolean;
  message: string;
  data: {
    data: Expense[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ExpenseResponse {
  success: boolean;
  message: string;
  data: Expense;
}

export interface DeleteExpenseResponse {
  success: boolean;
  message: string;
  data: null;
}

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  return headers;
};

const buildQueryString = (filters: ExpenseFilters): string => {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.vendorId !== undefined) {
    params.append('vendorId', String(filters.vendorId));
  }
  if (filters.categoryId !== undefined) {
    params.append('categoryId', String(filters.categoryId));
  }
  if (filters.companyId !== undefined) {
    params.append('companyId', String(filters.companyId));
  }
  if (filters.dateFrom) {
    params.append('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.append('dateTo', filters.dateTo);
  }
  if (filters.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  if (filters.limit !== undefined) {
    params.append('limit', String(filters.limit));
  }
  if (filters.offset !== undefined) {
    params.append('offset', String(filters.offset));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const expenseService = {
  /**
   * Get all expenses with optional filters
   */
  async getAll(filters: ExpenseFilters = {}): Promise<ExpenseListResponse> {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get expense by ID
   */
  async getById(id: number): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Create a new expense
   */
  async create(data: CreateExpenseData): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Update expense by ID
   */
  async update(id: number, data: UpdateExpenseData): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Approve expense by ID
   */
  async approve(id: number): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Mark expense as paid
   */
  async markPaid(id: number): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses/${id}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Void expense by ID
   */
  async void(id: number): Promise<ExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses/${id}/void`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Delete expense by ID (soft delete)
   */
  async delete(id: number): Promise<DeleteExpenseResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

export default expenseService;
