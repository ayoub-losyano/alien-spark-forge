// Company settings service
import { supabase } from '@/integrations/supabase/client';
import type { CompanySettings, CompanySettingsInsert, CompanySettingsUpdate } from '@/types';

export const settingsService = {
  async get(): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(settings: CompanySettingsInsert): Promise<CompanySettings> {
    const { data, error } = await supabase
      .from('company_settings')
      .insert(settings)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: CompanySettingsUpdate): Promise<void> {
    const { error } = await supabase
      .from('company_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async upsert(settings: CompanySettingsInsert & { id?: string }): Promise<CompanySettings> {
    if (settings.id) {
      await this.update(settings.id, settings);
      const { data } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', settings.id)
        .single();
      return data!;
    } else {
      return this.create(settings);
    }
  },

  getDefaultSettings(): CompanySettingsInsert {
    return {
      agency_name: 'AlienSpark VN',
      currency: 'VND',
      language: 'English',
      contact_email: '',
      zalo: '',
      address: '',
      notify_new_order: true,
      notify_payment: true,
    };
  },
};
