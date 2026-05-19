import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';

export const tipoAgendaSchema = z.enum(['gira', 'evento']);
export type TipoAgenda = z.infer<typeof tipoAgendaSchema>;

/** 0=domingo, 1=segunda, ..., 6=sábado. */
export const diaSemanaSchema = z
  .number()
  .int()
  .min(0)
  .max(6);
export type DiaSemana = z.infer<typeof diaSemanaSchema>;

const horaSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);

/** Row crua vinda do Postgres (snake_case). */
export const eventoAgendaRowSchema = z.object({
  id: z.string().uuid(),
  casa_id: z.string().uuid(),
  tipo: tipoAgendaSchema,
  titulo: z.string().min(1),
  dia_semana: z.number().int().min(0).max(6).nullable(),
  semanas_do_mes: z.array(z.number().int().min(1).max(5)).nullable(),
  data: z.string().nullable(), // ISO date 'YYYY-MM-DD'
  data_texto: z.string().nullable(),
  horario_inicio: horaSchema.nullable(),
  horario_fim: horaSchema.nullable(),
  descricao: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EventoAgendaRow = z.infer<typeof eventoAgendaRowSchema>;

/** Input pra criar/editar via painel. */
export interface EventoAgendaInput {
  tipo: TipoAgenda;
  titulo: string;
  /** Obrigatório se tipo='gira'. */
  diaSemana: DiaSemana | null;
  /** Pra giras com ciclo mensal. Null/[] = gira fixa (toda semana). */
  semanasDoMes: ReadonlyArray<number> | null;
  /** Pelo menos um (data ou dataTexto) se tipo='evento'. */
  data: string | null;
  dataTexto: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  descricao: string | null;
}

const NOMES_DIAS: ReadonlyArray<string> = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

/**
 * Evento da agenda da casa — gira semanal recorrente ou evento pontual.
 * Imutável; mutações retornam nova instância via {@link com}.
 */
export class EventoAgenda {
  private constructor(
    readonly id: string,
    readonly casaId: string,
    readonly tipo: TipoAgenda,
    readonly titulo: string,
    readonly diaSemana: DiaSemana | null,
    readonly semanasDoMes: ReadonlyArray<number> | null,
    readonly data: string | null,
    readonly dataTexto: string | null,
    readonly horarioInicio: string | null,
    readonly horarioFim: string | null,
    readonly descricao: string | null,
  ) {}

  static fromRow(raw: unknown): EventoAgenda {
    const r = eventoAgendaRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'EVENTO_AGENDA_ROW_INVALIDA',
        `Row de agenda inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row = r.data;
    return new EventoAgenda(
      row.id,
      row.casa_id,
      row.tipo,
      row.titulo,
      row.dia_semana as DiaSemana | null,
      row.semanas_do_mes
        ? Object.freeze([...row.semanas_do_mes].sort((a, b) => a - b))
        : null,
      row.data,
      row.data_texto,
      row.horario_inicio,
      row.horario_fim,
      row.descricao,
    );
  }

  ehGira(): boolean {
    return this.tipo === 'gira';
  }

  ehEvento(): boolean {
    return this.tipo === 'evento';
  }

  /** Retorna true se o evento já passou (eventos com data passada são ocultos). */
  jaPassou(hoje: Date = new Date()): boolean {
    if (this.tipo !== 'evento' || !this.data) return false;
    const hojeIso = hoje.toISOString().slice(0, 10);
    return this.data < hojeIso;
  }

  /**
   * Texto humano do "quando":
   *   gira sem ciclo            → "Toda quarta às 19h"
   *   gira com semanas_do_mes   → "1ª e 3ª segunda às 19h"
   *   evento c/ data            → "02/02/2026 às 19h"
   *   evento c/ data_texto      → "Fevereiro/2026"
   */
  descricaoQuando(): string {
    if (this.tipo === 'gira' && this.diaSemana !== null) {
      const dia = NOMES_DIAS[this.diaSemana] ?? '';
      const prefixo = this.semanasDoMes && this.semanasDoMes.length > 0
        ? `${listarOrdinais(this.semanasDoMes)} ${dia.toLowerCase()}`
        : `Toda ${dia.toLowerCase()}`;
      return this.horarioInicio
        ? `${prefixo} às ${formataHora(this.horarioInicio)}`
        : prefixo;
    }
    if (this.tipo === 'evento') {
      const quando = this.data ? formataData(this.data) : (this.dataTexto ?? '');
      return this.horarioInicio
        ? `${quando} às ${formataHora(this.horarioInicio)}`
        : quando;
    }
    return '';
  }

  /** Janela de horário formatada: "19h às 22h" / "19h" / "". */
  descricaoHorario(): string {
    if (!this.horarioInicio) return '';
    const inicio = formataHora(this.horarioInicio);
    if (!this.horarioFim) return inicio;
    return `${inicio} às ${formataHora(this.horarioFim)}`;
  }
}

/** [1] → "1ª"; [1,3] → "1ª e 3ª"; [1,2,4] → "1ª, 2ª e 4ª". */
function listarOrdinais(nums: ReadonlyArray<number>): string {
  const ord = (n: number) => `${n}ª`;
  if (nums.length === 0) return '';
  if (nums.length === 1) return ord(nums[0]!);
  if (nums.length === 2) return `${ord(nums[0]!)} e ${ord(nums[1]!)}`;
  const inicio = nums.slice(0, -1).map(ord).join(', ');
  return `${inicio} e ${ord(nums[nums.length - 1]!)}`;
}

/** "19:00" → "19h"; "19:30" → "19h30". */
function formataHora(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h)) return hhmm;
  if (m === 0 || Number.isNaN(m)) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/** "2026-02-02" → "02/02/2026". */
function formataData(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}
