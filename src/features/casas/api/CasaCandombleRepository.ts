import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import {
  BlocoCandomble,
  type BlocoCandombleInput,
} from '../domain/BlocoCandomble';

const CAMPOS = `
  casa_id, nacao, raiz_linhagem, orixa_da_casa, lingua_ritual
`.trim();

export class CasaCandombleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async buscar(casaId: string): Promise<BlocoCandomble | null> {
    const { data, error } = await this.client
      .from('casa_candomble')
      .select(CAMPOS)
      .eq('casa_id', casaId)
      .maybeSingle();
    if (error) {
      throw new RepositoryError('CASA_CANDOMBLE_BUSCAR_FALHOU', error.message, {
        cause: error,
      });
    }
    return data ? BlocoCandomble.fromRow(data) : null;
  }

  /**
   * Cria ou atualiza o bloco Candomblé da casa. Idempotente via onConflict.
   * RLS permite dirigente da casa + admin.
   */
  async upsert(casaId: string, input: BlocoCandombleInput): Promise<void> {
    const { error } = await this.client.from('casa_candomble').upsert(
      {
        casa_id: casaId,
        nacao: input.nacao,
        raiz_linhagem: input.raizLinhagem,
        orixa_da_casa: input.orixaDaCasa,
        lingua_ritual: input.linguaRitual,
      },
      { onConflict: 'casa_id' },
    );
    if (error) {
      throw new RepositoryError('CASA_CANDOMBLE_UPSERT_FALHOU', error.message, {
        cause: error,
      });
    }
  }
}
