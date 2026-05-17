-- 0004_advisor_cleanup.sql — última passada do advisor.
--
-- Consolida as duas tabelas que ainda tinham "multiple permissive policies"
-- pro mesmo comando UPDATE: casas e profiles. Uma policy só com OR no using
-- evita Postgres avaliar todas as policies por linha.

drop policy if exists "casas: update dirigente (sem trocar status/fonte)" on public.casas;
drop policy if exists "casas: update/delete admin" on public.casas;

create policy "casas: update"
  on public.casas for update
  to authenticated
  using (
    public.is_admin() or public.is_dirigente_da_casa(id)
  )
  with check (
    public.is_admin()
    or (
      public.is_dirigente_da_casa(id)
      and status = (select c.status from public.casas c where c.id = casas.id)
      and fonte  = (select c.fonte  from public.casas c where c.id = casas.id)
    )
  );

drop policy if exists "profiles: update próprio (sem trocar role)" on public.profiles;
drop policy if exists "profiles: admin update livre" on public.profiles;

create policy "profiles: update"
  on public.profiles for update
  using (
    public.is_admin() or id = (select auth.uid())
  )
  with check (
    public.is_admin()
    or (
      id = (select auth.uid())
      and role = (select p.role from public.profiles p where p.id = (select auth.uid()))
    )
  );
