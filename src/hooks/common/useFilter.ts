import { useState, useMemo, useCallback } from 'react';

type FilterValue = string | number | boolean | null | undefined;
type FilterFn<T> = (item: T, filters: Record<string, FilterValue>) => boolean;

// Generic type for filterable objects with string keys
type FilterableObject = Record<string, FilterValue | object>;

interface UseFilterOptions<T> {
  initialFilters?: Record<string, FilterValue>;
  filterFn?: FilterFn<T>;
}

interface UseFilterReturn<T> {
  filters: Record<string, FilterValue>;
  filteredData: T[];
  setFilter: (key: string, value: FilterValue) => void;
  setFilters: (filters: Record<string, FilterValue>) => void;
  clearFilters: () => void;
  clearFilter: (key: string) => void;
  hasActiveFilters: boolean;
}

/**
 * Default filter function - matches string properties containing filter value
 */
function defaultFilterFn<T extends FilterableObject>(
  item: T,
  filters: Record<string, FilterValue>
): boolean {
  return Object.entries(filters).every(([key, filterValue]) => {
    if (filterValue === '' || filterValue === null || filterValue === undefined) {
      return true;
    }

    const itemValue = item[key];
    if (itemValue === undefined || itemValue === null) {
      return false;
    }

    if (typeof filterValue === 'string' && typeof itemValue === 'string') {
      return itemValue.toLowerCase().includes(filterValue.toLowerCase());
    }

    return itemValue === filterValue;
  });
}

/**
 * Hook for filtering data with multiple filter criteria
 */
export function useFilter<T extends FilterableObject>(
  data: T[],
  options: UseFilterOptions<T> = {}
): UseFilterReturn<T> {
  const { initialFilters = {}, filterFn = defaultFilterFn } = options;

  const [filters, setFiltersState] = useState<Record<string, FilterValue>>(initialFilters);

  const filteredData = useMemo(() => {
    return data.filter((item) => filterFn(item, filters));
  }, [data, filters, filterFn]);

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters: Record<string, FilterValue>) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback((key: string) => {
    setFiltersState((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== '' && value !== null && value !== undefined
    );
  }, [filters]);

  return {
    filters,
    filteredData,
    setFilter,
    setFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
  };
}

export default useFilter;
