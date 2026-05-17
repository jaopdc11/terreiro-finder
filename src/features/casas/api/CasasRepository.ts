import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import { Casa } from '../domain/Casa';
import { Slug } from '../domain/Slug';
import type { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';
import type { NovaCasaDeIndicacao } from '@/features/indicacao/domain/Indicacao';

const CAMPOS_SELECT = `
  id, slug, nome, descricao, sacerdote_nome, tradicao_principal, status, fonte,
  logradouro, numero, complemento, bairro, cidade, estado, cep, endereco_visibilidade,
  coord_lat, coord_lng,
  aceita_visitantes, foto_registro,
  whatsapp, telefone, email_contato,
  texto_antes_visita,
  created_at, updated_at, aprovada_em, aprovada_por
`.trim();

export class CasasRepository {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Lista casas APROVADAS (RLS já filtra). Aplica filtros do VO; tags por overlap
   * em casa_umbanda.linhas_trabalhadas / .linhagem quando tradicao=umbanda.
   */
  async listAprovadas(filtros: FiltrosBusca): Promise<Casa[]> {
    let query = this.client
      .from('casas')
      .select(CAMPOS_SELECT)
      .eq('status', 'aprovada');

    if (filtros.tradicao) query = query.eq('tradicao_principal', filtros.tradicao);
    if (filtros.cidade) query = query.eq('cidade', filtros.cidade);
    if (filtros.bairro) query = query.eq('bairro', filtros.bairro);
    if (filtros.aceitaVisitantes) query = query.eq('aceita_visitantes', filtros.aceitaVisitantes);
    if (filtros.enderecoVisibilidade) {
      query = query.eq('endereco_visibilidade', filtros.enderecoVisibilidade);
    }

    if (filtros.tags.length > 0 && filtros.tradicao === 'umbanda') {
      const ids = await this.idsComTagsUmbanda([...filtros.tags]);
      if (ids.length === 0) return [];
      query = query.in('id', ids);
    }

    query = query.order('aprovada_em', { ascending: false }).limit(500);

    const { data, error } = await query;
    if (error) {
      throw new RepositoryError('CASAS_LIST_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((row) => Casa.fromRow(row));
  }

  async findBySlug(slug: string): Promise<Casa | null> {
    const { data, error } = await this.client
      .from('casas')
      .select(CAMPOS_SELECT)
      .eq('slug', slug)
      .eq('status', 'aprovada')
      .maybeSingle();
    if (error) {
      throw new RepositoryError('CASAS_FIND_BY_SLUG_FALHOU', error.message, { cause: error });
    }
    return data ? Casa.fromRow(data) : null;
  }

  /**
   * Cria casa a partir de uma indicação aprovada. Resolve slug em cascata:
   * kebab(nome) → kebab(nome)-kebab(bairro) → sufixo numérico.
   * Casa nasce `status='pendente', fonte='indicacao'` — não é pública até
   * passo 2 da moderação (ver 06-modelo-dados.md §7.3).
   */
  async criarDeIndicacao(payload: NovaCasaDeIndicacao): Promise<string> {
    const slugFinal = await this.resolverSlugDisponivel(payload.nome, payload.bairro);
    const { data, error } = await this.client
      .from('casas')
      .insert({ ...payload, slug: slugFinal })
      .select('id')
      .single();
    if (error || !data) {
      throw new RepositoryError('CASA_CRIAR_DE_INDICACAO_FALHOU', error?.message ?? 'sem id', {
        cause: error,
      });
    }
    return data.id as string;
  }

  /**
   * Passo 2 da moderação: torna uma casa pendente em pública (status aprovada).
   * Restrita ao admin pela RLS.
   */
  async aprovarCasaPendente(casaId: string, admin: { userId: string }): Promise<void> {
    const { error } = await this.client
      .from('casas')
      .update({
        status: 'aprovada',
        aprovada_em: new Date().toISOString(),
        aprovada_por: admin.userId,
      })
      .eq('id', casaId);
    if (error) {
      throw new RepositoryError('CASA_APROVAR_FALHOU', error.message, { cause: error });
    }
  }

  /**
   * Vincula um usuário a uma casa como dirigente. Restrito ao admin (RLS).
   * Idempotente: se já existir vínculo, retorna sem erro.
   */
  async vincularDirigente(
    casaId: string,
    userId: string,
    papel: 'principal' | 'auxiliar' = 'principal',
  ): Promise<void> {
    const { error } = await this.client
      .from('casa_dirigentes')
      .upsert({ casa_id: casaId, user_id: userId, papel }, { onConflict: 'casa_id,user_id' });
    if (error) {
      throw new RepositoryError('CASA_VINCULAR_DIRIGENTE_FALHOU', error.message, {
        cause: error,
      });
    }
  }

  /**
   * Passo final da reivindicação: muda fonte pra 'reivindicada' — a casa
   * passa a satisfazer Casa.estaVerificada(). Restrito ao admin (RLS).
   */
  async marcarComoReivindicada(casaId: string): Promise<void> {
    const { error } = await this.client
      .from('casas')
      .update({ fonte: 'reivindicada' })
      .eq('id', casaId);
    if (error) {
      throw new RepositoryError('CASA_MARCAR_REIVINDICADA_FALHOU', error.message, {
        cause: error,
      });
    }
  }

  private async resolverSlugDisponivel(nome: string, bairro: string | null): Promise<string> {
    const base = Slug.deTexto(nome);
    if (!(await this.slugExiste(base.toString()))) return base.toString();

    if (bairro && bairro.trim().length > 0) {
      try {
        const comBairro = Slug.deNomeEBairro(nome, bairro);
        if (!(await this.slugExiste(comBairro.toString()))) return comBairro.toString();
      } catch {
        // bairro vira string vazia após kebab; cai pro sufixo numérico
      }
    }

    for (let i = 2; i <= 20; i++) {
      const candidato = base.comSufixoNumerico(i).toString();
      if (!(await this.slugExiste(candidato))) return candidato;
    }
    throw new RepositoryError(
      'SLUG_INDISPONIVEL',
      `Não foi possível gerar slug único pra "${nome}" depois de 20 tentativas`,
    );
  }

  private async slugExiste(slug: string): Promise<boolean> {
    const { count, error } = await this.client
      .from('casas')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);
    if (error) {
      throw new RepositoryError('SLUG_EXISTE_CHECK_FALHOU', error.message, { cause: error });
    }
    return (count ?? 0) > 0;
  }

  private async idsComTagsUmbanda(tags: string[]): Promise<string[]> {
    const { data, error } = await this.client
      .from('casa_umbanda')
      .select('casa_id, linhas_trabalhadas, linhagem')
      .or(`linhas_trabalhadas.ov.{${tags.join(',')}},linhagem.ov.{${tags.join(',')}}`);
    if (error) {
      throw new RepositoryError('CASAS_TAGS_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((r) => r.casa_id as string);
  }
}
