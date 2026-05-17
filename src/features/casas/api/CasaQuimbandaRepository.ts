import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import {
  BlocoQuimbanda,
  type BlocoQuimbandaInput,
} from '../domain/BlocoQuimbanda';

const CAMPOS = `
  casa_id, corrente, raiz_linhagem, aberta_a_nao_iniciados
`.trim();

export class CasaQuimbandaRepository {
  constructor(private readonly client: SupabaseClient) {}

  async buscar(casaId: string): Promise<BlocoQuimbanda | null> {
    const { data, error } = await this.client
      .from('casa_quimbanda')
      .select(CAMPOS)
      .eq('casa_id', casaId)
      .maybeSingle();
    if (error) {
      throw new RepositoryError('CASA_QUIMBANDA_BUSCAR_FALHOU', error.message, {
        cause: error,
      });
    }
    return data ? BlocoQuimbanda.fromRow(data) : null;
  }

  /**
   * Cria ou atualiza o bloco Quimbanda da casa. RLS exige dirigente/admin.
   */
  async upsert(casaId: string, input: BlocoQuimbandaInput): Promise<void> {
    const { error } = await this.client.from('casa_quimbanda').upsert(
      {
        casa_id: casaId,
        corrente: input.corrente,
        raiz_linhagem: input.raizLinhagem,
        aberta_a_nao_iniciados: input.abertaANaoIniciados,
      },
      { onConflict: 'casa_id' },
    );
    if (error) {
      throw new RepositoryError('CASA_QUIMBANDA_UPSERT_FALHOU', error.message, {
        cause: error,
      });
    }
  }
}
