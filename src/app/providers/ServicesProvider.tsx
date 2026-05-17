import { useMemo, type ReactNode } from 'react';
import { SupabaseClientFactory } from '@/shared/lib/SupabaseClientFactory';
import { AuthService } from '@/features/auth/api/AuthService';
import { SessaoStore } from '@/features/auth/stores/SessaoStore';
import { ServicesContext, type Services } from './ServicesContext';

export function ServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo<Services>(() => {
    const client = SupabaseClientFactory.fromEnv();
    const auth = new AuthService(client);
    const sessao = new SessaoStore(client, auth);
    return Object.freeze({ client, auth, sessao });
  }, []);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
