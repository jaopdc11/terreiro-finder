import { createContext } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthService } from '@/features/auth/api/AuthService';
import type { SessaoStore } from '@/features/auth/stores/SessaoStore';

export interface Services {
  readonly client: SupabaseClient;
  readonly auth: AuthService;
  readonly sessao: SessaoStore;
}

export const ServicesContext = createContext<Services | null>(null);
