import { useState } from 'react';
import { ChipsFiltros } from '../components/ChipsFiltros';
import { FiltrosOverlay } from '../components/FiltrosOverlay';
import { ListaOverlay } from '../components/ListaOverlay';
import { MapaCasas } from '../components/MapaCasas';
import { useFiltros } from '../hooks/useFiltros';
import { useCasasFiltradas } from '../hooks/useCasasFiltradas';

export function Buscar() {
  const { filtros, aplicar } = useFiltros();
  const { data: casas, isLoading, error } = useCasasFiltradas(filtros);
  const [filtrosAberto, setFiltrosAberto] = useState(false);
  const [listaAberta, setListaAberta] = useState(false);
  const totalCasas = casas?.length ?? 0;

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-foreground bg-background">
        <div className="container flex flex-wrap items-stretch gap-0 divide-x divide-foreground/10 border-x border-foreground/10">
          <div className="flex flex-1 flex-wrap items-center gap-2 px-4 py-3">
            <ChipsFiltros filtros={filtros} onChange={aplicar} />
          </div>
          <button
            type="button"
            onClick={() => setFiltrosAberto(true)}
            className="flex items-center justify-center px-5 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Filtros
          </button>
          <button
            type="button"
            onClick={() => setListaAberta(true)}
            className="flex items-center gap-3 bg-foreground px-5 text-xs font-semibold uppercase tracking-wider text-background transition-colors hover:bg-primary"
          >
            <span>Lista</span>
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center bg-background px-2 font-mono text-[11px] text-foreground">
              {totalCasas}
            </span>
          </button>
        </div>
      </div>

      <div className="relative flex-1" data-testid="mapa-container">
        {error ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background p-6 text-center">
            <p className="eyebrow text-destructive">Erro</p>
            <p className="mt-4 font-display text-3xl">
              Mapa indisponível agora.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Tenta recarregar — ou abre a lista pra continuar.
            </p>
            <button
              onClick={() => setListaAberta(true)}
              className="mt-6 border border-foreground bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background hover:bg-primary"
            >
              Abrir lista
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="absolute inset-x-0 top-3 z-20 mx-auto w-fit border border-foreground bg-background px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground">
            Carregando casas…
          </div>
        ) : null}

        {!error && casas && casas.length === 0 ? (
          <div className="absolute left-1/2 top-1/2 z-10 w-[min(92%,32rem)] -translate-x-1/2 -translate-y-1/2 border border-foreground bg-background p-8 text-center">
            <p className="eyebrow text-muted-foreground">Sem resultado</p>
            <p className="mt-4 font-display text-3xl leading-tight">
              Nenhuma casa combina com esses filtros.
            </p>
            <p className="mt-3 text-sm text-foreground/80">
              Tenta menos filtros, ou indica uma casa que você conhece — a
              comunidade cresce com isso.
            </p>
            <a
              href="/indicar"
              className="mt-6 inline-block border border-foreground bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background hover:bg-primary"
            >
              Indicar uma casa
            </a>
          </div>
        ) : null}

        <MapaCasas casas={casas ?? []} />
      </div>

      <FiltrosOverlay
        filtros={filtros}
        aberto={filtrosAberto}
        onFechar={() => setFiltrosAberto(false)}
        onAplicar={aplicar}
      />
      <ListaOverlay
        casas={casas ?? []}
        aberto={listaAberta}
        onFechar={() => setListaAberta(false)}
      />
    </div>
  );
}
