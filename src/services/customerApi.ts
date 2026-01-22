// Customer API Service
// This service handles all customer-related API calls

export interface CustomerData {
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

export interface CreateCustomerRequest {
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

export interface UpdateCustomerRequest {
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

export interface CustomerFilters {
  isActive?: boolean;
  companyId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedCustomersResponse {
  success: boolean;
  message: string;
  data: {
    data: CustomerData[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: CustomerData;
}

export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
  data: null;
}

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const customerApi = {
  /**
   * Get all customers with optional filters and pagination
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomersResponse> {
    const params = new URLSearchParams();

    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    if (filters?.companyId !== undefined) {
      params.append('companyId', String(filters.companyId));
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', String(filters.limit));
    }
    if (filters?.offset !== undefined) {
      params.append('offset', String(filters.offset));
    }

    const queryString = params.toString();
    const url = `${getBaseUrl()}/v1/api/customers${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    return handleResponse<PaginatedCustomersResponse>(response);
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: number): Promise<CustomerResponse> {
    const url = `${getBaseUrl()}/v1/api/customers/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });

    return handleResponse<CustomerResponse>(response);
  },

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerRequest): Promise<CustomerResponse> {
    const url = `${getBaseUrl()}/v1/api/customers`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return handleResponse<CustomerResponse>(response);
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: number, data: UpdateCustomerRequest): Promise<CustomerResponse> {
    const url = `${getBaseUrl()}/v1/api/customers/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    return handleResponse<CustomerResponse>(response);
  },

  /**
   * Delete a customer (soft delete)
   */
  async deleteCustomer(id: number): Promise<DeleteCustomerResponse> {
    const url = `${getBaseUrl()}/v1/api/customers/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    return handleResponse<DeleteCustomerResponse>(response);
  },
};

export default customerApi;
