import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { CasaFotosRepository, type CasaFotoView } from '@/features/casas/api/CasaFotosRepository';
import { comprimirFoto } from '@/features/casas/api/compressaoFoto';

const qk = (casaId: string) => ['painel', 'fotos', casaId] as const;

function useFotosRepo(): CasaFotosRepository {
  const { client } = useServices();
  return useMemo(() => new CasaFotosRepository(client), [client]);
}

export function useFotosDaCasa(casaId: string) {
  const repo = useFotosRepo();
  return useQuery({
    queryKey: qk(casaId),
    queryFn: () => repo.listarDaCasa(casaId),
  });
}

export function useAdicionarFoto(casaId: string) {
  const qc = useQueryClient();
  const repo = useFotosRepo();
  return useMutation({
    mutationFn: async (file: File) => {
      const { blob, nomeOriginal } = await comprimirFoto(file);
      return repo.adicionar({
        casaId,
        blob,
        contentType: file.type || 'image/jpeg',
        nomeOriginal,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(casaId) }),
  });
}

export function useRemoverFoto(casaId: string) {
  const qc = useQueryClient();
  const repo = useFotosRepo();
  return useMutation({
    mutationFn: (foto: CasaFotoView) => repo.remover(foto),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(casaId) }),
  });
}
