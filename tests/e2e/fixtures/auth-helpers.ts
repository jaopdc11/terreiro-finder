import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function read(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`E2E precisa de ${name} no env (.env.test)`);
  return v;
}

export function adminClient(): SupabaseClient {
  return createClient(read('SUPABASE_URL'), read('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}

export async function removerUsuariosPorEmailPrefix(prefix: string): Promise<void> {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data) return;
  for (const u of data.users) {
    if (u.email && u.email.startsWith(prefix)) {
      await admin.auth.admin.deleteUser(u.id);
    }
  }
}
