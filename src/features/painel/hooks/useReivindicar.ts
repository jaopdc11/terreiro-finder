import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { ReivindicacoesRepository } from '../api/ReivindicacoesRepository';
import type { NovaReivindicacaoInput } from '../schemas';

export function useReivindicar() {
  const { client, sessao } = useServices();
  const repo = useMemo(() => new ReivindicacoesRepository(client), [client]);

  return useMutation({
    mutationFn: async (input: NovaReivindicacaoInput) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Você precisa estar logada(o) pra reivindicar.');
      return repo.criarComoVisitante(sess.userId, input);
    },
  });
}
