import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/shared/hooks/useServices';
import { FavoritosRepository } from '../api/FavoritosRepository';

const QK = ['favoritos'] as const;

function useRepo() {
  const { client } = useServices();
  return useMemo(() => new FavoritosRepository(client), [client]);
}

export function useIdsFavoritos() {
  const { sessao } = useServices();
  const userId = sessao.use((s) => s.sessao?.userId);
  const repo = useRepo();
  return useQuery({
    queryKey: [...QK, userId],
    queryFn: () => (userId ? repo.idsDe(userId) : Promise.resolve<string[]>([])),
    enabled: !!userId,
  });
}

export function useAlternarFavorito() {
  const qc = useQueryClient();
  const { sessao } = useServices();
  const repo = useRepo();
  return useMutation({
    mutationFn: async ({
      casaId,
      eraFavorito,
    }: {
      casaId: string;
      eraFavorito: boolean;
    }) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Faça login pra favoritar.');
      if (eraFavorito) {
        await repo.remover(sess.userId, casaId);
      } else {
        await repo.adicionar(sess.userId, casaId);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
