import { z } from 'zod';
import type { ApiClient } from '@/shared/lib/ApiClient';

/** A API devolve só o bloco da tradição da casa: `{ tradicao, dados }` ou null. */
const blocoSchema = z
  .object({ tradicao: z.enum(['umbanda', 'candomble', 'quimbanda']), dados: z.record(z.unknown()) })
  .nullable();

export async function buscarBloco(
  api: ApiClient,
  casaId: string,
  tradicao: 'umbanda' | 'candomble' | 'quimbanda',
): Promise<Record<string, unknown> | null> {
  const bloco = blocoSchema.parse(await api.get(`/casas/${casaId}/bloco`));
  return bloco && bloco.tradicao === tradicao ? bloco.dados : null;
}

export async function salvarBloco(
  api: ApiClient,
  casaId: string,
  tradicao: 'umbanda' | 'candomble' | 'quimbanda',
  dados: Record<string, unknown>,
): Promise<void> {
  await api.put(`/casas/${casaId}/bloco`, { tradicao, dados });
}
