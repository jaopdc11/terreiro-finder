import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import { Indicacao } from '../domain/Indicacao';
import type { ModeracaoStatus, NovaIndicacaoInput } from '../schemas';

const CAMPOS = `
  id, user_id, nome, bairro, cidade, estado, tradicao_principal,
  observacoes, canal_contato, status, casa_id, moderado_por, moderado_em,
  motivo_recusa, created_at
`.trim();

export class IndicacoesRepository {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Criada pelo visitante logado. user_id = auth.uid() (enforce por RLS).
   * Sempre nasce status='pendente'.
   */
  async criarComoVisitante(
    userId: string,
    input: NovaIndicacaoInput,
  ): Promise<Indicacao> {
    const { data, error } = await this.client
      .from('indicacoes_casa')
      .insert({
        user_id: userId,
        nome: input.nome,
        cidade: input.cidade,
        estado: input.estado,
        bairro: input.bairro ?? null,
        tradicao_principal: input.tradicao_principal ?? null,
        observacoes: input.observacoes ?? null,
        canal_contato: input.canal_contato,
        status: 'pendente',
      })
      .select(CAMPOS)
      .single();
    if (error || !data) {
      throw new RepositoryError('INDICACAO_CRIAR_FALHOU', error?.message ?? 'sem retorno', {
        cause: error,
      });
    }
    return Indicacao.fromRow(data);
  }

  async listMinhas(): Promise<Indicacao[]> {
    const { data, error } = await this.client
      .from('indicacoes_casa')
      .select(CAMPOS)
      .order('created_at', { ascending: false });
    if (error) {
      throw new RepositoryError('INDICACAO_LIST_MINHAS_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((r) => Indicacao.fromRow(r));
  }

  /**
   * Admin lista indicações filtradas por status. RLS exige `is_admin()`.
   */
  async listPorStatus(status: ModeracaoStatus): Promise<Indicacao[]> {
    const { data, error } = await this.client
      .from('indicacoes_casa')
      .select(CAMPOS)
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) {
      throw new RepositoryError('INDICACAO_LIST_STATUS_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((r) => Indicacao.fromRow(r));
  }

  async buscarPorId(id: string): Promise<Indicacao | null> {
    const { data, error } = await this.client
      .from('indicacoes_casa')
      .select(CAMPOS)
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw new RepositoryError('INDICACAO_BUSCAR_FALHOU', error.message, { cause: error });
    }
    return data ? Indicacao.fromRow(data) : null;
  }

  /**
   * Marca indicação como aprovada e vincula à casa criada (passo 1 do fluxo).
   * Apenas admin (RLS).
   */
  async marcarAprovada(
    id: string,
    casaId: string,
    moderadoPor: string,
  ): Promise<void> {
    const { error } = await this.client
      .from('indicacoes_casa')
      .update({
        status: 'aprovada',
        casa_id: casaId,
        moderado_por: moderadoPor,
        moderado_em: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      throw new RepositoryError('INDICACAO_MARCAR_APROVADA_FALHOU', error.message, {
        cause: error,
      });
    }
  }

  async marcarRecusada(id: string, motivo: string, moderadoPor: string): Promise<void> {
    const { error } = await this.client
      .from('indicacoes_casa')
      .update({
        status: 'recusada',
        moderado_por: moderadoPor,
        moderado_em: new Date().toISOString(),
        motivo_recusa: motivo,
      })
      .eq('id', id);
    if (error) {
      throw new RepositoryError('INDICACAO_MARCAR_RECUSADA_FALHOU', error.message, {
        cause: error,
      });
    }
  }
}
