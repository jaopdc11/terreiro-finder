import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import { Casa } from '../domain/Casa';
import type { PerfilAbertura } from '../domain/PerfilAbertura';

const CAMPOS_CASA = `
  id, slug, nome, descricao, sacerdote_nome, tradicao_principal, status, fonte,
  logradouro, numero, complemento, bairro, cidade, estado, cep, endereco_visibilidade,
  coord_lat, coord_lng,
  aceita_visitantes, foto_registro,
  whatsapp, telefone, email_contato,
  texto_antes_visita,
  created_at, updated_at, aprovada_em, aprovada_por
`.trim();

export interface PerfilCasaInput {
  descricao: string | null;
  sacerdoteNome: string | null;
  textoAntesVisita: string | null;
  whatsapp: string | null;
  telefone: string | null;
  emailContato: string | null;
}

/**
 * Repository das operações de painel do dirigente — separado de
 * CasasRepository pra não inflar o caso de busca pública. RLS já garante
 * que só dirigente/admin podem ler/escrever via essas queries (policy
 * "casas: update" cobre dirigente sem trocar status/fonte).
 */
export class CasasPainelRepository {
  constructor(private readonly client: SupabaseClient) {}

  /** Casas onde o usuário corrente está vinculado como dirigente. */
  async minhasCasas(userId: string): Promise<Casa[]> {
    const { data: vinculos, error: e1 } = await this.client
      .from('casa_dirigentes')
      .select('casa_id')
      .eq('user_id', userId);
    if (e1) {
      throw new RepositoryError('PAINEL_MINHAS_VINCULOS_FALHOU', e1.message, {
        cause: e1,
      });
    }
    const ids = (vinculos ?? []).map((v) => v.casa_id as string);
    if (ids.length === 0) return [];

    const { data, error } = await this.client
      .from('casas')
      .select(CAMPOS_CASA)
      .in('id', ids)
      .order('nome');
    if (error) {
      throw new RepositoryError('PAINEL_MINHAS_CASAS_FALHOU', error.message, {
        cause: error,
      });
    }
    return (data ?? []).map((row) => Casa.fromRow(row));
  }

  async buscarPorId(casaId: string): Promise<Casa | null> {
    const { data, error } = await this.client
      .from('casas')
      .select(CAMPOS_CASA)
      .eq('id', casaId)
      .maybeSingle();
    if (error) {
      throw new RepositoryError('PAINEL_BUSCAR_CASA_FALHOU', error.message, {
        cause: error,
      });
    }
    return data ? Casa.fromRow(data) : null;
  }

  /** Atualiza campos editáveis pelo dirigente (sem mexer em status/fonte). */
  async atualizarPerfil(casaId: string, input: PerfilCasaInput): Promise<void> {
    const { error } = await this.client
      .from('casas')
      .update({
        descricao: input.descricao,
        sacerdote_nome: input.sacerdoteNome,
        texto_antes_visita: input.textoAntesVisita,
        whatsapp: input.whatsapp,
        telefone: input.telefone,
        email_contato: input.emailContato,
      })
      .eq('id', casaId);
    if (error) {
      throw new RepositoryError('PAINEL_ATUALIZAR_PERFIL_FALHOU', error.message, {
        cause: error,
      });
    }
  }

  async atualizarAbertura(casaId: string, perfil: PerfilAbertura): Promise<void> {
    const { error } = await this.client
      .from('casas')
      .update({
        endereco_visibilidade: perfil.enderecoVisibilidade,
        aceita_visitantes: perfil.aceitaVisitantes,
        foto_registro: perfil.fotoRegistro,
      })
      .eq('id', casaId);
    if (error) {
      throw new RepositoryError('PAINEL_ATUALIZAR_ABERTURA_FALHOU', error.message, {
        cause: error,
      });
    }
  }
}
