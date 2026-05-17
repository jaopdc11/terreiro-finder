import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/hooks/useServices';
import { CasaCandombleRepository } from '../api/CasaCandombleRepository';
import { CasaQuimbandaRepository } from '../api/CasaQuimbandaRepository';
import { CANDOMBLE_NACAO_LABEL } from '../domain/blocoCandombleEnums';
import type { Casa } from '../domain/Casa';

/**
 * Card "Sobre a tradição" na ficha pública. Renderiza os campos do bloco
 * específico (Candomblé ou Quimbanda) quando a casa pertence a essa tradição
 * e o dirigente preencheu ao menos 1 campo. Umbanda tem layout próprio
 * (linhas/linhagem viram chips na busca, não no card).
 *
 * RLS permite leitura pública dessas tabelas quando a casa correspondente
 * está aprovada (`supabase/migrations/0002_rls.sql`).
 */
export function CardBlocoTradicao({ casa }: { casa: Casa }) {
  if (casa.tradicaoPrincipal === 'candomble') {
    return <CardCandomble casaId={casa.id} />;
  }
  if (casa.tradicaoPrincipal === 'quimbanda') {
    return <CardQuimbanda casaId={casa.id} />;
  }
  return null;
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-xl text-foreground">{titulo}</h2>
      <div className="mt-3 text-sm text-foreground/90">{children}</div>
    </section>
  );
}

function CardCandomble({ casaId }: { casaId: string }) {
  const { client } = useServices();
  const repo = useMemo(() => new CasaCandombleRepository(client), [client]);
  const { data: bloco } = useQuery({
    queryKey: ['casa', casaId, 'bloco-candomble-publico'],
    queryFn: () => repo.buscar(casaId),
  });

  if (!bloco || !bloco.temConteudo()) return null;

  return (
    <Card titulo="Sobre a tradição">
      <dl className="grid gap-3 sm:grid-cols-2">
        {bloco.nacao ? (
          <Linha rotulo="Nação">{CANDOMBLE_NACAO_LABEL[bloco.nacao]}</Linha>
        ) : null}
        {bloco.orixaDaCasa ? <Linha rotulo="Orixá da casa">{bloco.orixaDaCasa}</Linha> : null}
        {bloco.raizLinhagem ? (
          <Linha rotulo="Raiz / Linhagem">{bloco.raizLinhagem}</Linha>
        ) : null}
        {bloco.linguaRitual ? (
          <Linha rotulo="Língua ritual">{bloco.linguaRitual}</Linha>
        ) : null}
      </dl>
    </Card>
  );
}

function CardQuimbanda({ casaId }: { casaId: string }) {
  const { client } = useServices();
  const repo = useMemo(() => new CasaQuimbandaRepository(client), [client]);
  const { data: bloco } = useQuery({
    queryKey: ['casa', casaId, 'bloco-quimbanda-publico'],
    queryFn: () => repo.buscar(casaId),
  });

  if (!bloco || !bloco.temConteudo()) return null;

  return (
    <Card titulo="Sobre a tradição">
      <dl className="grid gap-3 sm:grid-cols-2">
        {bloco.corrente ? <Linha rotulo="Corrente">{bloco.corrente}</Linha> : null}
        {bloco.raizLinhagem ? (
          <Linha rotulo="Raiz / Linhagem">{bloco.raizLinhagem}</Linha>
        ) : null}
        {bloco.abertaANaoIniciados !== null ? (
          <Linha rotulo="Abertura a não-iniciados">
            {bloco.abertaANaoIniciados ? 'Sim' : 'Só iniciados'}
          </Linha>
        ) : null}
      </dl>
    </Card>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
