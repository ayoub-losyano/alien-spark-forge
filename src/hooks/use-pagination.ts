// Pagination hook
import { useState, useMemo, useCallback } from 'react';

interface PaginationOptions {
  pageSize?: number;
  total?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

interface PaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  setPageSize: (size: number) => void;
  paginate: <T>(items: T[]) => T[];
}

export function usePagination(
  totalItems: number = 0,
  options: PaginationOptions = {}
): PaginationReturn {
  const { pageSize: defaultPageSize = 10 } = options;
  
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: defaultPageSize,
  });

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / state.pageSize));
  }, [totalItems, state.pageSize]);

  const currentPage = useMemo(() => {
    return Math.min(state.page, totalPages);
  }, [state.page, totalPages]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * state.pageSize;
  }, [currentPage, state.pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + state.pageSize, totalItems);
  }, [startIndex, state.pageSize, totalItems]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page: Math.max(1, Math.min(page, totalPages)) }));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setState(prev => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setState(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }));
  }, []);

  const goToFirst = useCallback(() => {
    setState(prev => ({ ...prev, page: 1 }));
  }, []);

  const goToLast = useCallback(() => {
    setState(prev => ({ ...prev, page: totalPages }));
  }, [totalPages]);

  const setPageSize = useCallback((pageSize: number) => {
    setState({ page: 1, pageSize });
  }, []);

  const paginate = useCallback(<T>(items: T[]): T[] => {
    return items.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  return {
    page: currentPage,
    pageSize: state.pageSize,
    totalPages,
    startIndex,
    endIndex,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    setPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    setPageSize,
    paginate,
  };
}
