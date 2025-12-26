/**
 * Storage Service - Abstraction layer for localStorage
 * This allows easy switching to API calls later
 */

import type {
  Company,
  Customer,
  Vendor,
  Tax,
  CompanyFormData,
} from '../types/common.types';

// Storage keys
const STORAGE_KEYS = {
  COMPANIES: 'companies',
  CUSTOMERS: 'customers',
  VENDORS: 'vendors',
  TAXES: 'taxes',
} as const;

// Generic storage operations
class StorageService<T extends { id: string }> {
  constructor(private key: string) {}

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${this.key} from storage:`, error);
      return [];
    }
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item) => item.id === id);
  }

  create(data: Omit<T, 'id' | 'createdAt'>): T {
    const items = this.getAll();
    const newItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    } as unknown as T;

    items.push(newItem);
    this.saveAll(items);
    return newItem;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    this.saveAll(items);
    return updatedItem;
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === items.length) {
      return false; // Item not found
    }

    this.saveAll(filteredItems);
    return true;
  }

  search(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  private saveAll(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.key} to storage:`, error);
      throw new Error(`Failed to save ${this.key}`);
    }
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}

// Export specific service instances
export const companyService = new StorageService<Company>(STORAGE_KEYS.COMPANIES);
export const customerService = new StorageService<Customer>(STORAGE_KEYS.CUSTOMERS);
export const vendorService = new StorageService<Vendor>(STORAGE_KEYS.VENDORS);
export const taxService = new StorageService<Tax>(STORAGE_KEYS.TAXES);

// Helper functions for specific entities
export const CompanyStorage = {
  ...companyService,
  createCompany(data: CompanyFormData): Company {
    return companyService.create({
      ...data,
      user: data.ntnNumber, // Map ntnNumber to user for backward compatibility
    });
  },
};

export const CustomerStorage = {
  ...customerService,
};

export const VendorStorage = {
  ...vendorService,
};

export const TaxStorage = {
  ...taxService,
};
