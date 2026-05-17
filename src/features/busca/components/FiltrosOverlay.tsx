import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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
        'h-9 border px-3.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ' +
        (ativo
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-foreground/20 bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background')
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
      className="fixed inset-0 z-[2000] flex justify-end bg-foreground/40"
      onClick={onFechar}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l-2 border-foreground bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-foreground px-6 py-5">
          <div>
            <p className="eyebrow text-muted-foreground">Refinar</p>
            <h2
              id="filtros-titulo"
              className="mt-1 font-display text-3xl leading-tight"
            >
              Filtros
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar filtros"
            className="h-10 w-10 border border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <div>
            <Label
              htmlFor="filtro-cidade"
              className="eyebrow text-muted-foreground"
            >
              Cidade
            </Label>
            <Input
              id="filtro-cidade"
              value={filtros.cidade ?? ''}
              onChange={(e) =>
                onAplicar(filtros.comCidade(e.target.value || null))
              }
              placeholder="Itajaí"
              className="mt-2"
            />
          </div>

          <div>
            <Label
              htmlFor="filtro-bairro"
              className="eyebrow text-muted-foreground"
            >
              Bairro
            </Label>
            <Input
              id="filtro-bairro"
              value={filtros.bairro ?? ''}
              onChange={(e) =>
                onAplicar(filtros.comBairro(e.target.value || null))
              }
              placeholder="Cordeiros"
              className="mt-2"
            />
          </div>

          {filtros.tradicao === 'umbanda' ? (
            <div>
              <p className="eyebrow text-muted-foreground">Linhas trabalhadas</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
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
            <div>
              <p className="eyebrow text-muted-foreground">Nação</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
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
            <label className="flex cursor-pointer items-start gap-3 border border-foreground/20 p-4 text-sm hover:border-foreground/40">
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
            <p className="border-l-2 border-foreground/20 pl-3 text-xs text-muted-foreground">
              Selecione uma tradição lá em cima pra ver filtros específicos
              dela.
            </p>
          ) : null}
        </div>

        <div className="border-t border-foreground p-4">
          <Button variant="default" onClick={onFechar} className="w-full">
            Ver resultados
          </Button>
        </div>
      </div>
    </div>
  );
}
