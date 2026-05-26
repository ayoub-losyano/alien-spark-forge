// Activity and notification services
import { supabase } from '@/integrations/supabase/client';

type ActivityType = 
  | 'login'
  | 'logout'
  | 'order_created'
  | 'order_updated'
  | 'order_deleted'
  | 'status_changed'
  | 'payment_updated'
  | 'member_added'
  | 'member_updated'
  | 'member_deleted'
  | 'expense_added';

export const logActivity = async (
  type: string,
  message: string,
  entityType?: string,
  entityId?: string
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      type,
      message,
      entity_type: entityType,
      entity_id: entityId,
    });
  } catch (error) {
    console.warn('Activity log failed:', error);
  }
};

export const notify = async (
  type: string,
  title: string,
  body?: string,
  entityType?: string,
  entityId?: string
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      type,
      title,
      body,
      entity_type: entityType,
      entity_id: entityId,
    });
  } catch (error) {
    console.warn('Notification failed:', error);
  }
};

export const activityService = {
  async getRecent(limit: number = 8): Promise<any[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data ?? [];
  },

  async getByEntity(entityType: string, entityId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },
};
