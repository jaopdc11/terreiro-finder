-- 0013_casa_agenda.sql — agenda da casa (giras semanais + eventos pontuais)
--
-- Dois tipos:
--   - 'gira': evento semanal recorrente. Tem dia_semana (0=domingo .. 6=sábado).
--   - 'evento': ocasião pontual (festa de orixá, batismo, toque). Tem data (date
--     certa) OU data_texto (descritivo, ex "Fevereiro/2026"). Pelo menos um.
--
-- Decisão de design (conversa com usuário): festa de terreiro raramente tem
-- data fixa antecipada — preferimos editar/manter texto descritivo a inventar
-- recorrência automática.

create type public.tipo_agenda as enum ('gira', 'evento');

create table public.casa_agenda (
  id             uuid primary key default gen_random_uuid(),
  casa_id        uuid not null references public.casas (id) on delete cascade,

  tipo           public.tipo_agenda not null,
  titulo         text not null,

  -- gira: dia da semana (0=domingo .. 6=sábado)
  dia_semana     smallint,

  -- evento: data certa OU descritivo (pelo menos um, nunca ambos vazios)
  data           date,
  data_texto     text,

  horario_inicio time,
  horario_fim    time,
  descricao      text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint agenda_campos_por_tipo check (
    (tipo = 'gira'
      and dia_semana is not null
      and data is null
      and data_texto is null)
    or
    (tipo = 'evento'
      and dia_semana is null
      and (data is not null or data_texto is not null))
  ),
  constraint agenda_dia_semana_range check (
    dia_semana is null or dia_semana between 0 and 6
  ),
  constraint agenda_horario_coerente check (
    horario_fim is null or horario_inicio is null or horario_fim > horario_inicio
  )
);

create index casa_agenda_casa_idx on public.casa_agenda (casa_id);
create index casa_agenda_dia_idx  on public.casa_agenda (dia_semana) where dia_semana is not null;
create index casa_agenda_data_idx on public.casa_agenda (data) where data is not null;

create trigger casa_agenda_updated_at
  before update on public.casa_agenda
  for each row execute function public.tg_set_updated_at();

-- RLS — mesmo padrão dos blocos por tradição (0002_rls.sql §"Blocos por tradição")
alter table public.casa_agenda enable row level security;

create policy "casa_agenda: lê quando casa aprovada"
  on public.casa_agenda for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.casas c
      where c.id = casa_id and c.status = 'aprovada'
    )
  );

create policy "casa_agenda: dirigente lê"
  on public.casa_agenda for select
  to authenticated
  using (public.is_dirigente_da_casa(casa_id) or public.is_admin());

create policy "casa_agenda: dirigente gerencia"
  on public.casa_agenda for all
  to authenticated
  using (public.is_dirigente_da_casa(casa_id) or public.is_admin())
  with check (public.is_dirigente_da_casa(casa_id) or public.is_admin());

comment on table public.casa_agenda is
  'Agenda pública da casa: giras semanais (dia_semana) e eventos pontuais (data ou data_texto).';
