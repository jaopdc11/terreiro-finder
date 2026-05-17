import { useContext } from 'react';
import { ServicesContext, type Services } from '@/app/providers/ServicesContext';

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices fora de <ServicesProvider>');
  return ctx;
}
