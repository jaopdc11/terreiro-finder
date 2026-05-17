import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';

/**
 * Repository da tabela `favoritos` (par user_id × casa_id).
 * RLS já garante leitura/escrita só do dono — aqui só encapsulamos as
 * queries pra a UI nunca tocar `supabase.from(...)` diretamente.
 */
export class FavoritosRepository {
  constructor(private readonly client: SupabaseClient) {}

  /** IDs de casa favoritadas pelo usuário corrente. */
  async idsDe(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('favoritos')
      .select('casa_id')
      .eq('user_id', userId);
    if (error) {
      throw new RepositoryError('FAVORITOS_LIST_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((r) => r.casa_id as string);
  }

  async adicionar(userId: string, casaId: string): Promise<void> {
    const { error } = await this.client
      .from('favoritos')
      .upsert(
        { user_id: userId, casa_id: casaId },
        { onConflict: 'user_id,casa_id' },
      );
    if (error) {
      throw new RepositoryError('FAVORITOS_ADICIONAR_FALHOU', error.message, { cause: error });
    }
  }

  async remover(userId: string, casaId: string): Promise<void> {
    const { error } = await this.client
      .from('favoritos')
      .delete()
      .eq('user_id', userId)
      .eq('casa_id', casaId);
    if (error) {
      throw new RepositoryError('FAVORITOS_REMOVER_FALHOU', error.message, { cause: error });
    }
  }
}
