-- 0009_casa_motivo_recusa.sql — coluna pra registrar motivo de recusa.
--
-- Indicações têm `indicacoes_casa.motivo_recusa` desde 0001. Casas (cadastro
-- direto, reivindicação) não tinham. Adiciona paridade. Coluna nullable —
-- preenchida apenas quando admin recusa cadastro direto ou
-- arquiva/recusa via painel.

alter table public.casas
  add column motivo_recusa text;

comment on column public.casas.motivo_recusa is
  'Motivo registrado pelo admin ao recusar/arquivar a casa. Texto livre. '
  'Visível no histórico do admin pra justificar a decisão.';
