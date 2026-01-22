/**
 * Vendor API Service
 * Handles all vendor-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export interface CreateVendorData {
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

export interface UpdateVendorData extends Partial<CreateVendorData> {
  isActive?: boolean;
}

export interface VendorFilters {
  isActive?: boolean;
  companyId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VendorListResponse {
  success: boolean;
  message: string;
  data: Vendor[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  return headers;
};

const buildQueryString = (filters: VendorFilters): string => {
  const params = new URLSearchParams();

  if (filters.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  if (filters.companyId !== undefined) {
    params.append('companyId', String(filters.companyId));
  }
  if (filters.search) {
    params.append('search', filters.search);
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

export const vendorService = {
  /**
   * Get all vendors with optional filters
   */
  async getAll(filters: VendorFilters = {}): Promise<VendorListResponse> {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/v1/api/vendors${queryString}`, {
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
   * Get vendor by ID
   */
  async getById(id: number): Promise<VendorResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/vendors/${id}`, {
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
   * Create a new vendor
   */
  async create(data: CreateVendorData): Promise<VendorResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/vendors`, {
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
   * Update vendor by ID
   */
  async update(id: number, data: UpdateVendorData): Promise<VendorResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/vendors/${id}`, {
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
   * Delete vendor by ID (soft delete)
   */
  async delete(id: number): Promise<VendorResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/api/vendors/${id}`, {
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

export default vendorService;
