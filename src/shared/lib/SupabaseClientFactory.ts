import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseClientFactory {
  static fromEnv(): SupabaseClient {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
    }
    return createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
}
