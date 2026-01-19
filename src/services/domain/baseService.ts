/**
 * Base service class for localStorage-based CRUD operations
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
   * Get all items from localStorage
   */
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${this.storageKey}:`, error);
      return [];
    }
  }

  /**
   * Get a single item by ID
   */
  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item) => item.id === id);
  }

  /**
   * Create a new item
   */
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const items = this.getAll();
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    } as T;

    items.push(newItem);
    this.saveAll(items);
    return newItem;
  }

  /**
   * Update an existing item
   */
  update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    this.saveAll(items);
    return updatedItem;
  }

  /**
   * Delete an item by ID
   */
  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === items.length) {
      return false;
    }

    this.saveAll(filteredItems);
    return true;
  }

  /**
   * Save all items to localStorage
   */
  protected saveAll(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.storageKey}:`, error);
    }
  }

  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all items
   */
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get count of items
   */
  count(): number {
    return this.getAll().length;
  }

  /**
   * Check if an item exists
   */
  exists(id: string): boolean {
    return this.getById(id) !== undefined;
  }
}

export default BaseService;
