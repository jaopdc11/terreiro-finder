import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { IndicacoesRepository } from '../api/IndicacoesRepository';
import type { NovaIndicacaoInput } from '../schemas';

export function useIndicar() {
  const { client, sessao } = useServices();
  const repo = useMemo(() => new IndicacoesRepository(client), [client]);

  return useMutation({
    mutationFn: async (input: NovaIndicacaoInput) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('É preciso estar autenticado para indicar.');
      return repo.criarComoVisitante(sess.userId, input);
    },
  });
}
