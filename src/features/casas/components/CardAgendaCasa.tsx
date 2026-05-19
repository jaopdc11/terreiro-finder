import { useAgendaDaCasa } from '@/features/agenda/hooks/useAgenda';
import type { EventoAgenda } from '@/features/agenda/domain/EventoAgenda';

interface Props {
  casaId: string;
}

/**
 * Card "Agenda" na ficha pública: lista giras semanais e eventos.
 * Não renderiza nada se a casa não tem agenda cadastrada.
 *
 * Ordem:
 *  - giras: por dia da semana (0..6) — já vem ordenado do repository
 *  - eventos com data: ordem cronológica, eventos passados ocultos
 *  - eventos com só data_texto: ao final, marcados como "data a confirmar"
 */
export function CardAgendaCasa({ casaId }: Props) {
  const { data: eventos } = useAgendaDaCasa(casaId);

  if (!eventos || eventos.length === 0) return null;

  const giras = eventos.filter((e) => e.ehGira());
  const eventosComData = eventos
    .filter((e) => e.ehEvento() && e.data && !e.jaPassou())
    .sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''));
  const eventosSemData = eventos.filter(
    (e) => e.ehEvento() && !e.data,
  );

  if (giras.length === 0 && eventosComData.length === 0 && eventosSemData.length === 0) {
    return null;
  }

  return (
    <section className="card-soft p-6">
      <p className="text-sm font-semibold text-foreground">Agenda</p>

      {giras.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Giras regulares
          </p>
          <ul className="mt-2 space-y-1.5">
            {giras.map((g) => (
              <LinhaEvento key={g.id} evento={g} />
            ))}
          </ul>
        </div>
      ) : null}

      {eventosComData.length > 0 ? (
        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Próximos eventos
          </p>
          <ul className="mt-2 space-y-1.5">
            {eventosComData.map((e) => (
              <LinhaEvento key={e.id} evento={e} />
            ))}
          </ul>
        </div>
      ) : null}

      {eventosSemData.length > 0 ? (
        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Sem data confirmada
          </p>
          <ul className="mt-2 space-y-1.5">
            {eventosSemData.map((e) => (
              <LinhaEvento key={e.id} evento={e} comAviso />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function LinhaEvento({
  evento,
  comAviso,
}: {
  evento: EventoAgenda;
  comAviso?: boolean;
}) {
  return (
    <li className="text-sm leading-snug">
      <p className="font-medium text-foreground">{evento.titulo}</p>
      <p className="text-xs text-muted-foreground">
        {evento.descricaoQuando()}
        {comAviso ? ' · data a confirmar' : null}
      </p>
      {evento.descricao ? (
        <p className="mt-0.5 text-xs text-muted-foreground/85">{evento.descricao}</p>
      ) : null}
    </li>
  );
}
