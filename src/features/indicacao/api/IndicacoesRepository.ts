import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';
import { Indicacao } from '../domain/Indicacao';
import type { NovaIndicacaoInput } from '../schemas';

/** Indicação como a API devolve (sem quem moderou, pra quem indicou). */
export const indicacaoApiSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  nome: z.string(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  estado: z.string(),
  tradicaoPrincipal: z.string().nullable(),
  observacoes: z.string().nullable(),
  canalContato: z.string().nullable(),
  status: z.string(),
  casaId: z.string().uuid().nullable(),
  moderadoPor: z.string().uuid().nullable().optional(),
  moderadoEm: z.string().nullable(),
  motivoRecusa: z.string().nullable(),
  criadaEm: z.string(),
});

export function indicacaoDaApi(raw: unknown): Indicacao {
  const i = indicacaoApiSchema.parse(raw);
  return Indicacao.fromRow({
    id: i.id,
    user_id: i.userId ?? null,
    nome: i.nome,
    bairro: i.bairro,
    cidade: i.cidade,
    estado: i.estado,
    tradicao_principal: i.tradicaoPrincipal,
    observacoes: i.observacoes,
    canal_contato: i.canalContato,
    status: i.status,
    casa_id: i.casaId,
    moderado_por: i.moderadoPor ?? null,
    moderado_em: i.moderadoEm,
    motivo_recusa: i.motivoRecusa,
    created_at: i.criadaEm,
  });
}

export class IndicacoesRepository {
  constructor(private readonly api: ApiClient) {}

  /** Criada pelo usuário logado; sempre nasce pendente. */
  async criarComoVisitante(_userId: string, input: NovaIndicacaoInput): Promise<Indicacao> {
    const data = await this.api.post('/indicacoes', {
      nome: input.nome,
      cidade: input.cidade,
      estado: input.estado,
      bairro: input.bairro ?? null,
      tradicaoPrincipal: input.tradicao_principal ?? null,
      observacoes: input.observacoes ?? null,
      canalContato: input.canal_contato,
    });
    return indicacaoDaApi(data);
  }

  async listMinhas(): Promise<Indicacao[]> {
    const data = await this.api.get('/indicacoes/minhas');
    return z.array(z.unknown()).parse(data).map(indicacaoDaApi);
  }
}
