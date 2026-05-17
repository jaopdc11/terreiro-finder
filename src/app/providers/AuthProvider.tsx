import { useEffect, type ReactNode } from 'react';
import { useServices } from '@/shared/hooks/useServices';

/**
 * Liga o SessaoStore ao supabase.auth no boot. Deve ficar dentro do
 * ServicesProvider. Não renderiza nada — só efeitos.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { sessao } = useServices();

  useEffect(() => {
    void sessao.escutar();
    return () => sessao.parar();
  }, [sessao]);

  return <>{children}</>;
}
