import type { TradicaoPrincipal } from '@/features/casas/schemas';

/**
 * Sugestões de papel/forma de tratamento usadas como autocomplete no campo
 * "Como você é chamada(o) na casa?". Cada termo é vinculado às tradições
 * em que ele faz sentido — Babalorixá só aparece pra Candomblé, etc.
 *
 * Não é exaustivo: o input continua livre. As sugestões servem só de guia.
 * Quando a tradição é 'outra', mostramos todas as sugestões.
 */
interface SugestaoPapel {
  termo: string;
  tradicoes: ReadonlyArray<TradicaoPrincipal>;
}

const SUGESTOES: ReadonlyArray<SugestaoPapel> = [
  // Universais em tradições afro-brasileiras de matriz banto/iorubá
  { termo: 'Pai de Santo', tradicoes: ['umbanda', 'quimbanda', 'omoloco', 'xamba'] },
  { termo: 'Mãe de Santo', tradicoes: ['umbanda', 'quimbanda', 'omoloco', 'xamba'] },
  { termo: 'Pai Espiritual', tradicoes: ['umbanda', 'omoloco'] },
  { termo: 'Mãe Espiritual', tradicoes: ['umbanda', 'omoloco'] },
  { termo: 'Zelador de Santo', tradicoes: ['umbanda', 'omoloco'] },
  { termo: 'Zeladora de Santo', tradicoes: ['umbanda', 'omoloco'] },
  // Candomblé Ketu/Nagô
  { termo: 'Babalorixá', tradicoes: ['candomble'] },
  { termo: 'Iyalorixá', tradicoes: ['candomble'] },
  // Candomblé Jeje
  { termo: 'Doté', tradicoes: ['candomble'] },
  { termo: 'Vodunô', tradicoes: ['candomble'] },
  // Candomblé Angola (e influência Omolocô)
  { termo: 'Tata', tradicoes: ['candomble', 'omoloco'] },
  { termo: 'Tateto', tradicoes: ['candomble', 'omoloco'] },
  { termo: 'Nengua', tradicoes: ['candomble', 'omoloco'] },
  // Quimbanda
  { termo: 'Tata Quimbanda', tradicoes: ['quimbanda'] },
  { termo: 'Mestre', tradicoes: ['quimbanda'] },
  { termo: 'Mestra', tradicoes: ['quimbanda'] },
];

/** Retorna apenas as sugestões aplicáveis à tradição informada. */
export function sugestoesPapelPara(
  tradicao: TradicaoPrincipal | null | undefined,
): string[] {
  if (!tradicao || tradicao === 'outra') {
    return SUGESTOES.map((s) => s.termo);
  }
  return SUGESTOES.filter((s) => s.tradicoes.includes(tradicao)).map(
    (s) => s.termo,
  );
}
