// Comment service for order comments
import { supabase } from '@/integrations/supabase/client';
import type { OrderComment, OrderCommentInsert } from '@/types';

export const commentService = {
  async getByOrderId(orderId: string): Promise<OrderComment[]> {
    const { data, error } = await supabase
      .from('order_comments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async create(comment: OrderCommentInsert): Promise<OrderComment> {
    const { data, error } = await supabase
      .from('order_comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('order_comments').delete().eq('id', id);
    if (error) throw error;
  },
};
