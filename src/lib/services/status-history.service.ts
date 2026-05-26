// Status history service for tracking order status changes
import { supabase } from '@/integrations/supabase/client';
import type { OrderStatusHistory, OrderStatusHistoryInsert } from '@/types';

export const statusHistoryService = {
  async getByOrderId(orderId: string): Promise<OrderStatusHistory[]> {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async create(history: OrderStatusHistoryInsert): Promise<OrderStatusHistory> {
    const { data, error } = await supabase
      .from('order_status_history')
      .insert(history)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async recordStatusChange(
    orderId: string,
    fromStatus: string | null,
    toStatus: string,
    changedBy?: string,
    note?: string
  ): Promise<void> {
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by: changedBy,
      note,
    });
  },
};
