import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import { BlocoUmbanda, type BlocoUmbandaInput } from '../domain/BlocoUmbanda';

const CAMPOS = `
  casa_id, sincretismo, influencia_kardecista, sacralizacao,
  linhagem, linhas_trabalhadas
`.trim();

export class CasaUmbandaRepository {
  constructor(private readonly client: SupabaseClient) {}

  async buscar(casaId: string): Promise<BlocoUmbanda | null> {
    const { data, error } = await this.client
      .from('casa_umbanda')
      .select(CAMPOS)
      .eq('casa_id', casaId)
      .maybeSingle();
    if (error) {
      throw new RepositoryError('CASA_UMBANDA_BUSCAR_FALHOU', error.message, {
        cause: error,
      });
    }
    return data ? BlocoUmbanda.fromRow(data) : null;
  }

  /**
   * Cria ou atualiza o bloco Umbanda da casa. Chamado por PainelService
   * quando o dirigente salva a aba "Tradição". RLS permite dirigente
   * gerenciar; admin também.
   */
  async upsert(casaId: string, input: BlocoUmbandaInput): Promise<void> {
    const { error } = await this.client.from('casa_umbanda').upsert(
      {
        casa_id: casaId,
        sincretismo: input.sincretismo,
        influencia_kardecista: input.influenciaKardecista,
        sacralizacao: input.sacralizacao,
        linhagem: [...input.linhagem],
        linhas_trabalhadas: [...input.linhasTrabalhadas],
      },
      { onConflict: 'casa_id' },
    );
    if (error) {
      throw new RepositoryError('CASA_UMBANDA_UPSERT_FALHOU', error.message, {
        cause: error,
      });
    }
  }
}
