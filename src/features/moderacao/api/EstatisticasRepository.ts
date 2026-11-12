import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';

// Visitas do site, lidas pela encruza-api (proxy do analytics próprio; o token
// fica no servidor). Só admin: a API recusa o resto.

const resumoSchema = z.object({
  visitas: z.number(),
  visitantes: z.number(),
  pageviews: z.number(),
  rejeicao: z.number(),
  duracao_media_s: z.number(),
  novos: z.number(),
  recorrentes: z.number(),
});

const pontoSerieSchema = z.object({
  quando: z.string(),
  visitas: z.number(),
  visitantes: z.number(),
  pageviews: z.number(),
});
const linhaTopSchema = z.object({ valor: z.string(), visitas: z.number(), visitantes: z.number() });
const linhaPaginaSchema = z.object({
  path: z.string(),
  pageviews: z.number(),
  visitantes: z.number(),
  tempo_medio_s: z.number().nullable(),
});
const linhaEventoSchema = z.object({ tipo: z.string(), total: z.number(), visitantes: z.number() });

export type Resumo = z.infer<typeof resumoSchema>;
export type PontoSerie = z.infer<typeof pontoSerieSchema>;
export type LinhaTop = z.infer<typeof linhaTopSchema>;
export type LinhaPagina = z.infer<typeof linhaPaginaSchema>;
export type LinhaEvento = z.infer<typeof linhaEventoSchema>;
export type Dimensao = 'referrer' | 'utm_source' | 'cidade' | 'regiao' | 'aparelho' | 'so' | 'navegador';
export interface Periodo {
  de: string;
  ate: string;
}

export class EstatisticasRepository {
  constructor(private readonly api: ApiClient) {}

  async resumo(p: Periodo): Promise<{ atual: Resumo; anterior: Resumo }> {
    return z.object({ atual: resumoSchema, anterior: resumoSchema }).parse(await this.api.get('/estatisticas/resumo', { ...p }));
  }

  async serie(p: Periodo): Promise<PontoSerie[]> {
    return z.array(pontoSerieSchema).parse(await this.api.get('/estatisticas/serie', { ...p, por: 'dia' }));
  }

  async top(p: Periodo, dim: Dimensao): Promise<LinhaTop[]> {
    return z.array(linhaTopSchema).parse(await this.api.get('/estatisticas/top', { ...p, dim }));
  }

  async paginas(p: Periodo): Promise<LinhaPagina[]> {
    return z.array(linhaPaginaSchema).parse(await this.api.get('/estatisticas/paginas', { ...p }));
  }

  async eventos(p: Periodo): Promise<LinhaEvento[]> {
    return z.array(linhaEventoSchema).parse(await this.api.get('/estatisticas/eventos', { ...p }));
  }
}
