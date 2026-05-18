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
        'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors',
        ativo
          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
          : variant === 'clear'
            ? 'border-dashed border-foreground/30 bg-transparent text-muted-foreground hover:border-foreground/60 hover:text-foreground'
            : 'border-border bg-card text-foreground shadow-xs hover:border-foreground/20 hover:bg-secondary',
      )}
    >
      {children}
    </button>
  );
}

export function ChipsFiltros({ filtros, onChange }: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Filtros rápidos"
    >
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
          Limpar
        </Chip>
      ) : null}
    </div>
  );
}
