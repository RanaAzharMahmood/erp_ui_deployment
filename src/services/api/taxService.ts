/**
 * Tax API Service
 * Handles all tax-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export interface CreateTaxData {
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  description?: string;
  companyId?: number;
}

export interface UpdateTaxData extends Partial<CreateTaxData> {
  isActive?: boolean;
}

export interface TaxFilters {
  isActive?: boolean;
  companyId?: number;
  type?: TaxType;
}

export interface TaxListResponse {
  success: boolean;
  message: string;
  data: Tax[];
}

export interface TaxResponse {
  success: boolean;
  message: string;
  data: Tax;
}

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const buildQueryString = (filters: TaxFilters): string => {
  const params = new URLSearchParams();

  if (filters.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  if (filters.companyId !== undefined) {
    params.append('companyId', String(filters.companyId));
  }
  if (filters.type) {
    params.append('type', filters.type);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const taxService = {
  /**
   * Get all taxes with optional filters
   */
  async getAll(filters: TaxFilters = {}): Promise<TaxListResponse> {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/v1/api/taxes${queryString}`, {
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
   * Get tax by ID
   */
  async getById(id: number): Promise<TaxResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/taxes/${id}`, {
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
   * Create a new tax
   */
  async create(data: CreateTaxData): Promise<TaxResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/taxes`, {
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
   * Update tax by ID
   */
  async update(id: number, data: UpdateTaxData): Promise<TaxResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/taxes/${id}`, {
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
   * Delete tax by ID (soft delete)
   */
  async delete(id: number): Promise<TaxResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/taxes/${id}`, {
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

export default taxService;
