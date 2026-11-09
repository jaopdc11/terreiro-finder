import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/hooks/useServices';
import { CasaCandombleRepository } from '../api/CasaCandombleRepository';
import { CasaQuimbandaRepository } from '../api/CasaQuimbandaRepository';
import { CANDOMBLE_NACAO_LABEL } from '../domain/blocoCandombleEnums';
import type { Casa } from '../domain/Casa';

/**
 * Bloco "Sobre a tradição" na ficha pública. Tiles editoriais — cada tile
 * com label compacto + valor grande. Pemba-dots pattern sutil de fundo.
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

function Tile({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-5 ${
        destaque
          ? 'border-terra-pemba/40 bg-terra-pemba/5'
          : 'border-border bg-card'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </p>
      <p
        className={`mt-2 text-xl font-semibold leading-snug ${
          destaque ? 'display-serif italic text-foreground' : 'text-foreground'
        }`}
      >
        {valor}
      </p>
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

  const tiles: Array<{ rotulo: string; valor: string; destaque?: boolean }> = [];
  if (bloco.nacao) {
    tiles.push({ rotulo: 'Nação', valor: CANDOMBLE_NACAO_LABEL[bloco.nacao], destaque: true });
  }
  if (bloco.orixaDaCasa) {
    tiles.push({ rotulo: 'Orixá da casa', valor: bloco.orixaDaCasa, destaque: true });
  }
  if (bloco.raizLinhagem) {
    tiles.push({ rotulo: 'Raiz / linhagem', valor: bloco.raizLinhagem });
  }
  if (bloco.linguaRitual) {
    tiles.push({ rotulo: 'Língua ritual', valor: bloco.linguaRitual });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <Tile key={t.rotulo} {...t} />
      ))}
    </div>
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

  const tiles: Array<{ rotulo: string; valor: string; destaque?: boolean }> = [];
  if (bloco.corrente) {
    tiles.push({ rotulo: 'Corrente', valor: bloco.corrente, destaque: true });
  }
  if (bloco.raizLinhagem) {
    tiles.push({ rotulo: 'Raiz / linhagem', valor: bloco.raizLinhagem });
  }
  if (bloco.abertaANaoIniciados !== null) {
    tiles.push({
      rotulo: 'Abertura',
      valor: bloco.abertaANaoIniciados ? 'Aberta a não-iniciados' : 'Só iniciados',
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <Tile key={t.rotulo} {...t} />
      ))}
    </div>
  );
}
