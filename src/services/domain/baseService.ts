/**
 * Base service class for CRUD operations
 * Can be extended for specific domain entities
 */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export class BaseService<T extends BaseEntity> {
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Get all items - not implemented without API
   */
  getAll(): T[] {
    throw new Error('getAll not implemented - API required');
  }

  /**
   * Get a single item by ID - not implemented without API
   */
  getById(id: string): T | undefined {
    throw new Error(`getById(${id}) not implemented - API required`);
  }

  /**
   * Create a new item - not implemented without API
   */
  create(_item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    throw new Error('create not implemented - API required');
  }

  /**
   * Update an existing item - not implemented without API
   */
  update(id: string, _updates: Partial<Omit<T, 'id' | 'createdAt'>>): T | undefined {
    throw new Error(`update(${id}) not implemented - API required`);
  }

  /**
   * Delete an item by ID - not implemented without API
   */
  delete(id: string): boolean {
    throw new Error(`delete(${id}) not implemented - API required`);
  }

  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all items - not implemented without API
   */
  clearAll(): void {
    throw new Error('clearAll not implemented - API required');
  }

  /**
   * Get count of items - not implemented without API
   */
  count(): number {
    throw new Error('count not implemented - API required');
  }

  /**
   * Check if an item exists - not implemented without API
   */
  exists(id: string): boolean {
    throw new Error(`exists(${id}) not implemented - API required`);
  }
}

export default BaseService;
