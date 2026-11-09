import { BancoTeste } from '../../setup/BancoTeste';
import { ultimoLinkPara } from '../../setup/ambienteApi';

// Acesso direto ao Postgres dos e2e (substitui o service-role do Supabase).

let banco: BancoTeste | null = null;

export function bancoE2E(): BancoTeste {
  const url = process.env.E2E_DB_URL;
  if (!url) throw new Error('E2E_DB_URL ausente (o global-setup não rodou?)');
  banco ??= new BancoTeste(url);
  return banco;
}

export function removerUsuariosPorEmailPrefix(prefixo: string): Promise<void> {
  return bancoE2E().removerUsuariosPorPrefixo(prefixo);
}

/** Link mandado por e-mail (em teste a API só registra no log). */
export async function linkDoEmail(email: string): Promise<string> {
  const log = process.env.E2E_LOG_API;
  if (!log) throw new Error('E2E_LOG_API ausente');
  for (let i = 0; i < 30; i++) {
    const link = ultimoLinkPara(log, email.toLowerCase());
    if (link) return link;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`nenhum e-mail pra ${email} no log da API`);
}
