import { z } from 'zod';

/**
 * Nações do Candomblé. Enum coberto pelo DDL (`public.candomble_nacao`).
 * Não exaustivo: 'outra' cobre nações menos comuns em Itajaí
 * (Mussulumi, Iorubá-fon, etc.).
 */
export const candombleNacao = z.enum([
  'ketu',
  'jeje',
  'angola',
  'efon',
  'nago_vodun',
  'outra',
]);
export type CandombleNacao = z.infer<typeof candombleNacao>;

export const CANDOMBLE_NACAO_LABEL: Record<CandombleNacao, string> = {
  ketu: 'Ketu (yorubá)',
  jeje: 'Jeje (ewe-fon)',
  angola: 'Angola (banto)',
  efon: 'Efon',
  nago_vodun: 'Nagô-vodun',
  outra: 'Outra',
};
