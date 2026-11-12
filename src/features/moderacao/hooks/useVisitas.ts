import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useServices } from '@/shared/hooks/useServices';
import { EstatisticasRepository, type Periodo } from '../api/EstatisticasRepository';

/** Tudo que a tela "Visitas" mostra, num pedido só por período. */
export function useVisitas(periodo: Periodo) {
  const { client } = useServices();
  const repo = useMemo(() => new EstatisticasRepository(client), [client]);
  return useQuery({
    queryKey: ['admin', 'visitas', periodo.de, periodo.ate],
    queryFn: async () => {
      const [resumo, serie, origens, cidades, aparelhos, paginas, eventos] = await Promise.all([
        repo.resumo(periodo),
        repo.serie(periodo),
        repo.top(periodo, 'referrer'),
        repo.top(periodo, 'cidade'),
        repo.top(periodo, 'aparelho'),
        repo.paginas(periodo),
        repo.eventos(periodo),
      ]);
      return { resumo, serie, origens, cidades, aparelhos, paginas, eventos };
    },
    retry: false,
  });
}
