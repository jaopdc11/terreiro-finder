import { createContext } from 'react';
import type { ApiClient } from '@/shared/lib/ApiClient';
import type { AuthService } from '@/features/auth/api/AuthService';
import type { SessaoStore } from '@/features/auth/stores/SessaoStore';

export interface Services {
  readonly client: ApiClient;
  readonly auth: AuthService;
  readonly sessao: SessaoStore;
}

export const ServicesContext = createContext<Services | null>(null);
