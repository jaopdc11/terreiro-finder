/**
 * Sugestões de papel/forma de tratamento usadas como `<datalist>` no wizard
 * de cadastro de casa. Não é exaustiva — o input é livre. As sugestões
 * foram coletadas em pesquisa sobre as tradições afro/afro-indígenas que
 * o projeto cobre (ver dev_docs/03-tradicoes.md).
 *
 * Ordem: começa pelos termos mais universais (Pai/Mãe de Santo), depois
 * vai por tradição. Casa adota a forma que faz sentido pra ela.
 */
export const SUGESTOES_PAPEL = [
  // Universais (Umbanda, Omolocô, Tambor de Mina, Xambá)
  'Pai de Santo',
  'Mãe de Santo',
  'Pai Espiritual',
  'Mãe Espiritual',
  'Zelador de Santo',
  'Zeladora de Santo',
  // Candomblé Ketu/Nagô
  'Babalorixá',
  'Iyalorixá',
  // Candomblé Jeje
  'Doté',
  'Vodunô',
  // Candomblé Angola (e influência Omolocô)
  'Tata',
  'Tateto',
  'Nengua',
  // Quimbanda
  'Tata Quimbanda',
  'Mestre',
  'Mestra',
] as const;
