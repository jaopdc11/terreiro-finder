import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import type { ModeracaoStatus } from '@/features/indicacao/schemas';
import { Reivindicacao } from '../domain/Reivindicacao';
import type { NovaReivindicacaoInput } from '../schemas';

const CAMPOS = `
  id, user_id, casa_id, observacoes, status, moderado_por, moderado_em,
  motivo_recusa, created_at
`.trim();

export class ReivindicacoesRepository {
  constructor(private readonly client: SupabaseClient) {}

  /** Visitante logado pede reivindicação de uma casa. Nasce status='pendente'. */
  async criarComoVisitante(
    userId: string,
    input: NovaReivindicacaoInput,
  ): Promise<Reivindicacao> {
    const { data, error } = await this.client
      .from('reivindicacoes')
      .insert({
        user_id: userId,
        casa_id: input.casa_id,
        observacoes: input.observacoes,
        status: 'pendente',
      })
      .select(CAMPOS)
      .single();
    if (error || !data) {
      throw new RepositoryError(
        'REIVINDICACAO_CRIAR_FALHOU',
        error?.message ?? 'sem retorno',
        { cause: error },
      );
    }
    return Reivindicacao.fromRow(data);
  }

  async listMinhas(): Promise<Reivindicacao[]> {
    const { data, error } = await this.client
      .from('reivindicacoes')
      .select(CAMPOS)
      .order('created_at', { ascending: false });
    if (error) {
      throw new RepositoryError('REIVINDICACAO_LIST_MINHAS_FALHOU', error.message, {
        cause: error,
      });
    }
    return (data ?? []).map((r) => Reivindicacao.fromRow(r));
  }

  /** Admin lista reivindicações por status. RLS exige is_admin(). */
  async listPorStatus(status: ModeracaoStatus): Promise<Reivindicacao[]> {
    const { data, error } = await this.client
      .from('reivindicacoes')
      .select(CAMPOS)
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) {
      throw new RepositoryError('REIVINDICACAO_LIST_STATUS_FALHOU', error.message, {
        cause: error,
      });
    }
    return (data ?? []).map((r) => Reivindicacao.fromRow(r));
  }

  async buscarPorId(id: string): Promise<Reivindicacao | null> {
    const { data, error } = await this.client
      .from('reivindicacoes')
      .select(CAMPOS)
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw new RepositoryError('REIVINDICACAO_BUSCAR_FALHOU', error.message, {
        cause: error,
      });
    }
    return data ? Reivindicacao.fromRow(data) : null;
  }

  async marcarAprovada(id: string, moderadoPor: string): Promise<void> {
    const { error } = await this.client
      .from('reivindicacoes')
      .update({
        status: 'aprovada',
        moderado_por: moderadoPor,
        moderado_em: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      throw new RepositoryError('REIVINDICACAO_MARCAR_APROVADA_FALHOU', error.message, {
        cause: error,
      });
    }
  }

  async marcarRecusada(id: string, motivo: string, moderadoPor: string): Promise<void> {
    const { error } = await this.client
      .from('reivindicacoes')
      .update({
        status: 'recusada',
        moderado_por: moderadoPor,
        moderado_em: new Date().toISOString(),
        motivo_recusa: motivo,
      })
      .eq('id', id);
    if (error) {
      throw new RepositoryError('REIVINDICACAO_MARCAR_RECUSADA_FALHOU', error.message, {
        cause: error,
      });
    }
  }
}
