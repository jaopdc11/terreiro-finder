import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { CasaFotosRepository } from '../api/CasaFotosRepository';

export function useGaleriaCasa(casaId: string) {
  const { client } = useServices();
  const repo = useMemo(() => new CasaFotosRepository(client), [client]);
  return useQuery({
    queryKey: ['casa', casaId, 'galeria'],
    queryFn: () => repo.listarDaCasa(casaId),
    enabled: !!casaId,
  });
}
