// Storage service for file uploads
import { supabase } from '@/integrations/supabase/client';

export const storageService = {
  async uploadAvatar(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${crypto.randomUUID()}.${ext}`;
    
    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    
    if (error) throw error;
    
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadOrderFile(file: File): Promise<{ url: string; path: string }> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${crypto.randomUUID()}.${ext}`;
    
    const { error } = await supabase.storage.from('order-files').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    
    if (error) throw error;
    
    const { data } = await supabase.storage.from('order-files').createSignedUrl(path, 60 * 60 * 24 * 365);
    return { url: data?.signedUrl ?? path, path };
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
