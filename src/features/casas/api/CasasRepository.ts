import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import { Casa } from '../domain/Casa';
import type { FiltrosBusca } from '@/features/busca/domain/FiltrosBusca';

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
      // Casa precisa ter pelo menos uma tag em linhas_trabalhadas OU linhagem.
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
