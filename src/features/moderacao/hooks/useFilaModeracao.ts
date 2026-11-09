import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { ModeracaoRepository, type FilaModeracao } from '../api/ModeracaoRepository';

// Toda a orquestração (criar casa, vincular dirigente, transição de status)
// mora na API, em transação. Aqui só lemos a fila e disparamos as ações.

const QK_FILA = ['admin', 'fila'] as const;

function useRepo(): ModeracaoRepository {
  const { client } = useServices();
  return useMemo(() => new ModeracaoRepository(client), [client]);
}

function useFila<T>(selecionar: (f: FilaModeracao) => T) {
  const repo = useRepo();
  return useQuery({ queryKey: QK_FILA, queryFn: () => repo.fila(), select: selecionar });
}

export const useIndicacoesPendentes = () => useFila((f) => f.indicacoes);
export const useCasasPendentesDeConsentimento = () => useFila((f) => f.aguardandoConsentimento);
export const useCadastrosDiretosPendentes = () => useFila((f) => f.cadastrosDiretos);
export const useReivindicacoesPendentes = () => useFila((f) => f.reivindicacoes);

function useAcao<I, R>(acao: (repo: ModeracaoRepository, input: I) => Promise<R>) {
  const repo = useRepo();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: I) => acao(repo, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_FILA }),
  });
}

export const useAprovarIndicacao = () => useAcao((r, id: string) => r.aprovarIndicacao(id));
export const useRecusarIndicacao = () =>
  useAcao((r, i: { id: string; motivo: string }) => r.recusarIndicacao(i.id, i.motivo));
export const useConfirmarConsentimento = () => useAcao((r, casaId: string) => r.confirmarConsentimento(casaId));
export const useAprovarReivindicacao = () => useAcao((r, id: string) => r.aprovarReivindicacao(id));
export const useRecusarReivindicacao = () =>
  useAcao((r, i: { id: string; motivo: string }) => r.recusarReivindicacao(i.id, i.motivo));
export const useAprovarCadastroDireto = () => useAcao((r, casaId: string) => r.aprovarCadastroDireto(casaId));
export const useRecusarCadastroDireto = () =>
  useAcao((r, i: { casaId: string; motivo: string | null }) => r.recusarCadastroDireto(i.casaId, i.motivo));
