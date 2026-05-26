// Loading state management hook
import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
}

export function useLoadingState() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isSubmitting: false,
    isDeleting: false,
  });

  const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const withLoading = useCallback(async <T>(
    key: keyof LoadingState,
    fn: () => Promise<T>
  ): Promise<T> => {
    setState(prev => ({ ...prev, [key]: true }));
    try {
      const result = await fn();
      return result;
    } finally {
      setState(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const withSubmitting = useCallback(
    <T,>(fn: () => Promise<T>) => withLoading('isSubmitting', fn),
    [withLoading]
  );

  const withDeleting = useCallback(
    <T,>(fn: () => Promise<T>) => withLoading('isDeleting', fn),
    [withLoading]
  );

  return {
    ...state,
    setLoading,
    withLoading,
    withSubmitting,
    withDeleting,
  };
}
