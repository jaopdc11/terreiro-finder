import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SeedItajai } from '../../setup/SeedItajai';

function readEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`E2E precisa de ${name} no env (.env.test)`);
  return v;
}

export function adminClient(): SupabaseClient {
  return createClient(readEnv('SUPABASE_URL'), readEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}

export function seedItajai(): SeedItajai {
  return new SeedItajai(adminClient());
}
