import type { FiltrosBusca } from '../domain/FiltrosBusca';
import type { TradicaoPrincipal } from '@/features/casas/schemas';
import { cn } from '@/shared/lib/cn';

const TRADICOES: { v: TradicaoPrincipal; label: string }[] = [
  { v: 'umbanda', label: 'Umbanda' },
  { v: 'candomble', label: 'Candomblé' },
  { v: 'quimbanda', label: 'Quimbanda' },
];

interface Props {
  filtros: FiltrosBusca;
  onChange(filtros: FiltrosBusca): void;
}

function Chip({
  ativo,
  onClick,
  variant,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  variant?: 'default' | 'clear';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        'h-9 border px-3.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
        ativo
          ? 'border-primary bg-primary text-primary-foreground'
          : variant === 'clear'
            ? 'border-dashed border-foreground/40 bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground'
            : 'border-foreground/20 bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background',
      )}
    >
      {children}
    </button>
  );
}

export function ChipsFiltros({ filtros, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtros rápidos">
      {TRADICOES.map((t) => (
        <Chip
          key={t.v}
          ativo={filtros.tradicao === t.v}
          onClick={() =>
            onChange(filtros.comTradicao(filtros.tradicao === t.v ? null : t.v))
          }
        >
          {t.label}
        </Chip>
      ))}
      <Chip
        ativo={filtros.aceitaVisitantes === 'aberto'}
        onClick={() =>
          onChange(
            filtros.comAceitaVisitantes(
              filtros.aceitaVisitantes === 'aberto' ? null : 'aberto',
            ),
          )
        }
      >
        Aberta a visitas
      </Chip>
      <Chip
        ativo={filtros.enderecoVisibilidade === 'publico'}
        onClick={() =>
          onChange(
            filtros.comEnderecoVisibilidade(
              filtros.enderecoVisibilidade === 'publico' ? null : 'publico',
            ),
          )
        }
      >
        Endereço público
      </Chip>
      {!filtros.estaVazio() ? (
        <Chip
          ativo={false}
          variant="clear"
          onClick={() =>
            onChange(
              filtros
                .comTradicao(null)
                .comCidade(null)
                .comBairro(null)
                .comAceitaVisitantes(null)
                .comEnderecoVisibilidade(null),
            )
          }
        >
          ✕ Limpar
        </Chip>
      ) : null}
    </div>
  );
}
