import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { ModeracaoService } from '../api/ModeracaoService';

const QK_INDICACOES_PENDENTES = ['admin', 'indicacoes', 'pendentes'] as const;
const QK_CASAS_PENDENTES = ['admin', 'casas', 'pendentes-indicacao'] as const;

export function useIndicacoesPendentes() {
  const { client } = useServices();
  const repo = useMemo(() => new IndicacoesRepository(client), [client]);
  return useQuery({
    queryKey: QK_INDICACOES_PENDENTES,
    queryFn: () => repo.listPorStatus('pendente'),
  });
}

export function useCasasPendentesDeConsentimento() {
  const { client } = useServices();
  return useQuery({
    queryKey: QK_CASAS_PENDENTES,
    queryFn: async () => {
      const { data, error } = await client
        .from('casas')
        .select(
          `id, slug, nome, tradicao_principal, cidade, estado, bairro,
           fonte, status, created_at`,
        )
        .eq('status', 'pendente')
        .eq('fonte', 'indicacao')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAprovarIndicacao() {
  const { client, sessao } = useServices();
  const qc = useQueryClient();
  const svc = useMemo(
    () =>
      new ModeracaoService(new IndicacoesRepository(client), new CasasRepository(client)),
    [client],
  );

  return useMutation({
    mutationFn: async (indicacaoId: string) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.aprovarIndicacao(indicacaoId, { userId: sess.userId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_INDICACOES_PENDENTES });
      qc.invalidateQueries({ queryKey: QK_CASAS_PENDENTES });
    },
  });
}

export function useRecusarIndicacao() {
  const { client, sessao } = useServices();
  const qc = useQueryClient();
  const svc = useMemo(
    () =>
      new ModeracaoService(new IndicacoesRepository(client), new CasasRepository(client)),
    [client],
  );

  return useMutation({
    mutationFn: async (input: { id: string; motivo: string }) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.recusarIndicacao(input.id, input.motivo, { userId: sess.userId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_INDICACOES_PENDENTES }),
  });
}

export function useConfirmarConsentimento() {
  const { client, sessao } = useServices();
  const qc = useQueryClient();
  const svc = useMemo(
    () =>
      new ModeracaoService(new IndicacoesRepository(client), new CasasRepository(client)),
    [client],
  );

  return useMutation({
    mutationFn: async (casaId: string) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.confirmarConsentimento(casaId, { userId: sess.userId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_CASAS_PENDENTES }),
  });
}
