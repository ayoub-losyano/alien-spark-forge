// Notification service
import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationInsert } from '@/types';

export const notificationService = {
  async getAll(limit: number = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data ?? [];
  },

  async getUnread(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .is('read_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);
    
    if (error) throw error;
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null);
    
    if (error) throw error;
    return count ?? 0;
  },

  createNotification(
    type: string,
    title: string,
    body?: string,
    entityType?: string,
    entityId?: string
  ): NotificationInsert {
    return {
      type,
      title,
      body,
      entity_type: entityType,
      entity_id: entityId,
    };
  },
};
