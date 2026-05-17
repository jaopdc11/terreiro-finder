import { useServices } from '@/shared/hooks/useServices';

export function useSessao() {
  const { sessao } = useServices();
  return sessao.use((s) => s);
}

export function useEstaLogado(): boolean {
  const { sessao } = useServices();
  return sessao.use((s) => s.sessao !== null);
}
