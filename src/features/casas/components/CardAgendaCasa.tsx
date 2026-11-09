import { Calendar, Clock, CalendarX2 } from 'lucide-react';
import { useAgendaDaCasa } from '@/features/agenda/hooks/useAgenda';
import type { EventoAgenda } from '@/features/agenda/domain/EventoAgenda';
import { iconePorTitulo } from '@/features/agenda/domain/iconePorTitulo';

interface Props {
  casaId: string;
}

const DIAS_COMPLETO = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

const DIAS_CURTO = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const;

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

export function CardAgendaCasa({ casaId }: Props) {
  const { data: eventos } = useAgendaDaCasa(casaId);

  if (!eventos || eventos.length === 0) {
    return <AgendaVazia />;
  }

  const giras = eventos.filter((e) => e.ehGira());
  const eventosComData = eventos
    .filter((e) => e.ehEvento() && e.data && !e.jaPassou())
    .sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''));
  const eventosSemData = eventos.filter((e) => e.ehEvento() && !e.data);

  if (giras.length === 0 && eventosComData.length === 0 && eventosSemData.length === 0) {
    return <AgendaVazia />;
  }

  return (
    <div className="space-y-12">
      {giras.length > 0 ? <CalendarioSemanal giras={giras} /> : null}

      {(eventosComData.length > 0 || eventosSemData.length > 0) ? (
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Próximos eventos
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {eventosComData.map((e) => (
              <CartaoEvento key={e.id} evento={e} />
            ))}
            {eventosSemData.map((e) => (
              <CartaoEventoSemData key={e.id} evento={e} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  CALENDÁRIO SEMANAL                                             */
/* ─────────────────────────────────────────────────────────────── */

function CalendarioSemanal({ giras }: { giras: EventoAgenda[] }) {
  const porDia = new Map<number, EventoAgenda[]>();
  for (const g of giras) {
    if (g.diaSemana === null) continue;
    const lista = porDia.get(g.diaSemana) ?? [];
    lista.push(g);
    porDia.set(g.diaSemana, lista);
  }
  const semDia = giras.filter((g) => g.diaSemana === null);
  const diasComGira = [...porDia.entries()].sort(([a], [b]) => a - b);

  // Quando há 1-2 dias só, cards expandem full-width empilhados e as giras
  // dentro são espalhadas horizontalmente. 3+ dias volta pro grid em col.
  const expandido = diasComGira.length <= 2;
  const gridContainer = expandido
    ? 'grid-cols-1'
    : diasComGira.length === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : diasComGira.length === 4
        ? 'grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        Calendário semanal
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Giras e atividades recorrentes da casa.
      </p>

      {diasComGira.length > 0 ? (
        <div className={`mt-6 grid gap-3 ${gridContainer}`}>
          {diasComGira.map(([dia, girasNoDia]) => (
            <CartaoDia
              key={dia}
              dia={dia}
              giras={girasNoDia}
              expandido={expandido}
            />
          ))}
        </div>
      ) : null}

      {semDia.length > 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-border/60 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Dia da semana a confirmar
          </p>
          <ul className="mt-2 space-y-1.5">
            {semDia.map((g) => (
              <li key={g.id} className="text-sm text-foreground/70">
                · {g.titulo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CartaoDia({
  dia,
  giras,
  expandido,
}: {
  dia: number;
  giras: EventoAgenda[];
  expandido: boolean;
}) {
  // Quando expandido + múltiplas giras: layout horizontal interno.
  const girasGrid = expandido && giras.length > 1;
  const girasGridClass = girasGrid
    ? giras.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : giras.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : giras.length === 4
          ? 'grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    : '';

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-baseline justify-between border-b border-border/70 bg-terra-pemba/[0.04] px-4 py-3">
        <span className="text-sm font-bold uppercase tracking-wider text-terra-pemba">
          {DIAS_COMPLETO[dia] ?? DIAS_CURTO[dia]}
        </span>
        {giras.length > 1 ? (
          <span className="text-[10px] font-medium text-muted-foreground">
            {giras.length} giras
          </span>
        ) : null}
      </div>

      {girasGrid ? (
        <div className={`grid divide-x divide-y divide-border/50 ${girasGridClass}`}>
          {giras.map((g) => (
            <GiraNoDia key={g.id} gira={g} />
          ))}
        </div>
      ) : (
        <div className="flex-1 divide-y divide-border/50">
          {giras.map((g) => (
            <GiraNoDia key={g.id} gira={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function GiraNoDia({ gira }: { gira: EventoAgenda }) {
  const horario = gira.descricaoHorario();
  const semanas = gira.semanasDoMes;
  const recorrencia =
    semanas && semanas.length > 0
      ? semanas.map((n) => `${n}ª`).join(', ') + ' semana'
      : 'toda semana';
  const IconeGira = iconePorTitulo(gira.titulo);

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      {/* Ícone semântico da gira (lookup automático por keyword) */}
      <div
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-terra-pemba/10 text-terra-pemba"
      >
        <IconeGira size={14} strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-foreground">
          {gira.titulo}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {horario ? (
            <span className="inline-flex items-center gap-1 text-xs text-foreground/70">
              <Clock size={11} strokeWidth={2} className="text-terra-pemba" />
              {horario}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">{recorrencia}</span>
        </div>
        {gira.descricao ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {gira.descricao}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  CARTÕES DE EVENTO                                              */
/* ─────────────────────────────────────────────────────────────── */

function CartaoEvento({ evento }: { evento: EventoAgenda }) {
  const raw = evento.data ?? '';
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dia = m ? m[3] : '?';
  const mes = m ? (MESES[Number(m[2]) - 1] ?? '') : '';
  const horario = evento.descricaoHorario();
  const diaSemanaIdx = m
    ? new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`).getDay()
    : null;
  const diaSemanaNome = diaSemanaIdx !== null ? DIAS_COMPLETO[diaSemanaIdx] : null;

  return (
    <article className="card-soft card-soft-hover flex items-stretch overflow-hidden">
      <div className="flex w-20 flex-none flex-col items-center justify-center self-stretch bg-terra-pemba px-3 py-4 text-center text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
          {mes}
        </p>
        <p className="text-3xl font-bold leading-none">{dia}</p>
        {diaSemanaNome ? (
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/70">
            {diaSemanaNome.slice(0, 3)}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-sm font-semibold leading-tight text-foreground">
          {evento.titulo}
        </p>
        {horario ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} strokeWidth={2} />
            {horario}
          </p>
        ) : null}
        {evento.descricao ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {evento.descricao}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function CartaoEventoSemData({ evento }: { evento: EventoAgenda }) {
  return (
    <article className="flex items-stretch overflow-hidden rounded-md border border-dashed border-border bg-background/40">
      <div className="flex w-20 flex-none flex-col items-center justify-center self-stretch border-r border-dashed border-border px-3 py-4 text-center">
        <CalendarX2 size={20} strokeWidth={1.5} className="text-muted-foreground/70" />
        <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
          A definir
        </p>
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-sm font-semibold leading-tight text-foreground/80">
          {evento.titulo}
        </p>
        {evento.descricaoQuando() ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {evento.descricaoQuando()}
          </p>
        ) : null}
        {evento.descricao ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
            {evento.descricao}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  ESTADO VAZIO                                                   */
/* ─────────────────────────────────────────────────────────────── */

function AgendaVazia() {
  return (
    <div className="rounded-md border border-dashed border-border bg-background px-6 py-10 text-center">
      <Calendar size={24} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
      <p className="mt-3 text-base font-medium text-foreground">
        A casa ainda não publicou agenda.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Entre em contato pra saber dos próximos atendimentos.
      </p>
    </div>
  );
}
