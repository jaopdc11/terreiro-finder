import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ViaCepClient, type EnderecoPorCep } from '@/shared/lib/ViaCepClient';

const client = new ViaCepClient();

/**
 * Busca endereço por CEP via ViaCEP, com cache de React Query. Só dispara
 * quando o CEP tem 8 dígitos numéricos. Retorna null pra CEPs inexistentes.
 */
export function useEnderecoPorCep(cep: string | null | undefined) {
  const limpo = useMemo(() => (cep ?? '').replace(/\D/g, ''), [cep]);
  return useQuery<EnderecoPorCep | null>({
    queryKey: ['viacep', limpo],
    queryFn: () => client.buscarPorCep(limpo),
    enabled: limpo.length === 8,
    staleTime: 1000 * 60 * 60 * 24, // 24h: CEP não muda
    retry: 1,
  });
}
