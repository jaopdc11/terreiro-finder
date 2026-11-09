import { Button } from '@/shared/ui/button';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';
import {
  CANDOMBLE_NACAO_LABEL,
  type CandombleNacao,
} from '@/features/casas/domain/blocoCandombleEnums';
import type { FiltrosBusca } from '../domain/FiltrosBusca';

const LINHAS_UMBANDA = [
  'caboclo',
  'pretovelho',
  'crianca',
  'marinheiro',
  'exu',
  'pombagira',
];
const NACOES_CANDOMBLE: CandombleNacao[] = [
  'ketu',
  'jeje',
  'angola',
  'efon',
  'nago_vodun',
  'outra',
];

interface Props {
  filtros: FiltrosBusca;
  aberto: boolean;
  onFechar(): void;
  onAplicar(filtros: FiltrosBusca): void;
}

function ToggleTag({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={
        'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors ' +
        (ativo
          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
          : 'border-border bg-card text-foreground shadow-xs hover:border-foreground/20 hover:bg-secondary')
      }
    >
      {children}
    </button>
  );
}

export function FiltrosOverlay({ filtros, aberto, onFechar, onAplicar }: Props) {
  useTeclaEsc(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filtros-titulo"
      className="fixed inset-0 z-[2000] flex justify-end bg-foreground/30 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="eyebrow">Refinar</p>
            <h2 id="filtros-titulo" className="mt-1 text-xl font-semibold">
              Filtros
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar filtros"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <label
              htmlFor="filtro-cidade"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Cidade
            </label>
            <input
              id="filtro-cidade"
              value={filtros.cidade ?? ''}
              onChange={(e) =>
                onAplicar(filtros.comCidade(e.target.value || null))
              }
              placeholder="Ex.: Itajaí"
              className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="filtro-bairro"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Bairro
            </label>
            <input
              id="filtro-bairro"
              value={filtros.bairro ?? ''}
              onChange={(e) =>
                onAplicar(filtros.comBairro(e.target.value || null))
              }
              placeholder="Cordeiros"
              className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
            />
          </div>

          {filtros.tradicao === 'umbanda' ? (
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground">
                Linhas trabalhadas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LINHAS_UMBANDA.map((tag) => (
                  <ToggleTag
                    key={tag}
                    ativo={filtros.tags.includes(tag)}
                    onClick={() => onAplicar(filtros.comTagAlternada(tag))}
                  >
                    {tag}
                  </ToggleTag>
                ))}
              </div>
            </div>
          ) : null}

          {filtros.tradicao === 'candomble' ? (
            <div className="space-y-2.5">
              <p className="text-sm font-medium text-foreground">Nação</p>
              <div className="flex flex-wrap gap-1.5">
                {NACOES_CANDOMBLE.map((n) => {
                  const ativo = filtros.nacaoCandomble === n;
                  return (
                    <ToggleTag
                      key={n}
                      ativo={ativo}
                      onClick={() =>
                        onAplicar(filtros.comNacaoCandomble(ativo ? null : n))
                      }
                    >
                      {CANDOMBLE_NACAO_LABEL[n]}
                    </ToggleTag>
                  );
                })}
              </div>
            </div>
          ) : null}

          {filtros.tradicao === 'quimbanda' ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-4 text-sm shadow-xs transition-colors hover:border-foreground/20">
              <input
                type="checkbox"
                checked={filtros.soAbertasQuimbanda}
                onChange={(e) =>
                  onAplicar(filtros.comSoAbertasQuimbanda(e.target.checked))
                }
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div>
                <p className="font-medium text-foreground">
                  Só casas abertas a não-iniciados
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Filtra Quimbandas que recebem quem ainda não tem fundamento.
                </p>
              </div>
            </label>
          ) : null}

          {!filtros.tradicao ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              Selecione uma tradição lá em cima pra ver filtros específicos
              dela.
            </p>
          ) : null}
        </div>

        <div className="border-t border-border p-4">
          <Button variant="primary" onClick={onFechar} className="w-full">
            Ver resultados
          </Button>
        </div>
      </div>
    </div>
  );
}
