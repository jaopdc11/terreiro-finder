import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';
import { EventoAgenda, type EventoAgendaInput } from '../domain/EventoAgenda';

const eventoApiSchema = z.object({
  id: z.string().uuid(),
  casaId: z.string().uuid(),
  tipo: z.enum(['gira', 'evento']),
  titulo: z.string(),
  diaSemana: z.number().int().nullable(),
  semanasDoMes: z.array(z.number().int()).nullable(),
  data: z.string().nullable(),
  dataTexto: z.string().nullable(),
  horarioInicio: z.string().nullable(),
  horarioFim: z.string().nullable(),
  descricao: z.string().nullable(),
});

function eventoDaApi(raw: unknown): EventoAgenda {
  const e = eventoApiSchema.parse(raw);
  // A API não expõe datas de auditoria; a entidade não as usa.
  const agora = new Date(0).toISOString();
  return EventoAgenda.fromRow({
    id: e.id,
    casa_id: e.casaId,
    tipo: e.tipo,
    titulo: e.titulo,
    dia_semana: e.diaSemana,
    semanas_do_mes: e.semanasDoMes,
    data: e.data,
    data_texto: e.dataTexto,
    horario_inicio: e.horarioInicio,
    horario_fim: e.horarioFim,
    descricao: e.descricao,
    created_at: agora,
    updated_at: agora,
  });
}

/** Ordem da tela: giras (por dia) antes de eventos (por data). */
function ordenar(a: EventoAgenda, b: EventoAgenda): number {
  if (a.tipo !== b.tipo) return a.tipo === 'gira' ? -1 : 1;
  if (a.diaSemana !== b.diaSemana) return (a.diaSemana ?? 99) - (b.diaSemana ?? 99);
  return (a.data ?? '9999').localeCompare(b.data ?? '9999');
}

function paraPayload(input: EventoAgendaInput) {
  return {
    tipo: input.tipo,
    titulo: input.titulo,
    diaSemana: input.diaSemana,
    semanasDoMes: input.semanasDoMes && input.semanasDoMes.length > 0 ? [...input.semanasDoMes] : null,
    data: input.data,
    dataTexto: input.dataTexto,
    horarioInicio: input.horarioInicio,
    horarioFim: input.horarioFim,
    descricao: input.descricao,
  };
}

/** Agenda da casa. Leitura: quem vê a casa; escrita: gestor (a API decide). */
export class AgendaRepository {
  constructor(private readonly api: ApiClient) {}

  async listarDaCasa(casaId: string): Promise<EventoAgenda[]> {
    const data = await this.api.get(`/casas/${casaId}/agenda`);
    return z.array(z.unknown()).parse(data).map(eventoDaApi).sort(ordenar);
  }

  async criar(casaId: string, input: EventoAgendaInput): Promise<EventoAgenda> {
    return eventoDaApi(await this.api.post(`/casas/${casaId}/agenda`, paraPayload(input)));
  }

  async atualizar(id: string, input: EventoAgendaInput): Promise<EventoAgenda> {
    return eventoDaApi(await this.api.put(`/agenda/${id}`, paraPayload(input)));
  }

  async excluir(id: string): Promise<void> {
    await this.api.delete(`/agenda/${id}`);
  }
}
