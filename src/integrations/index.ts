// Main entry point for integrations
export { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase/client';
export { supabaseAdmin, createServerClient, verifyToken } from './supabase/server';
export * from './supabase/types';
