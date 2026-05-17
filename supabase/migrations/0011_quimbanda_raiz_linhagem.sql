-- Quimbanda: o array `linhas` modela entidades cultuadas (reinos/povos), não
-- a casa em si. Decisão do usuário no planejamento: campo característico da
-- CASA é a raiz/linhagem (terreiro-mãe ou tata iniciador), análogo ao
-- raiz_linhagem do Candomblé.

alter table public.casa_quimbanda
  add column raiz_linhagem text,
  drop column linhas;

comment on column public.casa_quimbanda.raiz_linhagem is
  'Terreiro-mãe ou tata iniciador do dirigente. Texto livre. '
  'Exibido na ficha pública.';
