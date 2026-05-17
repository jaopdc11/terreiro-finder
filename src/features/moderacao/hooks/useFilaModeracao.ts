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
const QK_CADASTROS_DIRETOS = ['admin', 'casas', 'pendentes-proprio'] as const;

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
 * Lista casas pendentes que foram cadastradas DIRETAMENTE pela dirigência
 * (fonte='proprio'). Faz 2 queries em sequência (casas + profiles dos
 * criadores) — JOIN inline via PostgREST não rola porque `casas.criada_por`
 * referencia `auth.users.id` em vez de `profiles.id` diretamente.
 */
export function useCadastrosDiretosPendentes() {
  const { client } = useServices();
  return useQuery({
    queryKey: QK_CADASTROS_DIRETOS,
    queryFn: async () => {
      const { data, error } = await client
        .from('casas')
        .select(
          `id, slug, nome, sacerdote_nome, tradicao_principal, cidade, estado,
           bairro, fonte, status, criada_por, canal_validacao, created_at`,
        )
        .eq('status', 'pendente')
        .eq('fonte', 'proprio')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const casas = data ?? [];
      if (casas.length === 0) return [];

      const criadorIds = Array.from(
        new Set(casas.map((c) => c.criada_por).filter((id): id is string => !!id)),
      );
      if (criadorIds.length === 0) {
        return casas.map((c) => ({ ...c, criador: null }));
      }
      const { data: perfis, error: e2 } = await client
        .from('profiles')
        .select('id, nome_exibicao, nome_completo')
        .in('id', criadorIds);
      if (e2) throw e2;
      const porId = new Map(
        (perfis ?? []).map((p) => [
          p.id as string,
          {
            nome_exibicao: p.nome_exibicao as string | null,
            nome_completo: p.nome_completo as string | null,
          },
        ]),
      );
      return casas.map((c) => ({
        ...c,
        criador: c.criada_por ? (porId.get(c.criada_por as string) ?? null) : null,
      }));
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

export function useAprovarCadastroDireto() {
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

  return useMutation({
    mutationFn: async (casaId: string) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.aprovarCadastroDireto(casaId, { userId: sess.userId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_CADASTROS_DIRETOS }),
  });
}

export function useRecusarCadastroDireto() {
  const { sessao } = useServices();
  const qc = useQueryClient();
  const svc = useSvc();

  return useMutation({
    mutationFn: async (input: { casaId: string; motivo: string | null }) => {
      const sess = sessao.use.getState().sessao;
      if (!sess) throw new Error('Sem sessão');
      return svc.recusarCadastroDireto(input.casaId, { userId: sess.userId }, input.motivo);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_CADASTROS_DIRETOS }),
  });
}
