import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';

interface Props {
  casas: ReadonlyArray<Casa>;
  aberto: boolean;
  onFechar(): void;
}

export function ListaOverlay({ casas, aberto, onFechar }: Props) {
  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lista-titulo"
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 sm:items-center"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-card p-6 sm:rounded-lg">
        <div className="flex items-center justify-between">
          <h2 id="lista-titulo" className="font-display text-2xl">
            Casas ({casas.length})
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar lista"
            className="text-muted-foreground hover:text-primary"
          >
            ✕
          </button>
        </div>

        {casas.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-muted-foreground">
              Não achamos casa que combine com esses filtros.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tenta menos filtros, ou indique uma casa que você conhece.
            </p>
            <Link
              to="/indicar"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Indicar uma casa
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {casas.map((casa) => (
              <li key={casa.id}>
                <Link
                  to={`/casa/${casa.slug.toString()}`}
                  className="block rounded-lg border border-border bg-background p-4 hover:bg-muted"
                >
                  <h3 className="font-display text-lg">{casa.nome}</h3>
                  <p className="text-xs text-muted-foreground">
                    {casa.tradicaoPrincipal}
                    {casa.bairro ? ` · ${casa.bairro}` : ''}
                    {casa.cidade ? ` · ${casa.cidade}` : ''}
                  </p>
                  {casa.sacerdoteNome ? (
                    <p className="mt-1 text-sm">com {casa.sacerdoteNome}</p>
                  ) : null}
                  <div className="mt-2">
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
