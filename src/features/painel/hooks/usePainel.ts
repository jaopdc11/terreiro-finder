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
import { CasaCandombleRepository } from '@/features/casas/api/CasaCandombleRepository';
import { CasaQuimbandaRepository } from '@/features/casas/api/CasaQuimbandaRepository';
import type { BlocoUmbandaInput } from '@/features/casas/domain/BlocoUmbanda';
import type { BlocoCandombleInput } from '@/features/casas/domain/BlocoCandomble';
import type { BlocoQuimbandaInput } from '@/features/casas/domain/BlocoQuimbanda';
import type { PerfilAbertura } from '@/features/casas/domain/PerfilAbertura';
import { PainelService } from '../api/PainelService';

const QK_MINHAS = ['painel', 'minhas-casas'] as const;
const qkCasa = (id: string) => ['painel', 'casa', id] as const;
const qkBlocoUmb = (id: string) => ['painel', 'bloco-umbanda', id] as const;
const qkBlocoCand = (id: string) => ['painel', 'bloco-candomble', id] as const;
const qkBlocoQuim = (id: string) => ['painel', 'bloco-quimbanda', id] as const;

function useRepos() {
  const { client } = useServices();
  return useMemo(() => {
    const casas = new CasasPainelRepository(client);
    const umbanda = new CasaUmbandaRepository(client);
    const candomble = new CasaCandombleRepository(client);
    const quimbanda = new CasaQuimbandaRepository(client);
    const svc = new PainelService(casas, umbanda, candomble, quimbanda);
    return { casas, umbanda, candomble, quimbanda, svc };
  }, [client]);
}

export function useMinhasCasas() {
  const { sessao } = useServices();
  const { casas } = useRepos();
  const userId = sessao.use((s) => s.sessao?.userId);
  return useQuery({
    queryKey: [...QK_MINHAS, userId],
    queryFn: () => (userId ? casas.minhasCasas() : Promise.resolve([])),
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
    queryKey: casaId ? qkBlocoUmb(casaId) : ['painel', 'bloco-umbanda', 'sem-id'],
    queryFn: () => (casaId ? umbanda.buscar(casaId) : Promise.resolve(null)),
    enabled: !!casaId,
  });
}

export function useBlocoCandomble(casaId: string | undefined) {
  const { candomble } = useRepos();
  return useQuery({
    queryKey: casaId ? qkBlocoCand(casaId) : ['painel', 'bloco-candomble', 'sem-id'],
    queryFn: () => (casaId ? candomble.buscar(casaId) : Promise.resolve(null)),
    enabled: !!casaId,
  });
}

export function useBlocoQuimbanda(casaId: string | undefined) {
  const { quimbanda } = useRepos();
  return useQuery({
    queryKey: casaId ? qkBlocoQuim(casaId) : ['painel', 'bloco-quimbanda', 'sem-id'],
    queryFn: () => (casaId ? quimbanda.buscar(casaId) : Promise.resolve(null)),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: qkBlocoUmb(casaId) }),
  });
}

export function useSalvarBlocoCandomble(casaId: string) {
  const qc = useQueryClient();
  const { svc } = useRepos();
  return useMutation({
    mutationFn: (input: BlocoCandombleInput) =>
      svc.salvarBlocoCandomble(casaId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkBlocoCand(casaId) }),
  });
}

export function useSalvarBlocoQuimbanda(casaId: string) {
  const qc = useQueryClient();
  const { svc } = useRepos();
  return useMutation({
    mutationFn: (input: BlocoQuimbandaInput) =>
      svc.salvarBlocoQuimbanda(casaId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkBlocoQuim(casaId) }),
  });
}
