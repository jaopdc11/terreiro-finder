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

  return (
    <div className="relative flex h-[calc(100vh-9rem)] flex-col">
      <div className="border-b border-border bg-card p-3">
        <div className="container flex flex-wrap items-center gap-2">
          <ChipsFiltros filtros={filtros} onChange={aplicar} />
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFiltrosAberto(true)}>
              Mais filtros
            </Button>
            <Button size="sm" onClick={() => setListaAberta(true)}>
              Ver em lista ({casas?.length ?? 0})
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex-1" data-testid="mapa-container">
        {error ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background p-6 text-center">
            <p className="font-display text-xl">Mapa indisponível agora.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenta recarregar — ou abre a lista pra continuar.
            </p>
            <Button className="mt-4" onClick={() => setListaAberta(true)}>
              Abrir lista
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="absolute inset-x-0 top-2 z-20 mx-auto w-fit rounded-full bg-card px-4 py-1 text-xs text-muted-foreground shadow">
            Carregando casas…
          </div>
        ) : null}

        {!error && casas && casas.length === 0 ? (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 text-center shadow-lg">
            <p className="font-display text-lg">
              Ainda não temos casa cadastrada que combine.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Conhece alguma? Indica pra gente.</strong>
            </p>
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
