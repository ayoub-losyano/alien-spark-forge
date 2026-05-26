// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Validate environment variables in development
if (import.meta.env.DEV) {
  if (!SUPABASE_URL) {
    console.warn('[Supabase] Missing VITE_SUPABASE_URL environment variable');
  }
  if (!SUPABASE_PUBLISHABLE_KEY) {
    console.warn('[Supabase] Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable');
  }
}

// Create and export the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: true,
    },
  }
);

// Export for convenience
export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };
