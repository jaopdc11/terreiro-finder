import { useServices } from '@/shared/hooks/useServices';

export function useAuth() {
  const { auth } = useServices();
  return auth;
}
