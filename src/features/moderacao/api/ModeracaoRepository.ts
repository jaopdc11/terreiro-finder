import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';
import type { Indicacao } from '@/features/indicacao/domain/Indicacao';
import { indicacaoDaApi } from '@/features/indicacao/api/IndicacoesRepository';
import { casaApiSchema } from '@/features/casas/api/casaDaApi';

const pessoaSchema = z
  .object({ nomeExibicao: z.string().nullable(), nomeCompleto: z.string().nullable() })
  .passthrough()
  .nullable();

const filaSchema = z.object({
  indicacoes: z.array(z.unknown()),
  aguardandoConsentimento: z.array(casaApiSchema),
  cadastrosDiretos: z.array(casaApiSchema.extend({ criador: pessoaSchema })),
  reivindicacoes: z.array(
    z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      casaId: z.string().uuid(),
      observacoes: z.string().nullable(),
      status: z.string(),
      criadaEm: z.string(),
      casa: casaApiSchema.nullable(),
      autor: pessoaSchema,
    }),
  ),
});

type Perfil = { nome_exibicao: string | null; nome_completo: string | null };

/** Fila no formato que a tela de admin já consumia (snake_case). */
export interface FilaModeracao {
  indicacoes: Indicacao[];
  aguardandoConsentimento: {
    id: string;
    slug: string;
    nome: string;
    tradicao_principal: string;
    cidade: string;
    estado: string;
    bairro: string | null;
  }[];
  cadastrosDiretos: {
    id: string;
    slug: string;
    nome: string;
    sacerdote_nome: string | null;
    tradicao_principal: string;
    cidade: string;
    estado: string;
    bairro: string | null;
    criada_por: string | null;
    canal_validacao: string | null;
    created_at: string;
    criador: Perfil | null;
  }[];
  reivindicacoes: {
    id: string;
    user_id: string;
    casa_id: string;
    observacoes: string | null;
    status: string;
    created_at: string;
    casa: {
      slug: string;
      nome: string;
      whatsapp: string | null;
      telefone: string | null;
      email_contato: string | null;
    } | null;
  }[];
}

const perfil = (p: z.infer<typeof pessoaSchema>): Perfil | null =>
  p ? { nome_exibicao: p.nomeExibicao, nome_completo: p.nomeCompleto } : null;

/** Moderação: só admin (a API recusa o resto). */
export class ModeracaoRepository {
  constructor(private readonly api: ApiClient) {}

  async fila(): Promise<FilaModeracao> {
    const f = filaSchema.parse(await this.api.get('/moderacao/'));
    return {
      indicacoes: f.indicacoes.map(indicacaoDaApi),
      aguardandoConsentimento: f.aguardandoConsentimento.map((c) => ({
        id: c.id,
        slug: c.slug,
        nome: c.nome,
        tradicao_principal: c.tradicaoPrincipal,
        cidade: c.endereco.cidade,
        estado: c.endereco.estado,
        bairro: c.endereco.bairro,
      })),
      cadastrosDiretos: f.cadastrosDiretos.map((c) => ({
        id: c.id,
        slug: c.slug,
        nome: c.nome,
        sacerdote_nome: c.perfil.sacerdoteNome,
        tradicao_principal: c.tradicaoPrincipal,
        cidade: c.endereco.cidade,
        estado: c.endereco.estado,
        bairro: c.endereco.bairro,
        criada_por: c.criadaPor ?? null,
        canal_validacao: c.canalValidacao ?? null,
        created_at: c.criadaEm ?? '',
        criador: perfil(c.criador),
      })),
      reivindicacoes: f.reivindicacoes.map((r) => ({
        id: r.id,
        user_id: r.userId,
        casa_id: r.casaId,
        observacoes: r.observacoes,
        status: r.status,
        created_at: r.criadaEm,
        casa: r.casa
          ? {
              slug: r.casa.slug,
              nome: r.casa.nome,
              whatsapp: r.casa.perfil.whatsapp,
              telefone: r.casa.perfil.telefone,
              email_contato: r.casa.perfil.emailContato,
            }
          : null,
      })),
    };
  }

  async aprovarIndicacao(id: string): Promise<{ casaId: string }> {
    return z.object({ casaId: z.string().uuid() }).parse(await this.api.post(`/moderacao/indicacoes/${id}/aprovar`));
  }

  async recusarIndicacao(id: string, motivo: string): Promise<void> {
    await this.api.post(`/moderacao/indicacoes/${id}/recusar`, { motivo });
  }

  async confirmarConsentimento(casaId: string): Promise<void> {
    await this.api.post(`/moderacao/casas/${casaId}/consentimento`);
  }

  async aprovarCadastroDireto(casaId: string): Promise<void> {
    await this.api.post(`/moderacao/casas/${casaId}/aprovar`);
  }

  async recusarCadastroDireto(casaId: string, motivo: string | null): Promise<void> {
    await this.api.post(`/moderacao/casas/${casaId}/recusar`, { motivo });
  }

  async aprovarReivindicacao(id: string): Promise<void> {
    await this.api.post(`/moderacao/reivindicacoes/${id}/aprovar`);
  }

  async recusarReivindicacao(id: string, motivo: string): Promise<void> {
    await this.api.post(`/moderacao/reivindicacoes/${id}/recusar`, { motivo });
  }
}
