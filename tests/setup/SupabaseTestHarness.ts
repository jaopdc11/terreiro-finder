import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface Env {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

function readEnv(): Env {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error(
      'Faltam vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. ' +
        'Veja .env.test.',
    );
  }
  return { url, anonKey, serviceRoleKey };
}

function clienteSemPersist(env: Env, key: string): SupabaseClient {
  return createClient(env.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Boot/teardown da instância Supabase local + 3 clientes (anon, authed, admin).
 * Usado pelos testes de integração e RLS.
 */
export class SupabaseTestHarness {
  private readonly env: Env;
  readonly admin: SupabaseClient;

  constructor() {
    this.env = readEnv();
    this.admin = clienteSemPersist(this.env, this.env.serviceRoleKey);
  }

  anon(): SupabaseClient {
    return clienteSemPersist(this.env, this.env.anonKey);
  }

  async authedClientFor(email: string, senha: string): Promise<SupabaseClient> {
    const c = clienteSemPersist(this.env, this.env.anonKey);
    const { error } = await c.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(`authedClientFor falhou: ${error.message}`);
    return c;
  }

  async criarUsuario(input: {
    email: string;
    senha: string;
    role?: 'visitante' | 'dirigente' | 'admin';
    nome_completo?: string;
  }): Promise<{ id: string }> {
    const { data, error } = await this.admin.auth.admin.createUser({
      email: input.email,
      password: input.senha,
      email_confirm: true,
      user_metadata: { nome_completo: input.nome_completo ?? 'Tester' },
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message ?? 'sem user'}`);

    if (input.role && input.role !== 'visitante') {
      const { error: upErr } = await this.admin
        .from('profiles')
        .update({ role: input.role })
        .eq('id', data.user.id);
      if (upErr) throw new Error(`update role: ${upErr.message}`);
    }
    return { id: data.user.id };
  }

  async truncate(tabelas: string[]): Promise<void> {
    if (tabelas.length === 0) return;
    const lista = tabelas.map((t) => `public.${t}`).join(', ');
    const { error } = await this.admin.rpc('exec_sql', { sql: `truncate ${lista} cascade;` });
    if (error) {
      // RPC pode não existir; cai pra delete from em sequência.
      for (const t of tabelas) {
        await this.admin.from(t).delete().not('created_at', 'is', null);
      }
    }
  }

  /**
   * Limpa usuários de teste pelo email pattern. Útil pra rodar a suite repetida.
   */
  async removerUsuariosPorEmailPrefix(prefix: string): Promise<void> {
    const { data, error } = await this.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error || !data) return;
    for (const u of data.users) {
      if (u.email && u.email.startsWith(prefix)) {
        await this.admin.auth.admin.deleteUser(u.id);
      }
    }
  }
}
