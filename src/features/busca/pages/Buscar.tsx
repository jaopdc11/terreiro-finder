import { useState } from 'react';
import { Button } from '@/shared/ui/button';
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
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex flex-wrap items-center gap-3 py-3">
          <ChipsFiltros filtros={filtros} onChange={aplicar} />
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltrosAberto(true)}
            >
              Filtros
            </Button>
            <Button size="sm" onClick={() => setListaAberta(true)}>
              Ver em lista
              <span className="ml-1 rounded bg-background/20 px-1.5 py-0.5 font-mono text-[11px]">
                {totalCasas}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex-1" data-testid="mapa-container">
        {error ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 p-6 text-center">
            <p className="eyebrow">Erro</p>
            <p className="mt-4 text-2xl font-semibold">Mapa indisponível.</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Tente recarregar ou abrir a lista para continuar.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => setListaAberta(true)}
            >
              Abrir lista
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="absolute inset-x-0 top-3 z-20 mx-auto w-fit rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            Carregando casas…
          </div>
        ) : null}

        {!error && casas && casas.length === 0 ? (
          <div className="absolute left-1/2 top-1/2 z-10 w-[min(92%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-7 text-center shadow-soft-lg">
            <p className="eyebrow">Sem resultado</p>
            <p className="mt-3 text-xl font-semibold text-foreground">
              Nenhuma casa combina com esses filtros.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenta menos filtros, ou indica uma casa que você conhece.
            </p>
            <a
              href="/indicar"
              className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
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
