import type { ApiClient } from '@/shared/lib/ApiClient';
import { BlocoQuimbanda, type BlocoQuimbandaInput } from '../domain/BlocoQuimbanda';
import { buscarBloco, salvarBloco } from './blocosDaApi';

export class CasaQuimbandaRepository {
  constructor(private readonly api: ApiClient) {}

  async buscar(casaId: string): Promise<BlocoQuimbanda | null> {
    const d = await buscarBloco(this.api, casaId, 'quimbanda');
    return d
      ? BlocoQuimbanda.fromRow({
          casa_id: casaId,
          corrente: d.corrente,
          raiz_linhagem: d.raizLinhagem,
          aberta_a_nao_iniciados: d.abertaANaoIniciados,
        })
      : null;
  }

  async upsert(casaId: string, input: BlocoQuimbandaInput): Promise<void> {
    await salvarBloco(this.api, casaId, 'quimbanda', { ...input });
  }
}
