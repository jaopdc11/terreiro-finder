import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';
import type { FiltrosBusca } from '../domain/FiltrosBusca';

const LINHAS_UMBANDA = ['caboclo', 'pretovelho', 'crianca', 'marinheiro', 'exu', 'pombagira'];

interface Props {
  filtros: FiltrosBusca;
  aberto: boolean;
  onFechar(): void;
  onAplicar(filtros: FiltrosBusca): void;
}

export function FiltrosOverlay({ filtros, aberto, onFechar, onAplicar }: Props) {
  useTeclaEsc(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filtros-titulo"
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-foreground/30 sm:items-center"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-card p-6 sm:rounded-lg">
        <div className="flex items-center justify-between">
          <h2 id="filtros-titulo" className="font-display text-2xl">
            Mais filtros
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar filtros"
            className="text-muted-foreground hover:text-primary"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="filtro-cidade">Cidade</Label>
            <Input
              id="filtro-cidade"
              value={filtros.cidade ?? ''}
              onChange={(e) => onAplicar(filtros.comCidade(e.target.value || null))}
              placeholder="Itajaí"
            />
          </div>

          <div>
            <Label htmlFor="filtro-bairro">Bairro</Label>
            <Input
              id="filtro-bairro"
              value={filtros.bairro ?? ''}
              onChange={(e) => onAplicar(filtros.comBairro(e.target.value || null))}
              placeholder="Cordeiros"
            />
          </div>

          {filtros.tradicao === 'umbanda' ? (
            <div>
              <p className="text-sm font-medium">Linhas trabalhadas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LINHAS_UMBANDA.map((tag) => {
                  const ativo = filtros.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onAplicar(filtros.comTagAlternada(tag))}
                      aria-pressed={ativo}
                      className={
                        'rounded-full border px-3 py-1 text-sm ' +
                        (ativo
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:bg-muted')
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Selecione uma tradição pra ver filtros específicos dela.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onFechar}>
              Ver resultados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
