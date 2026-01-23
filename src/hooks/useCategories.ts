import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { getCategoriesApi } from '../generated/api/client';

// Type for API category response
interface ApiCategoryResponse {
  id?: number;
  categoryName?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesApi = getCategoriesApi();
      const response = await categoriesApi.v1ApiCategoriesGet(true);
      if (response.data) {
        setCategories(
          (response.data as ApiCategoryResponse[]).map((c: ApiCategoryResponse) => ({
            id: String(c.id),
            name: c.categoryName || '',
            categoryName: c.categoryName,
            description: c.description,
            isActive: c.isActive,
            createdAt: c.createdAt || '',
            updatedAt: c.updatedAt || '',
          }))
        );
      }
    } catch (err: unknown) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const refetch = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, error, refetch };
};
