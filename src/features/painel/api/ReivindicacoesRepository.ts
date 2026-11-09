import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';
import { Reivindicacao } from '../domain/Reivindicacao';
import type { NovaReivindicacaoInput } from '../schemas';

export const reivindicacaoApiSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  casaId: z.string().uuid(),
  observacoes: z.string().nullable(),
  status: z.string(),
  moderadoPor: z.string().uuid().nullable().optional(),
  moderadoEm: z.string().nullable(),
  motivoRecusa: z.string().nullable(),
  criadaEm: z.string(),
});

export function reivindicacaoDaApi(raw: unknown): Reivindicacao {
  const r = reivindicacaoApiSchema.parse(raw);
  return Reivindicacao.fromRow({
    id: r.id,
    user_id: r.userId ?? null,
    casa_id: r.casaId,
    observacoes: r.observacoes,
    status: r.status,
    moderado_por: r.moderadoPor ?? null,
    moderado_em: r.moderadoEm,
    motivo_recusa: r.motivoRecusa,
    created_at: r.criadaEm,
  });
}

export class ReivindicacoesRepository {
  constructor(private readonly api: ApiClient) {}

  /** Usuário logado pede pra ser reconhecido como dirigência. Nasce pendente. */
  async criarComoVisitante(_userId: string, input: NovaReivindicacaoInput): Promise<Reivindicacao> {
    const data = await this.api.post(`/casas/${input.casa_id}/reivindicacoes`, {
      observacoes: input.observacoes,
    });
    return reivindicacaoDaApi(data);
  }

  async listMinhas(): Promise<Reivindicacao[]> {
    const data = await this.api.get('/reivindicacoes/minhas');
    return z.array(z.unknown()).parse(data).map(reivindicacaoDaApi);
  }
}
