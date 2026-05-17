import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';

interface Props {
  casas: ReadonlyArray<Casa>;
  aberto: boolean;
  onFechar(): void;
}

export function ListaOverlay({ casas, aberto, onFechar }: Props) {
  useTeclaEsc(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lista-titulo"
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onFechar}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border/60 bg-card p-6 shadow-warm-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="lista-titulo" className="font-display text-2xl">
            Casas{' '}
            <span className="text-base font-normal text-muted-foreground">
              ({casas.length})
            </span>
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar lista"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-terra-areia-claro/50 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {casas.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-background/40 p-8 text-center">
            <p className="font-display text-lg">
              Não achamos casa que combine com esses filtros.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenta menos filtros, ou indique uma casa que você conhece.
            </p>
            <Link
              to="/indicar"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-warm-sm hover:bg-terra-pemba-escuro"
            >
              Indicar uma casa
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {casas.map((casa) => (
              <li key={casa.id}>
                <Link
                  to={`/casa/${casa.slug.toString()}`}
                  className="card-surface card-surface-hover block p-4"
                >
                  <h3 className="font-display text-lg leading-tight">
                    {casa.nome}
                  </h3>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {casa.tradicaoPrincipal}
                    {casa.bairro ? ` · ${casa.bairro}` : ''}
                    {casa.cidade ? ` · ${casa.cidade}` : ''}
                  </p>
                  {casa.sacerdoteNome ? (
                    <p className="mt-1.5 text-sm text-foreground/80">
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
  );
}
