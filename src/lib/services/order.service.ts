// Order service - centralized business logic for orders
import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderInsert, OrderUpdate } from '@/types';
import { logActivity, notify } from './activity.service';
import { formatVND } from '../utils/formatters';

export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(order: OrderInsert): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    
    await logActivity('order_created', `New order created for ${order.client_name}`, 'order', data.id);
    await notify('order_created', 'New order created', `${order.client_name}`, 'order', data.id);
    
    return data;
  },

  async update(id: string, updates: Partial<OrderUpdate>): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateWithStatus(
    id: string,
    updates: Partial<OrderUpdate>,
    oldStatus: string,
    newStatus: string,
    clientName: string
  ): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    // Record status change
    await supabase.from('order_status_history').insert({
      order_id: id,
      from_status: oldStatus,
      to_status: newStatus,
    });
    
    await logActivity('status_changed', `Order ${clientName} → ${newStatus}`, 'order', id);
    await notify('order_updated', 'Order status updated', `${clientName}: ${newStatus}`, 'order', id);
  },

  async delete(id: string, clientName: string): Promise<void> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    
    if (error) throw error;
    await logActivity('order_deleted', `Order for ${clientName} deleted`, 'order', id);
  },

  async updatePaymentStatus(id: string, paymentStatus: string, clientName: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', id);
    
    if (error) throw error;
    await logActivity('payment_updated', `Payment status set to ${paymentStatus}`, 'order', id);
  },

  calculatePaymentStatus(deposit: number, total: number): 'pending' | 'partial' | 'completed' {
    if (total <= 0) return 'pending';
    if (deposit >= total) return 'completed';
    if (deposit > 0) return 'partial';
    return 'pending';
  },

  calculateRemaining(order: Order): number {
    return Number(order.total ?? 0) - Number(order.deposit ?? 0);
  },

  formatCurrency(amount: number | string | null | undefined): string {
    return formatVND(amount);
  },
};
