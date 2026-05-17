import type { FiltrosBusca } from '../domain/FiltrosBusca';
import type { TradicaoPrincipal } from '@/features/casas/schemas';
import { cn } from '@/shared/lib/cn';

const TRADICOES: { v: TradicaoPrincipal; label: string }[] = [
  { v: 'umbanda', label: 'Umbanda' },
  { v: 'candomble', label: 'Candomblé' },
  { v: 'quimbanda', label: 'Quimbanda' },
  { v: 'tambor_de_mina', label: 'Tambor de Mina' },
];

interface Props {
  filtros: FiltrosBusca;
  onChange(filtros: FiltrosBusca): void;
}

function Chip({
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
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        ativo
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

export function ChipsFiltros({ filtros, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros rápidos">
      {TRADICOES.map((t) => (
        <Chip
          key={t.v}
          ativo={filtros.tradicao === t.v}
          onClick={() => onChange(filtros.comTradicao(filtros.tradicao === t.v ? null : t.v))}
        >
          {t.label}
        </Chip>
      ))}
      <Chip
        ativo={filtros.aceitaVisitantes === 'aberto'}
        onClick={() =>
          onChange(
            filtros.comAceitaVisitantes(filtros.aceitaVisitantes === 'aberto' ? null : 'aberto'),
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
        <Chip ativo={false} onClick={() => onChange(filtros.comTradicao(null).comCidade(null).comBairro(null).comAceitaVisitantes(null).comEnderecoVisibilidade(null))}>
          Limpar
        </Chip>
      ) : null}
    </div>
  );
}
