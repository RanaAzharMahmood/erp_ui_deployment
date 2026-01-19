import { useState, useEffect, useCallback } from 'react';

interface UseListDataOptions<T> {
  storageKey: string;
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
 * Generic hook for loading and managing list data from localStorage
 */
export function useListData<T extends { id: string }>(
  options: UseListDataOptions<T>
): UseListDataReturn<T> {
  const { storageKey, initialData = [], loadDelay = 500 } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    // Simulate async loading
    setTimeout(() => {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          setData(JSON.parse(savedData));
        }
      } catch (err) {
        setError(`Error loading ${storageKey}: ${err}`);
        console.error(`Error loading ${storageKey}:`, err);
      } finally {
        setLoading(false);
      }
    }, loadDelay);
  }, [storageKey, loadDelay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(
    (newData: T[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newData));
      } catch (err) {
        console.error(`Error saving ${storageKey}:`, err);
      }
    },
    [storageKey]
  );

  const addItem = useCallback(
    (item: T) => {
      setData((prev) => {
        const newData = [...prev, item];
        saveData(newData);
        return newData;
      });
    },
    [saveData]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<T>) => {
      setData((prev) => {
        const newData = prev.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
        saveData(newData);
        return newData;
      });
    },
    [saveData]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setData((prev) => {
        const newData = prev.filter((item) => item.id !== id);
        saveData(newData);
        return newData;
      });
    },
    [saveData]
  );

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
