import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { CasasRepository } from '@/features/casas/api/CasasRepository';
import type { FiltrosBusca } from '../domain/FiltrosBusca';

export function useCasasFiltradas(filtros: FiltrosBusca) {
  const { client } = useServices();
  const repo = useMemo(() => new CasasRepository(client), [client]);
  return useQuery({
    queryKey: filtros.toQueryKey(),
    queryFn: () => repo.listAprovadas(filtros),
  });
}
