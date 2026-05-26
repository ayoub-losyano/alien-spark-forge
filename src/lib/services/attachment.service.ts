// File attachment service for order files
import { supabase } from '@/integrations/supabase/client';
import type { OrderAttachment, OrderAttachmentInsert } from '@/types';

export const attachmentService = {
  async getByOrderId(orderId: string): Promise<OrderAttachment[]> {
    const { data, error } = await supabase
      .from('order_attachments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async create(attachment: OrderAttachmentInsert): Promise<OrderAttachment> {
    const { data, error } = await supabase
      .from('order_attachments')
      .insert(attachment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('order_attachments').delete().eq('id', id);
    if (error) throw error;
  },
};
