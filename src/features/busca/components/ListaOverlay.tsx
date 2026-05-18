import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';

interface Props {
  casas: ReadonlyArray<Casa>;
  aberto: boolean;
  onFechar(): void;
}

/** Drawer lateral à direita, com itens da lista em estilo Linear. */
export function ListaOverlay({ casas, aberto, onFechar }: Props) {
  useTeclaEsc(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lista-titulo"
      className="fixed inset-0 z-[2000] flex justify-end bg-foreground/30 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="eyebrow">Lista</p>
            <h2 id="lista-titulo" className="mt-1 text-xl font-semibold">
              {casas.length}{' '}
              <span className="font-normal text-muted-foreground">
                {casas.length === 1 ? 'casa' : 'casas'}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar lista"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {casas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="eyebrow">Sem resultado</p>
              <p className="mt-3 text-lg font-semibold">
                Nenhuma casa combina com esses filtros.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tenta menos filtros, ou indica uma casa que você conhece.
              </p>
              <Link
                to="/indicar"
                className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                Indicar uma casa
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {casas.map((casa) => (
                <li key={casa.id}>
                  <Link
                    to={`/casa/${casa.slug.toString()}`}
                    className="block px-6 py-4 transition-colors hover:bg-secondary"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {casa.tradicaoPrincipal}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-foreground">
                      {casa.nome}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {casa.bairro ? `${casa.bairro} · ` : ''}
                      {casa.cidade}
                    </p>
                    {casa.sacerdoteNome ? (
                      <p className="mt-1 text-sm text-foreground/80">
                        com {casa.sacerdoteNome}
                      </p>
                    ) : null}
                    <div className="mt-3">
                      <BadgesAbertura casa={casa} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
