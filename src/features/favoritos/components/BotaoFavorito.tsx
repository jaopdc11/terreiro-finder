import { Link } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useAlternarFavorito, useIdsFavoritos } from '../hooks/useFavoritos';

/**
 * Botão de coração toggle. Aparece pra qualquer visitante: anônimo cai num
 * link de "Entrar para favoritar"; logado alterna o favorito.
 *
 * Decisão UX: não mostramos contagem global de favoritos. Princípio §1.2:
 * a métrica social não é parte do MVP — a dor é descoberta, não engajamento.
 */
export function BotaoFavorito({ casaId }: { casaId: string }) {
  const { sessao } = useServices();
  const logado = sessao.use((s) => !!s.sessao);
  const { data: ids } = useIdsFavoritos();
  const alternar = useAlternarFavorito();

  if (!logado) {
    return (
      <Link
        to="/entrar"
        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        aria-label="Faça login para favoritar esta casa"
      >
        <span aria-hidden="true">♡</span>
        Entrar para favoritar
      </Link>
    );
  }

  const eFav = ids?.includes(casaId) ?? false;

  return (
    <button
      type="button"
      onClick={() => alternar.mutate({ casaId, eraFavorito: eFav })}
      disabled={alternar.isPending}
      aria-pressed={eFav}
      aria-label={eFav ? 'Remover dos favoritos' : 'Favoritar esta casa'}
      className={
        'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ' +
        (eFav
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:text-foreground')
      }
    >
      <span aria-hidden="true">{eFav ? '♥' : '♡'}</span>
      {eFav ? 'Favoritada' : 'Favoritar'}
    </button>
  );
}
