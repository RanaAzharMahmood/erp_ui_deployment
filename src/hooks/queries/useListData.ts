import { useState, useEffect, useCallback } from 'react';

interface UseListDataOptions<T> {
  initialData?: T[];
  loadDelay?: number;
}

interface UseListDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  refresh: () => void;
  addItem: (item: T) => void;
  updateItem: (id: string, item: Partial<T>) => void;
  deleteItem: (id: string) => void;
}

/**
 * Generic hook for loading and managing list data
 */
export function useListData<T extends { id: string }>(
  options: UseListDataOptions<T>
): UseListDataReturn<T> {
  const { initialData = [], loadDelay = 500 } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    // Simulate async loading
    setTimeout(() => {
      // Data loading would be handled by API calls
      setLoading(false);
    }, loadDelay);
  }, [loadDelay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addItem = useCallback((item: T) => {
    setData((prev) => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    setData,
    refresh,
    addItem,
    updateItem,
    deleteItem,
  };
}

export default useListData;
