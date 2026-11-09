import type { ApiClient } from '@/shared/lib/ApiClient';
import { BlocoUmbanda, type BlocoUmbandaInput } from '../domain/BlocoUmbanda';
import { buscarBloco, salvarBloco } from './blocosDaApi';

export class CasaUmbandaRepository {
  constructor(private readonly api: ApiClient) {}

  async buscar(casaId: string): Promise<BlocoUmbanda | null> {
    const d = await buscarBloco(this.api, casaId, 'umbanda');
    return d
      ? BlocoUmbanda.fromRow({
          casa_id: casaId,
          sincretismo: d.sincretismo,
          influencia_kardecista: d.influenciaKardecista,
          sacralizacao: d.sacralizacao,
          linhagem: d.linhagem,
          linhas_trabalhadas: d.linhasTrabalhadas,
        })
      : null;
  }

  async upsert(casaId: string, input: BlocoUmbandaInput): Promise<void> {
    await salvarBloco(this.api, casaId, 'umbanda', {
      sincretismo: input.sincretismo,
      influenciaKardecista: input.influenciaKardecista,
      sacralizacao: input.sacralizacao,
      linhagem: [...input.linhagem],
      linhasTrabalhadas: [...input.linhasTrabalhadas],
    });
  }
}
