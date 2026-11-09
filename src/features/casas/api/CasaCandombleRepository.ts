import type { ApiClient } from '@/shared/lib/ApiClient';
import { BlocoCandomble, type BlocoCandombleInput } from '../domain/BlocoCandomble';
import { buscarBloco, salvarBloco } from './blocosDaApi';

export class CasaCandombleRepository {
  constructor(private readonly api: ApiClient) {}

  async buscar(casaId: string): Promise<BlocoCandomble | null> {
    const d = await buscarBloco(this.api, casaId, 'candomble');
    return d
      ? BlocoCandomble.fromRow({
          casa_id: casaId,
          nacao: d.nacao,
          raiz_linhagem: d.raizLinhagem,
          orixa_da_casa: d.orixaDaCasa,
          lingua_ritual: d.linguaRitual,
        })
      : null;
  }

  async upsert(casaId: string, input: BlocoCandombleInput): Promise<void> {
    await salvarBloco(this.api, casaId, 'candomble', { ...input });
  }
}
