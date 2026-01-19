import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

interface UsePaginationReturn<T> {
  page: number;
  rowsPerPage: number;
  totalPages: number;
  paginatedData: T[];
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  rowsPerPageOptions: number[];
}

/**
 * Hook for handling pagination logic
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 0,
    initialRowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25, 50],
  } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / rowsPerPage);
  }, [data.length, rowsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, page, rowsPerPage]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(Math.max(0, totalPages - 1));
  }, [totalPages]);

  return {
    page,
    rowsPerPage,
    totalPages,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    goToFirstPage,
    goToLastPage,
    rowsPerPageOptions,
  };
}

export default usePagination;
