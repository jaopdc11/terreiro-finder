import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
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
  const [casaAtivaId, setCasaAtivaId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());
  const totalCasas = casas?.length ?? 0;

  // Quando casa ativa muda, scrolla o card até a visão (na aside).
  useEffect(() => {
    if (!casaAtivaId) return;
    const el = cardRefs.current.get(casaAtivaId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [casaAtivaId]);

  return (
    <div className="container h-[calc(100vh-3.5rem)] px-0">
      <div className="flex h-full flex-col border-x border-border md:flex-row">
      {/* ASIDE — desktop: lista lateral sempre visível */}
      <aside className="hidden w-full flex-col border-r border-border bg-card/40 md:flex md:w-[24rem] md:max-w-[24rem]">
        <header className="border-b border-border bg-background px-6 py-5">
          <p className="eyebrow eyebrow-ornado inline-flex items-center">
            Mapa · Itajaí
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {totalCasas}{' '}
              <span className="font-normal text-muted-foreground">
                {totalCasas === 1 ? 'casa' : 'casas'}
              </span>
            </h1>
            {isLoading ? (
              <span className="text-xs text-muted-foreground">
                atualizando…
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtros.estaVazio()
              ? 'Todas as casas cadastradas em Itajaí.'
              : 'Resultados para os filtros selecionados.'}
          </p>
        </header>

        <div className="border-b border-border bg-background px-6 py-3">
          <ChipsFiltros filtros={filtros} onChange={aplicar} />
          <button
            type="button"
            onClick={() => setFiltrosAberto(true)}
            className="mt-3 text-xs font-medium text-foreground hover:text-primary"
          >
            + Mais filtros
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="p-6">
              <p className="eyebrow">Erro</p>
              <p className="mt-2 text-base font-semibold">
                Não foi possível carregar as casas.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente recarregar a página.
              </p>
            </div>
          ) : isLoading ? (
            <SkeletonCards />
          ) : casas && casas.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-border">
              {(casas ?? []).map((casa, idx) => {
                const ativa = casaAtivaId === casa.id;
                return (
                  <li
                    key={casa.id}
                    ref={(el) => {
                      cardRefs.current.set(casa.id, el);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setCasaAtivaId(casa.id)}
                      aria-pressed={ativa}
                      className={
                        'group relative block w-full border-l-2 px-6 py-5 text-left transition-all hover:bg-background ' +
                        (ativa
                          ? 'border-primary bg-background pl-7'
                          : 'border-transparent hover:border-primary/60 hover:pl-7')
                      }
                    >
                      <div className="flex items-baseline gap-3">
                        <span
                          className={
                            'font-mono text-xs ' +
                            (ativa ? 'text-primary' : 'text-muted-foreground')
                          }
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                            {casa.tradicaoPrincipal}
                            {casa.estaVerificada() ? (
                              <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                                <span
                                  aria-hidden="true"
                                  className="inline-block h-1 w-1 rounded-full bg-primary"
                                />
                                Verificada
                              </span>
                            ) : null}
                          </p>
                          <h3
                            className={
                              'mt-1 text-base font-semibold tracking-tight transition-colors ' +
                              (ativa
                                ? 'text-primary'
                                : 'text-foreground group-hover:text-primary')
                            }
                          >
                            {casa.nome}
                          </h3>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {casa.bairro ? `${casa.bairro} · ` : ''}
                            {casa.cidade}
                          </p>
                          {casa.sacerdoteNome ? (
                            <p className="mt-1 text-sm text-foreground/75">
                              com{' '}
                              <span className="display-serif italic text-foreground">
                                {casa.sacerdoteNome}
                              </span>
                            </p>
                          ) : null}
                          <div className="mt-3">
                            <BadgesAbertura casa={casa} />
                          </div>

                          {ativa ? (
                            <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs">
                              <Link
                                to={`/casa/${casa.slug.toString()}`}
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                Ver detalhes
                                <span aria-hidden="true">→</span>
                              </Link>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground">
                                Mostrando no mapa
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <span
                          aria-hidden="true"
                          className={
                            'self-center transition-opacity ' +
                            (ativa
                              ? 'text-primary opacity-100'
                              : 'text-muted-foreground opacity-0 group-hover:opacity-100')
                          }
                        >
                          ●
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* MOBILE — barra topo + botão lista */}
      <div className="border-b border-border bg-background/85 backdrop-blur md:hidden">
        <div className="container flex flex-wrap items-center gap-2 py-3">
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
              Lista
              <span className="ml-1 rounded bg-background/20 px-1.5 py-0.5 font-mono text-[11px]">
                {totalCasas}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* MAPA — sempre presente; flex-1 ocupa o resto */}
      <div className="relative flex-1" data-testid="mapa-container">
        {error ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 p-6 text-center">
            <p className="eyebrow">Erro</p>
            <p className="mt-3 text-2xl font-semibold">Mapa indisponível.</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Tente recarregar — ou use a lista lateral para continuar.
            </p>
          </div>
        ) : null}

        <MapaCasas
          casas={casas ?? []}
          casaAtivaId={casaAtivaId}
          onPopupFechado={() => setCasaAtivaId(null)}
        />
      </div>

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

function SkeletonCards() {
  return (
    <ul className="divide-y divide-border">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="animate-pulse px-6 py-5">
          <div className="flex items-baseline gap-3">
            <span className="h-3 w-4 rounded bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-16 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <p className="eyebrow">Sem resultado</p>
      <p className="mt-3 text-lg font-semibold text-foreground">
        Nenhuma casa combina com esses filtros.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Tente reduzir os filtros, ou indique uma casa que você conhece.
      </p>
      <Link
        to="/indicar"
        className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
      >
        Indicar uma casa
      </Link>
    </div>
  );
}
