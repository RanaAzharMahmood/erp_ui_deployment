import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../useDebounce';

interface UseSearchOptions {
  debounceMs?: number;
  caseSensitive?: boolean;
}

interface UseSearchReturn<T> {
  searchTerm: string;
  debouncedSearchTerm: string;
  searchResults: T[];
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
}

/**
 * Hook for searching through data with debounced search term
 */
export function useSearch<T extends Record<string, any>>(
  data: T[],
  searchableFields: (keyof T)[],
  options: UseSearchOptions = {}
): UseSearchReturn<T> {
  const { debounceMs = 300, caseSensitive = false } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return data;
    }

    const normalizedSearch = caseSensitive
      ? debouncedSearchTerm.trim()
      : debouncedSearchTerm.trim().toLowerCase();

    return data.filter((item) =>
      searchableFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) {
          return false;
        }

        const stringValue = String(value);
        const normalizedValue = caseSensitive ? stringValue : stringValue.toLowerCase();
        return normalizedValue.includes(normalizedSearch);
      })
    );
  }, [data, debouncedSearchTerm, searchableFields, caseSensitive]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const isSearching = searchTerm !== debouncedSearchTerm;

  return {
    searchTerm,
    debouncedSearchTerm,
    searchResults,
    setSearchTerm,
    clearSearch,
    isSearching,
  };
}

export default useSearch;
