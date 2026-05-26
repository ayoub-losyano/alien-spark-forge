// Enhanced useQuery hook with loading and error states
import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface UseAsyncDataOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
}

export interface UseAsyncDataReturn<TData, TError = Error> {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: TError | null;
  refetch: () => Promise<UseQueryResult<TData, TError>>;
  invalidate: () => Promise<void>;
}

// Generic async data hook
export function useAsyncData<TData, TError = Error>(
  options: UseAsyncDataOptions<TData, TError>
): UseAsyncDataReturn<TData, TError> {
  const queryClient = useQueryClient();
  
  const query = useQuery<TData, TError>({
    ...options,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    gcTime: options.gcTime ?? 1000 * 60 * 30, // 30 minutes default
  });

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: options.queryKey });
  }, [queryClient, options.queryKey]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}

// Pre-configured hooks for common data fetching
export function useOrders() {
  return useAsyncData({
    queryKey: ['orders'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useOrder(id: string | undefined, enabled: boolean = true) {
  return useAsyncData({
    queryKey: ['order', id],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: enabled && !!id,
  });
}

export function useTeam() {
  return useAsyncData({
    queryKey: ['team'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('team_members').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useExpenses() {
  return useAsyncData({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('expenses').select('*').order('paid_on', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
