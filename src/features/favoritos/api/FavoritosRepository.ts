import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';

/**
 * Favoritos do usuário logado (a API identifica pelo cookie; o `userId` fica
 * na assinatura por compatibilidade com os hooks).
 */
export class FavoritosRepository {
  constructor(private readonly api: ApiClient) {}

  /** IDs de casa favoritadas pelo usuário corrente. */
  async idsDe(_userId: string): Promise<string[]> {
    const data = await this.api.get('/favoritos');
    return z.array(z.object({ id: z.string().uuid() }).passthrough()).parse(data).map((c) => c.id);
  }

  async adicionar(_userId: string, casaId: string): Promise<void> {
    await this.api.put(`/favoritos/${casaId}`);
  }

  async remover(_userId: string, casaId: string): Promise<void> {
    await this.api.delete(`/favoritos/${casaId}`);
  }
}
