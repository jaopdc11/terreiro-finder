import { Link } from 'react-router-dom';
import type { Casa } from '@/features/casas/domain/Casa';
import { BadgesAbertura } from '@/features/casas/components/BadgesAbertura';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';

interface Props {
  casas: ReadonlyArray<Casa>;
  aberto: boolean;
  onFechar(): void;
}

/**
 * Painel lateral direito com a lista de casas. Sem sombra; entra firme
 * com borda esquerda grossa. Listagem em estilo editorial — divisores
 * finos entre itens, tipografia hierárquica.
 */
export function ListaOverlay({ casas, aberto, onFechar }: Props) {
  useTeclaEsc(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lista-titulo"
      className="fixed inset-0 z-[2000] flex justify-end bg-foreground/40"
      onClick={onFechar}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col border-l-2 border-foreground bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-foreground px-6 py-5">
          <div>
            <p className="eyebrow text-muted-foreground">Lista</p>
            <h2 id="lista-titulo" className="mt-1 font-display text-3xl leading-tight">
              {casas.length}{' '}
              <span className="text-base font-normal text-muted-foreground">
                {casas.length === 1 ? 'casa' : 'casas'}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar lista"
            className="h-10 w-10 border border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {casas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="eyebrow text-muted-foreground">Sem resultado</p>
              <p className="mt-4 font-display text-2xl leading-snug">
                Nenhuma casa combina com esses filtros.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Tenta menos filtros, ou indica uma casa que você conhece.
              </p>
              <Link
                to="/indicar"
                className="mt-6 inline-block border border-foreground bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-wider text-background hover:bg-primary"
              >
                Indicar uma casa
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-foreground/10">
              {casas.map((casa, idx) => (
                <li key={casa.id}>
                  <Link
                    to={`/casa/${casa.slug.toString()}`}
                    className="block px-6 py-5 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className="eyebrow text-primary">
                          {casa.tradicaoPrincipal}
                        </p>
                        <h3 className="mt-1 font-display text-xl leading-tight">
                          {casa.nome}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {casa.bairro ? `${casa.bairro} · ` : ''}
                          {casa.cidade}
                        </p>
                        {casa.sacerdoteNome ? (
                          <p className="mt-1 text-sm text-foreground/75">
                            com {casa.sacerdoteNome}
                          </p>
                        ) : null}
                        <div className="mt-3">
                          <BadgesAbertura casa={casa} />
                        </div>
                      </div>
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
