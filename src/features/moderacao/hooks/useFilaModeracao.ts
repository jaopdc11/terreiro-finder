import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { IndicacoesRepository } from '@/features/indicacao/api/IndicacoesRepository';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import { ReivindicacoesRepository } from '@/features/painel/api/ReivindicacoesRepository';
import { GeocodingService } from '@/shared/lib/GeocodingService';
import { ModeracaoService } from '../api/ModeracaoService';

const QK_INDICACOES_PENDENTES = ['admin', 'indicacoes', 'pendentes'] as const;
const QK_CASAS_PENDENTES = ['admin', 'casas', 'pendentes-indicacao'] as const;
const QK_REIVINDICACOES_PENDENTES = ['admin', 'reivindicacoes', 'pendentes'] as const;

function useSvc(): ModeracaoService {
  const { client } = useServices();
  return useMemo(
    () =>
      new ModeracaoService(
        new IndicacoesRepository(client),
        new CasasRepository(client),
        new ReivindicacoesRepository(client),
        new GeocodingService(),
      ),
    [client],
  );
}

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

/**
 * Lista pendentes vindo da tabela reivindicacoes, já enriquecida com dados
 * da casa (nome, slug, contatos) pra o admin fazer "contato cruzado" sem
 * mais cliques.
 */
export function useReivindicacoesPendentes() {
  const { client } = useServices();
  return useQuery({
    queryKey: QK_REIVINDICACOES_PENDENTES,
    queryFn: async () => {
      const { data, error } = await client
        .from('reivindicacoes')
        .select(
          `id, user_id, casa_id, observacoes, status, created_at,
           casa:casas (slug, nome, whatsapp, telefone, email_contato)`,
        )
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAprovarIndicacao() {
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

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
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

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
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

  return useMutation({
    mutationFn: async (casaId: string) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.confirmarConsentimento(casaId, { userId: sess.userId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_CASAS_PENDENTES }),
  });
}

export function useAprovarReivindicacao() {
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

  return useMutation({
    mutationFn: async (reivindicacaoId: string) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.aprovarReivindicacao(reivindicacaoId, { userId: sess.userId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_REIVINDICACOES_PENDENTES }),
  });
}

export function useRecusarReivindicacao() {
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

  return useMutation({
    mutationFn: async (input: { id: string; motivo: string }) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.recusarReivindicacao(input.id, input.motivo, { userId: sess.userId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_REIVINDICACOES_PENDENTES }),
  });
}
