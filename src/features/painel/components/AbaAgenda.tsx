import { useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';

const C =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';
const L =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';
import {
  useAdicionarEvento,
  useAgendaDaCasa,
  useEditarEvento,
  useRemoverEvento,
} from '@/features/agenda/hooks/useAgenda';
import type {
  DiaSemana,
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

type ModoForm =
  | { kind: 'fechado' }
  | { kind: 'giraRapida' }
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

  const adicionarGira = async (diaSemana: number, titulo: string, horario: string) => {
    try {
      await adicionar.mutateAsync({
        tipo: 'gira',
        titulo: titulo.trim() || 'Gira',
        diaSemana: diaSemana as DiaSemana,
        semanasDoMes: null,
        data: null,
        dataTexto: null,
        horarioInicio: horario || null,
        horarioFim: null,
        descricao: null,
      });
      fechar();
    } catch {
      /* erro exposto via adicionar.error */
    }
  };

  const renomearGira = async (evento: EventoAgenda, novoTitulo: string) => {
    try {
      await editar.mutateAsync({
        id: evento.id,
        input: {
          tipo: evento.tipo,
          titulo: novoTitulo.trim() || 'Gira',
          diaSemana: evento.diaSemana,
          semanasDoMes: evento.semanasDoMes ? [...evento.semanasDoMes] : null,
          data: evento.data,
          dataTexto: evento.dataTexto,
          horarioInicio: evento.horarioInicio,
          horarioFim: evento.horarioFim,
          descricao: evento.descricao,
        },
      });
    } catch {
      /* erro exposto via editar.error */
    }
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
      <div className="space-y-2">
        <p className="eyebrow">Agenda da casa</p>
        <p className="text-sm text-muted-foreground">
          Cadastre as <strong className="text-foreground">giras semanais</strong>{' '}
          (dia da semana recorrente) e{' '}
          <strong className="text-foreground">eventos</strong> pontuais (festas,
          batismos, toques). A agenda aparece na ficha pública da casa.
        </p>
      </div>

      {modo.kind === 'fechado' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setModo({ kind: 'giraRapida' })}
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
      ) : modo.kind === 'giraRapida' ? (
        <SelecionarDiaGira
          ocupado={submitting}
          erro={adicionar.error?.message ?? null}
          onSalvar={adicionarGira}
          onDetalhes={() => setModo({ kind: 'criar', tipo: 'gira' })}
          onCancelar={fechar}
        />
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
                onRenomear={(titulo) => void renomearGira(g, titulo)}
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
                onRenomear={null}
                ocupado={remover.isPending || submitting}
              />
            ))}
          </Secao>
        </>
      )}
    </div>
  );
}

function SelecionarDiaGira({
  ocupado,
  erro,
  onSalvar,
  onDetalhes,
  onCancelar,
}: {
  ocupado: boolean;
  erro: string | null;
  onSalvar(dia: number, titulo: string, horario: string): Promise<void>;
  onDetalhes(): void;
  onCancelar(): void;
}) {
  const [diaEscolhido, setDiaEscolhido] = useState<number | null>(null);
  const [nomeLinha, setNomeLinha] = useState('');
  const [horario, setHorario] = useState('');
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEscolherDia = (v: number) => {
    setDiaEscolhido(v);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (diaEscolhido === null) return;
    setSalvando(true);
    await onSalvar(diaEscolhido, nomeLinha, horario);
    setSalvando(false);
  };

  const nomeDia = diaEscolhido !== null ? (DIAS.find((d) => d.v === diaEscolhido)?.label ?? '') : '';

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-soft-sm">
      <p className="eyebrow">Nova gira — qual dia da semana?</p>

      <div className="flex flex-wrap gap-2">
        {DIAS.map((d) => (
          <button
            key={d.v}
            type="button"
            onClick={() => handleEscolherDia(d.v)}
            disabled={ocupado || salvando}
            className={
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ' +
              (diaEscolhido === d.v
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary hover:text-primary')
            }
          >
            {d.label}
          </button>
        ))}
      </div>

      {diaEscolhido !== null ? (
        <form onSubmit={(e) => void handleSalvar(e)} className="space-y-3 border-t border-border pt-3">
          <p className="text-xs font-medium text-foreground">
            Gira na <strong>{nomeDia}</strong> — detalhes opcionais:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              ref={inputRef}
              value={nomeLinha}
              onChange={(e) => setNomeLinha(e.target.value)}
              placeholder='Linha ou nome — ex.: "Pretos-Velhos"'
              disabled={salvando}
              className={C}
            />
            <input
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Horário de início"
              disabled={salvando}
              className={C}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Deixe em branco para salvar como "Gira" e definir depois.
          </p>
          {erro ? (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={salvando || ocupado}>
              {salvando ? 'Salvando…' : 'Salvar gira'}
            </Button>
            <button
              type="button"
              onClick={() => setDiaEscolhido(null)}
              disabled={salvando}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              ← Trocar dia
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">
          Clique no dia para confirmar e (opcionalmente) informar a linha e o horário.
        </p>
      )}

      {erro && diaEscolhido === null ? (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}

      <div className="flex items-center gap-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={onDetalhes}
          disabled={ocupado || salvando}
          className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          Adicionar com mais detalhes →
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={ocupado || salvando}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
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
    <section className="space-y-3">
      <h3 className="eyebrow">{titulo}</h3>
      {tem ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {children}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
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
  onRenomear,
  ocupado,
}: {
  evento: EventoAgenda;
  onEditar(): void;
  onRemover(): void;
  onRenomear: ((titulo: string) => void) | null;
  ocupado: boolean;
}) {
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState(evento.titulo);
  const inputTituloRef = useRef<HTMLInputElement>(null);

  const iniciarEdicaoTitulo = () => {
    setNovoTitulo(evento.titulo);
    setEditandoTitulo(true);
    setTimeout(() => inputTituloRef.current?.focus(), 30);
  };

  const confirmarTitulo = () => {
    setEditandoTitulo(false);
    if (novoTitulo.trim() !== evento.titulo) {
      onRenomear?.(novoTitulo);
    }
  };

  const cancelarTitulo = () => {
    setEditandoTitulo(false);
    setNovoTitulo(evento.titulo);
  };

  return (
    <li className="group flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        {editandoTitulo && onRenomear ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputTituloRef}
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmarTitulo();
                if (e.key === 'Escape') cancelarTitulo();
              }}
              disabled={ocupado}
              className="min-w-0 flex-1 border-0 border-b border-border bg-transparent pb-1 pt-0.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={confirmarTitulo}
              disabled={ocupado}
              title="Confirmar"
              className="text-xs font-bold text-primary hover:opacity-70 disabled:opacity-50"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={cancelarTitulo}
              title="Cancelar"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">{evento.titulo}</p>
            {onRenomear ? (
              <button
                type="button"
                onClick={iniciarEdicaoTitulo}
                title="Mudar linha"
                className="rounded p-0.5 text-muted-foreground/40 transition-colors hover:text-foreground focus:text-foreground group-hover:text-muted-foreground"
              >
                ✎
              </button>
            ) : null}
          </div>
        )}
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
          disabled={ocupado || editandoTitulo}
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemover}
          disabled={ocupado || editandoTitulo}
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

    // Para giras, título é opcional — default "Gira" se vazio.
    const tituloFinal = tipo === 'gira' ? (titulo.trim() || 'Gira') : titulo.trim();

    if (tipo !== 'gira' && tituloFinal.length === 0) {
      setErroLocal('Título é obrigatório.');
      return;
    }
    if (tipo === 'gira' && diaSemana === null) {
      setErroLocal('Escolha o dia da semana.');
      return;
    }
    if (tipo === 'evento' && !data && dataTexto.trim().length === 0) {
      setErroLocal('Informe a data ou um texto descritivo (ex.: "Fevereiro/2026").');
      return;
    }

    onSalvar({
      tipo,
      titulo: tituloFinal,
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

  const tituloCabecalho = inicial
    ? `Editar ${tipo === 'gira' ? 'gira' : 'evento'}`
    : `Nova ${tipo === 'gira' ? 'gira semanal' : 'ocasião'}`;

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-soft-sm"
    >
      <p className="eyebrow">{tituloCabecalho}</p>

      <div>
        <label htmlFor="ag-titulo" className={L}>
          {tipo === 'gira' ? 'Nome da gira (opcional)' : 'Título'}
        </label>
        <input
          id="ag-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={
            tipo === 'gira'
              ? 'Ex.: Gira de Pretos-Velhos — vazio usa "Gira"'
              : 'Ex.: Festa de Iemanjá'
          }
          required={tipo !== 'gira'}
          className={C}
        />
      </div>

      {tipo === 'gira' ? (
        <>
          <div>
            <label htmlFor="ag-dia" className={L}>Dia da semana</label>
            <select
              id="ag-dia"
              value={diaSemana ?? ''}
              onChange={(e) =>
                setDiaSemana(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              <option value="">Selecione…</option>
              {DIAS.map((d) => (
                <option key={d.v} value={d.v}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className={L}>Semanas do mês (opcional)</p>
            <p className="mb-3 text-xs text-muted-foreground">
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
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="ag-data" className={L}>Data (se houver)</label>
            <input
              id="ag-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={C}
            />
          </div>
          <div>
            <label htmlFor="ag-data-texto" className={L}>Ou descrição</label>
            <input
              id="ag-data-texto"
              value={dataTexto}
              onChange={(e) => setDataTexto(e.target.value)}
              placeholder='Ex.: "Fevereiro/2026"'
              className={C}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="ag-hi" className={L}>Início (opcional)</label>
          <input
            id="ag-hi"
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className={C}
          />
        </div>
        <div>
          <label htmlFor="ag-hf" className={L}>Fim (opcional)</label>
          <input
            id="ag-hf"
            type="time"
            value={horarioFim}
            onChange={(e) => setHorarioFim(e.target.value)}
            className={C}
          />
        </div>
      </div>

      <div>
        <label htmlFor="ag-desc" className={L}>Descrição (opcional)</label>
        <textarea
          id="ag-desc"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder='Ex.: "Vir de branco. Traga uma vela."'
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {erroLocal || erro ? (
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
