import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  useAdicionarEvento,
  useAgendaDaCasa,
  useEditarEvento,
  useRemoverEvento,
} from '@/features/agenda/hooks/useAgenda';
import type {
  EventoAgenda,
  EventoAgendaInput,
  TipoAgenda,
} from '@/features/agenda/domain/EventoAgenda';

interface Props {
  casaId: string;
}

const DIAS = [
  { v: 0, label: 'Domingo' },
  { v: 1, label: 'Segunda' },
  { v: 2, label: 'Terça' },
  { v: 3, label: 'Quarta' },
  { v: 4, label: 'Quinta' },
  { v: 5, label: 'Sexta' },
  { v: 6, label: 'Sábado' },
] as const;

/** Estado do formulário: 'fechado' | criando(tipo) | editando(evento). */
type ModoForm =
  | { kind: 'fechado' }
  | { kind: 'criar'; tipo: TipoAgenda }
  | { kind: 'editar'; evento: EventoAgenda };

export function AbaAgenda({ casaId }: Props) {
  const { data: eventos, isLoading } = useAgendaDaCasa(casaId);
  const adicionar = useAdicionarEvento(casaId);
  const editar = useEditarEvento(casaId);
  const remover = useRemoverEvento(casaId);
  const [modo, setModo] = useState<ModoForm>({ kind: 'fechado' });

  const giras = (eventos ?? []).filter((e) => e.ehGira());
  const eventosLista = (eventos ?? []).filter((e) => e.ehEvento());

  const fechar = () => {
    setModo({ kind: 'fechado' });
    adicionar.reset();
    editar.reset();
  };

  const salvar = async (input: EventoAgendaInput) => {
    try {
      if (modo.kind === 'editar') {
        await editar.mutateAsync({ id: modo.evento.id, input });
      } else if (modo.kind === 'criar') {
        await adicionar.mutateAsync(input);
      }
      fechar();
    } catch {
      /* erro mostrado no form */
    }
  };

  const tipoAtual: TipoAgenda | null =
    modo.kind === 'criar' ? modo.tipo : modo.kind === 'editar' ? modo.evento.tipo : null;

  const submitting = adicionar.isPending || editar.isPending;
  const erroAtual =
    (modo.kind === 'editar' ? editar.error?.message : adicionar.error?.message) ?? null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Cadastre as <strong className="text-foreground">giras semanais</strong>{' '}
        (dia da semana recorrente) e <strong className="text-foreground">eventos</strong>{' '}
        pontuais (festas, batismos, toques). A agenda aparece na ficha pública
        da casa.
      </p>

      {modo.kind === 'fechado' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setModo({ kind: 'criar', tipo: 'gira' })}
          >
            + Gira semanal
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModo({ kind: 'criar', tipo: 'evento' })}
          >
            + Evento
          </Button>
        </div>
      ) : (
        <FormularioEvento
          key={modo.kind === 'editar' ? `edit-${modo.evento.id}` : `novo-${tipoAtual}`}
          tipo={tipoAtual!}
          inicial={modo.kind === 'editar' ? modo.evento : null}
          submitting={submitting}
          erro={erroAtual}
          onCancelar={fechar}
          onSalvar={salvar}
        />
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando agenda…</p>
      ) : (
        <>
          <Secao titulo="Giras semanais" vazio="Nenhuma gira cadastrada.">
            {giras.map((g) => (
              <ItemEvento
                key={g.id}
                evento={g}
                onEditar={() => setModo({ kind: 'editar', evento: g })}
                onRemover={() => remover.mutate(g)}
                ocupado={remover.isPending || submitting}
              />
            ))}
          </Secao>

          <Secao titulo="Eventos" vazio="Nenhum evento cadastrado.">
            {eventosLista.map((ev) => (
              <ItemEvento
                key={ev.id}
                evento={ev}
                onEditar={() => setModo({ kind: 'editar', evento: ev })}
                onRemover={() => remover.mutate(ev)}
                ocupado={remover.isPending || submitting}
              />
            ))}
          </Secao>
        </>
      )}
    </div>
  );
}

function Secao({
  titulo,
  vazio,
  children,
}: {
  titulo: string;
  vazio: string;
  children: React.ReactNode;
}) {
  const tem = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {titulo}
      </h3>
      {tem ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {children}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          {vazio}
        </p>
      )}
    </section>
  );
}

function ItemEvento({
  evento,
  onEditar,
  onRemover,
  ocupado,
}: {
  evento: EventoAgenda;
  onEditar(): void;
  onRemover(): void;
  ocupado: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{evento.titulo}</p>
        <p className="text-xs text-muted-foreground">{evento.descricaoQuando()}</p>
        {evento.descricao ? (
          <p className="mt-1 text-xs text-muted-foreground">{evento.descricao}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEditar}
          disabled={ocupado}
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemover}
          disabled={ocupado}
        >
          Remover
        </Button>
      </div>
    </li>
  );
}

function FormularioEvento({
  tipo,
  inicial,
  submitting,
  erro,
  onSalvar,
  onCancelar,
}: {
  tipo: TipoAgenda;
  inicial: EventoAgenda | null;
  submitting: boolean;
  erro: string | null;
  onSalvar(input: EventoAgendaInput): void;
  onCancelar(): void;
}) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [diaSemana, setDiaSemana] = useState<number | null>(
    inicial?.diaSemana ?? null,
  );
  const [semanasDoMes, setSemanasDoMes] = useState<number[]>(
    inicial?.semanasDoMes ? [...inicial.semanasDoMes] : [],
  );
  const [data, setData] = useState(inicial?.data ?? '');
  const [dataTexto, setDataTexto] = useState(inicial?.dataTexto ?? '');
  const [horarioInicio, setHorarioInicio] = useState(
    inicial?.horarioInicio?.slice(0, 5) ?? '',
  );
  const [horarioFim, setHorarioFim] = useState(
    inicial?.horarioFim?.slice(0, 5) ?? '',
  );
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const toggleSemana = (n: number) => {
    setSemanasDoMes((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal(null);

    if (titulo.trim().length === 0) {
      setErroLocal('Título é obrigatório.');
      return;
    }
    if (tipo === 'gira') {
      if (diaSemana === null) {
        setErroLocal('Escolha o dia da semana.');
        return;
      }
    } else {
      if (!data && dataTexto.trim().length === 0) {
        setErroLocal('Informe a data ou um texto descritivo (ex.: "Fevereiro/2026").');
        return;
      }
    }

    onSalvar({
      tipo,
      titulo: titulo.trim(),
      diaSemana: tipo === 'gira' ? (diaSemana as 0 | 1 | 2 | 3 | 4 | 5 | 6) : null,
      semanasDoMes:
        tipo === 'gira' && semanasDoMes.length > 0 ? semanasDoMes : null,
      data: tipo === 'evento' && data ? data : null,
      dataTexto: tipo === 'evento' && dataTexto.trim() ? dataTexto.trim() : null,
      horarioInicio: horarioInicio || null,
      horarioFim: horarioFim || null,
      descricao: descricao.trim() || null,
    });
  };

  const titulocabecalho = inicial
    ? `Editar ${tipo === 'gira' ? 'gira' : 'evento'}`
    : `Nova ${tipo === 'gira' ? 'gira semanal' : 'ocasião'}`;

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-md border border-border bg-card p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {titulocabecalho}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="ag-titulo">Título</Label>
        <Input
          id="ag-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={
            tipo === 'gira'
              ? 'Ex.: Gira de Pretos-Velhos'
              : 'Ex.: Festa de Iemanjá'
          }
          required
        />
      </div>

      {tipo === 'gira' ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="ag-dia">Dia da semana</Label>
            <select
              id="ag-dia"
              value={diaSemana ?? ''}
              onChange={(e) =>
                setDiaSemana(e.target.value === '' ? null : Number(e.target.value))
              }
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione…</option>
              {DIAS.map((d) => (
                <option key={d.v} value={d.v}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Semanas do mês (opcional)</Label>
            <p className="text-xs text-muted-foreground">
              Marque se essa gira só acontece em semanas específicas. Vazio = toda
              semana. Ex.: 1ª segunda do mês caboclo, 2ª segunda preto-velho.
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const ativa = semanasDoMes.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleSemana(n)}
                    className={
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
                      (ativa
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground')
                    }
                    aria-pressed={ativa}
                  >
                    {n}ª
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ag-data">Data (se houver)</Label>
            <Input
              id="ag-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ag-data-texto">Ou descrição</Label>
            <Input
              id="ag-data-texto"
              value={dataTexto}
              onChange={(e) => setDataTexto(e.target.value)}
              placeholder='Ex.: "Fevereiro/2026"'
            />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ag-hi">Início (opcional)</Label>
          <Input
            id="ag-hi"
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ag-hf">Fim (opcional)</Label>
          <Input
            id="ag-hf"
            type="time"
            value={horarioFim}
            onChange={(e) => setHorarioFim(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ag-desc">Descrição (opcional)</Label>
        <textarea
          id="ag-desc"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder='Ex.: "Vir de branco. Traga uma vela."'
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {(erroLocal || erro) ? (
        <p role="alert" className="text-sm text-destructive">
          {erroLocal ?? erro}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Salvar'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
