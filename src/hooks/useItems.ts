import { useState, useEffect, useCallback } from 'react';
import { getItemsApi } from '../generated/api/client';
import { Item } from '../generated/api';

// Type for API item response
interface ApiItemResponse {
  id?: number;
  itemCode?: string;
  itemName?: string;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  unitPrice?: number;
  purchasePrice?: number;
  salePrice?: number;
  taxRate?: number;
  unitOfMeasure?: string;
  isActive?: boolean;
  openingStock?: number;
  currentStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Type for API response wrapper
interface ItemsApiResponse {
  data?: ApiItemResponse[] | { data?: ApiItemResponse[] };
}

// Helper function to map item data
const mapToItem = (i: ApiItemResponse, useDefaultActive = false): Item => ({
  id: i.id,
  itemCode: i.itemCode,
  itemName: i.itemName,
  categoryId: i.categoryId,
  categoryName: i.categoryName,
  description: i.description,
  unitPrice: i.unitPrice,
  purchasePrice: i.purchasePrice,
  salePrice: i.salePrice,
  taxRate: i.taxRate,
  unitOfMeasure: i.unitOfMeasure,
  isActive: useDefaultActive ? (i.isActive ?? true) : i.isActive,
  openingStock: i.openingStock,
  currentStock: i.currentStock,
  createdAt: i.createdAt,
  updatedAt: i.updatedAt,
});

export const useItems = (activeOnly: boolean = true, categoryId?: number) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemsApi = getItemsApi();
      const response = await itemsApi.v1ApiItemsGet(activeOnly, categoryId) as ItemsApiResponse;
      const responseData = response?.data;
      const data: ApiItemResponse[] = Array.isArray(responseData)
        ? responseData
        : (responseData as { data?: ApiItemResponse[] })?.data || [];

      const mappedItems: Item[] = Array.isArray(data)
        ? data.map((i: ApiItemResponse) => mapToItem(i))
        : [];

      setItems(mappedItems);
    } catch (err: unknown) {
      console.error('Error loading items:', err);
      setError('Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, categoryId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const refetch = useCallback(() => {
    loadItems();
  }, [loadItems]);

  return { items, loading, error, refetch };
};
