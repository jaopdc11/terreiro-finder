-- 0002_rls.sql — políticas RLS conforme docs/06-modelo-dados.md §7.2
--
-- Regras-chave (princípios §1.2):
--   - SELECT anônimo permitido só em casas aprovadas (mesmo após aprovação de
--     indicação, o registro nasce 'pendente' e fica fora do SELECT público até
--     a confirmação da casa — passo 2 da moderação).
--   - profiles: usuário lê/edita só o próprio; admin lê todos.
--   - indicacoes/reivindicacoes: usuário vê só as próprias; admin vê todas;
--     INSERT por qualquer logado.
--   - favoritos: estritamente do dono.
--   - storage casa-fotos: INSERT/UPDATE/DELETE só por dirigente da casa.

-- ============================================================================
-- profiles
-- ============================================================================

alter table public.profiles enable row level security;

create policy "profiles: leitura própria"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admin lê todas"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: update próprio"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- usuário não muda o próprio role; só admin promove (via service-role).
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "profiles: admin update tudo"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- INSERT em profiles só via trigger handle_new_user (security definer).
-- Sem policy de INSERT = bloqueado pra clientes.

-- ============================================================================
-- casas
-- ============================================================================

alter table public.casas enable row level security;

-- SELECT anônimo: somente casas aprovadas.
create policy "casas: público lê aprovadas"
  on public.casas for select
  to anon, authenticated
  using (status = 'aprovada');

-- Dirigente e admin enxergam suas casas em qualquer status.
create policy "casas: dirigente lê suas casas"
  on public.casas for select
  to authenticated
  using (public.is_dirigente_da_casa(id));

create policy "casas: admin lê todas"
  on public.casas for select
  using (public.is_admin());

-- INSERT por qualquer usuário logado (entra como pendente).
-- Garante status='pendente' e que o criador não escolha 'aprovada' direto.
create policy "casas: logado cria como pendente"
  on public.casas for insert
  to authenticated
  with check (
    status = 'pendente'
    and fonte in ('proprio', 'indicacao')
  );

-- UPDATE pelos dirigentes da casa (mas NÃO pode mudar status/fonte — admin only).
create policy "casas: dirigente atualiza própria casa"
  on public.casas for update
  to authenticated
  using (public.is_dirigente_da_casa(id))
  with check (
    public.is_dirigente_da_casa(id)
    and status = (select status from public.casas where id = casas.id)
    and fonte = (select fonte from public.casas where id = casas.id)
  );

-- UPDATE/DELETE de admin sem restrições.
create policy "casas: admin atualiza tudo"
  on public.casas for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "casas: admin deleta"
  on public.casas for delete
  using (public.is_admin());

-- ============================================================================
-- casa_dirigentes
-- ============================================================================

alter table public.casa_dirigentes enable row level security;

create policy "casa_dirigentes: leitura própria"
  on public.casa_dirigentes for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Vínculos são criados/removidos via fluxo de admin (aprovação de reivindicação).
create policy "casa_dirigentes: admin gerencia"
  on public.casa_dirigentes for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- casa_fotos
-- ============================================================================

alter table public.casa_fotos enable row level security;

-- Foto é pública se a casa for pública.
create policy "casa_fotos: lê fotos de casas aprovadas"
  on public.casa_fotos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.casas c
      where c.id = casa_id and c.status = 'aprovada'
    )
  );

create policy "casa_fotos: dirigente lê fotos da casa"
  on public.casa_fotos for select
  to authenticated
  using (public.is_dirigente_da_casa(casa_id) or public.is_admin());

create policy "casa_fotos: dirigente gerencia"
  on public.casa_fotos for all
  to authenticated
  using (public.is_dirigente_da_casa(casa_id) or public.is_admin())
  with check (public.is_dirigente_da_casa(casa_id) or public.is_admin());

-- ============================================================================
-- Blocos por tradição: visíveis junto com a casa
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array['casa_umbanda', 'casa_candomble', 'casa_quimbanda', 'casa_tambor_de_mina']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format($f$
      create policy "%1$s: lê quando casa aprovada"
        on public.%1$I for select
        to anon, authenticated
        using (
          exists (
            select 1 from public.casas c
            where c.id = casa_id and c.status = 'aprovada'
          )
        );
    $f$, t);

    execute format($f$
      create policy "%1$s: dirigente lê"
        on public.%1$I for select
        to authenticated
        using (public.is_dirigente_da_casa(casa_id) or public.is_admin());
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

-- ============================================================================
-- indicacoes_casa
-- ============================================================================

alter table public.indicacoes_casa enable row level security;

create policy "indicacoes: usuário lê próprias"
  on public.indicacoes_casa for select
  to authenticated
  using (user_id = auth.uid());

create policy "indicacoes: admin lê todas"
  on public.indicacoes_casa for select
  using (public.is_admin());

create policy "indicacoes: logado cria"
  on public.indicacoes_casa for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pendente'
  );

create policy "indicacoes: admin modera"
  on public.indicacoes_casa for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- reivindicacoes
-- ============================================================================

alter table public.reivindicacoes enable row level security;

create policy "reivindicacoes: usuário lê próprias"
  on public.reivindicacoes for select
  to authenticated
  using (user_id = auth.uid());

create policy "reivindicacoes: admin lê todas"
  on public.reivindicacoes for select
  using (public.is_admin());

create policy "reivindicacoes: logado cria"
  on public.reivindicacoes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pendente'
  );

create policy "reivindicacoes: admin modera"
  on public.reivindicacoes for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- favoritos
-- ============================================================================

alter table public.favoritos enable row level security;

create policy "favoritos: só dono"
  on public.favoritos for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- Storage: bucket casa-fotos
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('casa-fotos', 'casa-fotos', true)
on conflict (id) do nothing;

create policy "casa-fotos: leitura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'casa-fotos');

-- INSERT/UPDATE/DELETE: o primeiro segmento do path é o casa_id.
-- Padrão: /<casa_id>/<file>.jpg
create policy "casa-fotos: dirigente faz upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'casa-fotos'
    and (
      public.is_dirigente_da_casa(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  );

create policy "casa-fotos: dirigente atualiza"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'casa-fotos'
    and (
      public.is_dirigente_da_casa(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  );

create policy "casa-fotos: dirigente remove"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'casa-fotos'
    and (
      public.is_dirigente_da_casa(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  );
