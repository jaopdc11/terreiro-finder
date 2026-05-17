import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/hooks/useServices';
import { CasaCandombleRepository } from '../api/CasaCandombleRepository';
import { CasaQuimbandaRepository } from '../api/CasaQuimbandaRepository';
import { CANDOMBLE_NACAO_LABEL } from '../domain/blocoCandombleEnums';
import type { Casa } from '../domain/Casa';

/**
 * Bloco "Sobre a tradição" na ficha pública. Layout grid editorial:
 * label compacto à esquerda, valor à direita. Sem caixa, com divisores
 * finos entre linhas.
 */
export function CardBlocoTradicao({ casa }: { casa: Casa }) {
  if (casa.tradicaoPrincipal === 'candomble') {
    return <BlocoCandomble casaId={casa.id} />;
  }
  if (casa.tradicaoPrincipal === 'quimbanda') {
    return <BlocoQuimbanda casaId={casa.id} />;
  }
  return null;
}

function Linha({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 border-t border-foreground/10 py-4 first:border-t-0">
      <dt className="eyebrow col-span-12 text-muted-foreground sm:col-span-3">
        {rotulo}
      </dt>
      <dd className="col-span-12 text-foreground sm:col-span-9">{children}</dd>
    </div>
  );
}

function BlocoCandomble({ casaId }: { casaId: string }) {
  const { client } = useServices();
  const repo = useMemo(() => new CasaCandombleRepository(client), [client]);
  const { data: bloco } = useQuery({
    queryKey: ['casa', casaId, 'bloco-candomble-publico'],
    queryFn: () => repo.buscar(casaId),
  });

  if (!bloco || !bloco.temConteudo()) return null;

  return (
    <section>
      <p className="eyebrow text-muted-foreground">Sobre a tradição</p>
      <dl className="mt-4 border-t border-foreground/20">
        {bloco.nacao ? (
          <Linha rotulo="Nação">{CANDOMBLE_NACAO_LABEL[bloco.nacao]}</Linha>
        ) : null}
        {bloco.orixaDaCasa ? (
          <Linha rotulo="Orixá da casa">{bloco.orixaDaCasa}</Linha>
        ) : null}
        {bloco.raizLinhagem ? (
          <Linha rotulo="Raiz / linhagem">{bloco.raizLinhagem}</Linha>
        ) : null}
        {bloco.linguaRitual ? (
          <Linha rotulo="Língua ritual">{bloco.linguaRitual}</Linha>
        ) : null}
      </dl>
    </section>
  );
}

function BlocoQuimbanda({ casaId }: { casaId: string }) {
  const { client } = useServices();
  const repo = useMemo(() => new CasaQuimbandaRepository(client), [client]);
  const { data: bloco } = useQuery({
    queryKey: ['casa', casaId, 'bloco-quimbanda-publico'],
    queryFn: () => repo.buscar(casaId),
  });

  if (!bloco || !bloco.temConteudo()) return null;

  return (
    <section>
      <p className="eyebrow text-muted-foreground">Sobre a tradição</p>
      <dl className="mt-4 border-t border-foreground/20">
        {bloco.corrente ? <Linha rotulo="Corrente">{bloco.corrente}</Linha> : null}
        {bloco.raizLinhagem ? (
          <Linha rotulo="Raiz / linhagem">{bloco.raizLinhagem}</Linha>
        ) : null}
        {bloco.abertaANaoIniciados !== null ? (
          <Linha rotulo="Abertura">
            {bloco.abertaANaoIniciados
              ? 'Aberta a não-iniciados'
              : 'Só iniciados'}
          </Linha>
        ) : null}
      </dl>
    </section>
  );
}
