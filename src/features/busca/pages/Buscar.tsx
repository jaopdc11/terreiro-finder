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
    <div className="relative flex h-[calc(100vh-5rem)] flex-col">
      <div className="border-b border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex flex-wrap items-center gap-3 py-3">
          <ChipsFiltros filtros={filtros} onChange={aplicar} />
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltrosAberto(true)}
            >
              Mais filtros
            </Button>
            <Button size="sm" onClick={() => setListaAberta(true)}>
              Ver em lista
              <span
                className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-xs"
                aria-label={`${totalCasas} casas`}
              >
                {totalCasas}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex-1" data-testid="mapa-container">
        {error ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 p-6 text-center">
            <p className="font-display text-2xl">Mapa indisponível agora.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenta recarregar — ou abre a lista pra continuar.
            </p>
            <Button className="mt-4" onClick={() => setListaAberta(true)}>
              Abrir lista
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="absolute inset-x-0 top-3 z-20 mx-auto w-fit rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs text-muted-foreground shadow-warm">
            Carregando casas…
          </div>
        ) : null}

        {!error && casas && casas.length === 0 ? (
          <div className="absolute left-1/2 top-1/2 z-10 w-[min(92%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-warm-lg">
            <p className="font-display text-xl">
              Ainda não temos casa cadastrada que combine.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Conhece alguma? Indica pra gente — a comunidade cresce com isso.
            </p>
            <a
              href="/indicar"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-warm-sm hover:bg-terra-pemba-escuro"
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
