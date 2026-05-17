import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import {
  CasasPainelRepository,
  type EnderecoCasaInput,
  type PerfilCasaInput,
} from '@/features/casas/api/CasasPainelRepository';
import { GeocodingService } from '@/shared/lib/GeocodingService';
import { CasaUmbandaRepository } from '@/features/casas/api/CasaUmbandaRepository';
import type { BlocoUmbandaInput } from '@/features/casas/domain/BlocoUmbanda';
import type { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';
import { PainelService } from '../api/PainelService';

const QK_MINHAS = ['painel', 'minhas-casas'] as const;
const qkCasa = (id: string) => ['painel', 'casa', id] as const;
const qkBloco = (id: string) => ['painel', 'bloco-umbanda', id] as const;

function useRepos() {
  const { client } = useServices();
  return useMemo(() => {
    const casas = new CasasPainelRepository(client);
    const umbanda = new CasaUmbandaRepository(client);
    const svc = new PainelService(casas, umbanda);
    return { casas, umbanda, svc };
  }, [client]);
}

export function useMinhasCasas() {
  const { sessao } = useServices();
  const { casas } = useRepos();
  const userId = sessao.use((s) => s.sessao?.userId);
  return useQuery({
    queryKey: [...QK_MINHAS, userId],
    queryFn: () => (userId ? casas.minhasCasas(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useCasaDoPainel(casaId: string | undefined) {
  const { casas } = useRepos();
  return useQuery({
    queryKey: casaId ? qkCasa(casaId) : ['painel', 'casa', 'sem-id'],
    queryFn: () => (casaId ? casas.buscarPorId(casaId) : Promise.resolve(null)),
    enabled: !!casaId,
  });
}

export function useBlocoUmbanda(casaId: string | undefined) {
  const { umbanda } = useRepos();
  return useQuery({
    queryKey: casaId ? qkBloco(casaId) : ['painel', 'bloco-umbanda', 'sem-id'],
    queryFn: () => (casaId ? umbanda.buscar(casaId) : Promise.resolve(null)),
    enabled: !!casaId,
  });
}

export function useSalvarPerfil(casaId: string) {
  const qc = useQueryClient();
  const { svc } = useRepos();
  return useMutation({
    mutationFn: (input: PerfilCasaInput) => svc.salvarPerfil(casaId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkCasa(casaId) }),
  });
}

export function useSalvarEndereco(casaId: string) {
  const qc = useQueryClient();
  const { svc } = useRepos();
  return useMutation({
    mutationFn: (input: EnderecoCasaInput) => svc.salvarEndereco(casaId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qkCasa(casaId) });
      qc.invalidateQueries({ queryKey: ['casas'] });
    },
  });
}

export function useGeocodarEndereco() {
  const geo = useMemo(() => new GeocodingService(), []);
  return useMutation({
    mutationFn: (consulta: string) => geo.buscar(consulta),
  });
}

export function useSalvarAbertura(casaId: string) {
  const qc = useQueryClient();
  const { svc } = useRepos();
  return useMutation({
    mutationFn: (perfil: PerfilAbertura) => svc.salvarAbertura(casaId, perfil),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkCasa(casaId) }),
  });
}

export function useSalvarBlocoUmbanda(casaId: string) {
  const qc = useQueryClient();
  const { svc } = useRepos();
  return useMutation({
    mutationFn: (input: BlocoUmbandaInput) => svc.salvarBlocoUmbanda(casaId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkBloco(casaId) }),
  });
}
