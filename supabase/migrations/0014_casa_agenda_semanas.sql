-- 0014_casa_agenda_semanas.sql — semanas do mês na gira
--
-- Muitos terreiros têm sequência fixa de giras por semana do mês. Ex.:
--   1ª segunda: caboclo
--   2ª segunda: gira neutra
--   3ª segunda: preto-velho
--   4ª segunda: gira de esquerda
--
-- Cada uma vira uma entrada de gira separada (mesmo dia_semana, títulos
-- diferentes) com semanas_do_mes apontando quando acontece. NULL = toda
-- semana (gira fixa sem alternância).

alter table public.casa_agenda
  add column semanas_do_mes smallint[];

alter table public.casa_agenda
  add constraint agenda_semanas_validas check (
    semanas_do_mes is null
    or (
      array_length(semanas_do_mes, 1) > 0
      and semanas_do_mes <@ array[1, 2, 3, 4, 5]::smallint[]
    )
  );

-- Aplica só pra gira: evento não tem semana do mês (tem data ou data_texto).
alter table public.casa_agenda
  add constraint agenda_semanas_so_em_gira check (
    semanas_do_mes is null or tipo = 'gira'
  );

comment on column public.casa_agenda.semanas_do_mes is
  'Pra giras com ciclo mensal: em quais semanas do mês (1..5) a gira acontece. NULL = toda semana.';
