import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// SUPABASE CLIENT - Safe initialization
// ============================================
// Uses lazy initialization to prevent app crash if env vars are missing.
// Supabase features gracefully degrade when credentials are unavailable.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (!_supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Missing Supabase credentials. Cloud features will be unavailable. ' +
        'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
      );
    }

    _supabaseClient = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return _supabaseClient;
};

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export const supabase = getSupabaseClient();

export default supabase;
