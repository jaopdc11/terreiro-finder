import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { CasasRepository } from '../api/CasasRepository';

export function useCasa(slug: string | undefined) {
  const { client } = useServices();
  const repo = useMemo(() => new CasasRepository(client), [client]);
  return useQuery({
    queryKey: ['casa', slug],
    queryFn: () => (slug ? repo.findBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
  });
}
