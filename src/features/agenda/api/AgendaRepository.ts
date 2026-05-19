import type { SupabaseClient } from '@supabase/supabase-js';
import { RepositoryError } from '@/shared/lib/errors';
import { EventoAgenda, type EventoAgendaInput } from '../domain/EventoAgenda';

const CAMPOS_SELECT =
  'id, casa_id, tipo, titulo, dia_semana, semanas_do_mes, data, data_texto, horario_inicio, horario_fim, descricao, created_at, updated_at';

/**
 * Acesso à tabela `casa_agenda`. RLS no banco garante:
 *  - SELECT público só pra casas aprovadas
 *  - INSERT/UPDATE/DELETE só pra dirigente da casa (ou admin via service-role)
 */
export class AgendaRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listarDaCasa(casaId: string): Promise<EventoAgenda[]> {
    const { data, error } = await this.client
      .from('casa_agenda')
      .select(CAMPOS_SELECT)
      .eq('casa_id', casaId)
      .order('tipo', { ascending: true })       // gira antes de evento
      .order('dia_semana', { ascending: true, nullsFirst: false })
      .order('data', { ascending: true, nullsFirst: false });
    if (error) {
      throw new RepositoryError('AGENDA_LIST_FALHOU', error.message, { cause: error });
    }
    return (data ?? []).map((r) => EventoAgenda.fromRow(r));
  }

  async criar(casaId: string, input: EventoAgendaInput): Promise<EventoAgenda> {
    const payload = paraPayload(casaId, input);
    const { data, error } = await this.client
      .from('casa_agenda')
      .insert(payload)
      .select(CAMPOS_SELECT)
      .single();
    if (error || !data) {
      throw new RepositoryError('AGENDA_CRIAR_FALHOU', error?.message ?? 'sem retorno', {
        cause: error,
      });
    }
    return EventoAgenda.fromRow(data);
  }

  async atualizar(id: string, input: EventoAgendaInput): Promise<EventoAgenda> {
    const payload = paraPayload(null, input);
    const { data, error } = await this.client
      .from('casa_agenda')
      .update(payload)
      .eq('id', id)
      .select(CAMPOS_SELECT)
      .single();
    if (error || !data) {
      throw new RepositoryError('AGENDA_ATUALIZAR_FALHOU', error?.message ?? 'sem retorno', {
        cause: error,
      });
    }
    return EventoAgenda.fromRow(data);
  }

  async excluir(id: string): Promise<void> {
    const { error } = await this.client.from('casa_agenda').delete().eq('id', id);
    if (error) {
      throw new RepositoryError('AGENDA_EXCLUIR_FALHOU', error.message, { cause: error });
    }
  }
}

function paraPayload(casaId: string | null, input: EventoAgendaInput) {
  const base = {
    tipo: input.tipo,
    titulo: input.titulo,
    dia_semana: input.diaSemana,
    semanas_do_mes:
      input.semanasDoMes && input.semanasDoMes.length > 0
        ? [...input.semanasDoMes]
        : null,
    data: input.data,
    data_texto: input.dataTexto,
    horario_inicio: input.horarioInicio,
    horario_fim: input.horarioFim,
    descricao: input.descricao,
  };
  return casaId ? { ...base, casa_id: casaId } : base;
}
