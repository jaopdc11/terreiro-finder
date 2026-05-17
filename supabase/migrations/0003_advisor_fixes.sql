-- 0003_advisor_fixes.sql — corrige warnings do Supabase Advisor.
--
-- Performance:
--   - Indexes pros 4 FKs descobertos sem index (PostgREST + DELETE em parent).
--   - Recria policies que usam `auth.uid()` pra usar `(select auth.uid())`:
--     força inicialização única do plano em vez de avaliar por linha.
--   - Consolida múltiplas policies permissivas em SELECT (warning "multiple
--     permissive policies" — Postgres avalia OR de todas por linha; uma policy
--     com OR explícito é mais barato).
--
-- Segurança:
--   - `tg_set_updated_at` recriada com `set search_path = ''` (advisor
--     "function_search_path_mutable").
--   - Functions helper são qualificadas com schema explícito agora que o
--     search_path é vazio.

-- ============================================================================
-- 1. Indexes faltando em FKs
-- ============================================================================

create index if not exists casas_aprovada_por_idx
  on public.casas (aprovada_por)
  where aprovada_por is not null;

create index if not exists indicacoes_moderado_por_idx
  on public.indicacoes_casa (moderado_por)
  where moderado_por is not null;

create index if not exists indicacoes_casa_id_idx
  on public.indicacoes_casa (casa_id)
  where casa_id is not null;

create index if not exists reivindicacoes_moderado_por_idx
  on public.reivindicacoes (moderado_por)
  where moderado_por is not null;

-- ============================================================================
-- 2. Functions: search_path imutável + schema explícito
-- ============================================================================

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.is_dirigente_da_casa(p_casa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.casa_dirigentes
    where casa_id = p_casa_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome_completo, nome_exibicao)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'nome_completo', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome_exibicao', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

-- ============================================================================
-- 3. Policies: substitui auth.uid() por (select auth.uid()) e consolida
-- ============================================================================

-- profiles
drop policy if exists "profiles: leitura própria" on public.profiles;
drop policy if exists "profiles: admin lê todas" on public.profiles;
drop policy if exists "profiles: update próprio" on public.profiles;
drop policy if exists "profiles: admin update tudo" on public.profiles;

create policy "profiles: select"
  on public.profiles for select
  using (
    id = (select auth.uid())
    or public.is_admin()
  );

create policy "profiles: update próprio (sem trocar role)"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = (select p.role from public.profiles p where p.id = (select auth.uid()))
  );

create policy "profiles: admin update livre"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- casas
drop policy if exists "casas: público lê aprovadas" on public.casas;
drop policy if exists "casas: dirigente lê suas casas" on public.casas;
drop policy if exists "casas: admin lê todas" on public.casas;
drop policy if exists "casas: logado cria como pendente" on public.casas;
drop policy if exists "casas: dirigente atualiza própria casa" on public.casas;
drop policy if exists "casas: admin atualiza tudo" on public.casas;
drop policy if exists "casas: admin deleta" on public.casas;

create policy "casas: select"
  on public.casas for select
  using (
    status = 'aprovada'
    or public.is_dirigente_da_casa(id)
    or public.is_admin()
  );

create policy "casas: insert (logado, como pendente)"
  on public.casas for insert
  to authenticated
  with check (
    status = 'pendente'
    and fonte in ('proprio', 'indicacao')
  );

create policy "casas: update dirigente (sem trocar status/fonte)"
  on public.casas for update
  to authenticated
  using (public.is_dirigente_da_casa(id))
  with check (
    public.is_dirigente_da_casa(id)
    and status = (select c.status from public.casas c where c.id = casas.id)
    and fonte  = (select c.fonte  from public.casas c where c.id = casas.id)
  );

create policy "casas: update/delete admin"
  on public.casas for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "casas: delete admin"
  on public.casas for delete
  using (public.is_admin());

-- casa_dirigentes
drop policy if exists "casa_dirigentes: leitura própria" on public.casa_dirigentes;
drop policy if exists "casa_dirigentes: admin gerencia" on public.casa_dirigentes;

create policy "casa_dirigentes: select"
  on public.casa_dirigentes for select
  using (
    user_id = (select auth.uid())
    or public.is_admin()
  );

create policy "casa_dirigentes: admin gerencia"
  on public.casa_dirigentes for all
  using (public.is_admin())
  with check (public.is_admin());

-- casa_fotos
drop policy if exists "casa_fotos: lê fotos de casas aprovadas" on public.casa_fotos;
drop policy if exists "casa_fotos: dirigente lê fotos da casa" on public.casa_fotos;
drop policy if exists "casa_fotos: dirigente gerencia" on public.casa_fotos;

create policy "casa_fotos: select"
  on public.casa_fotos for select
  using (
    exists (select 1 from public.casas c where c.id = casa_id and c.status = 'aprovada')
    or public.is_dirigente_da_casa(casa_id)
    or public.is_admin()
  );

create policy "casa_fotos: dirigente gerencia"
  on public.casa_fotos for all
  to authenticated
  using (public.is_dirigente_da_casa(casa_id) or public.is_admin())
  with check (public.is_dirigente_da_casa(casa_id) or public.is_admin());

-- Blocos por tradição
do $$
declare t text;
begin
  foreach t in array array['casa_umbanda','casa_candomble','casa_quimbanda','casa_tambor_de_mina']
  loop
    execute format('drop policy if exists "%1$s: lê quando casa aprovada" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: dirigente lê" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: dirigente gerencia" on public.%1$I', t);

    execute format($f$
      create policy "%1$s: select"
        on public.%1$I for select
        using (
          exists (select 1 from public.casas c where c.id = casa_id and c.status = 'aprovada')
          or public.is_dirigente_da_casa(casa_id)
          or public.is_admin()
        );
    $f$, t);

    execute format($f$
      create policy "%1$s: dirigente gerencia"
        on public.%1$I for all
        to authenticated
        using (public.is_dirigente_da_casa(casa_id) or public.is_admin())
        with check (public.is_dirigente_da_casa(casa_id) or public.is_admin());
    $f$, t);
  end loop;
end$$;

-- indicacoes_casa
drop policy if exists "indicacoes: usuário lê próprias" on public.indicacoes_casa;
drop policy if exists "indicacoes: admin lê todas" on public.indicacoes_casa;
drop policy if exists "indicacoes: logado cria" on public.indicacoes_casa;
drop policy if exists "indicacoes: admin modera" on public.indicacoes_casa;

create policy "indicacoes: select"
  on public.indicacoes_casa for select
  using (
    user_id = (select auth.uid())
    or public.is_admin()
  );

create policy "indicacoes: insert (logado, pendente, próprio)"
  on public.indicacoes_casa for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pendente'
  );

create policy "indicacoes: admin modera"
  on public.indicacoes_casa for update
  using (public.is_admin())
  with check (public.is_admin());

-- reivindicacoes
drop policy if exists "reivindicacoes: usuário lê próprias" on public.reivindicacoes;
drop policy if exists "reivindicacoes: admin lê todas" on public.reivindicacoes;
drop policy if exists "reivindicacoes: logado cria" on public.reivindicacoes;
drop policy if exists "reivindicacoes: admin modera" on public.reivindicacoes;

create policy "reivindicacoes: select"
  on public.reivindicacoes for select
  using (
    user_id = (select auth.uid())
    or public.is_admin()
  );

create policy "reivindicacoes: insert (logado, pendente, próprio)"
  on public.reivindicacoes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pendente'
  );

create policy "reivindicacoes: admin modera"
  on public.reivindicacoes for update
  using (public.is_admin())
  with check (public.is_admin());

-- favoritos
drop policy if exists "favoritos: só dono" on public.favoritos;

create policy "favoritos: dono"
  on public.favoritos for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ============================================================================
-- 4. Storage casa-fotos: substitui auth.uid()-by-row e protege wildcards
-- ============================================================================

drop policy if exists "casa-fotos: leitura pública" on storage.objects;
drop policy if exists "casa-fotos: dirigente faz upload" on storage.objects;
drop policy if exists "casa-fotos: dirigente atualiza" on storage.objects;
drop policy if exists "casa-fotos: dirigente remove" on storage.objects;

create policy "casa-fotos: select público"
  on storage.objects for select
  using (bucket_id = 'casa-fotos');

create policy "casa-fotos: dirigente escreve"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'casa-fotos'
    and (
      public.is_dirigente_da_casa(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  )
  with check (
    bucket_id = 'casa-fotos'
    and (
      public.is_dirigente_da_casa(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  );
