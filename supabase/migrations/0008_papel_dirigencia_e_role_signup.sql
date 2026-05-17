-- 0008_papel_dirigencia_e_role_signup.sql
--
-- 1) Adiciona `casa_dirigentes.papel_descricao` (texto livre) pra registrar a
--    identidade tradicional da dirigência na casa — Pai/Mãe de Santo,
--    Babalorixá, Iyalorixá, Tata, Tateto, Nengua, Doté, etc. Cada casa adota
--    sua nomenclatura; o enum `papel` (principal|auxiliar) fica como categoria
--    estrutural, e `papel_descricao` carrega a forma de tratamento.
--
-- 2) Adiciona `casas.papel_dirigencia_proposto` — texto que a pessoa preencheu
--    no wizard de cadastro direto. Lido pelo admin ao aprovar; depois usado
--    pra preencher `casa_dirigentes.papel_descricao` no vínculo. Mantido como
--    histórico após aprovação.
--
-- 3) Atualiza o trigger `handle_new_user` pra ler `user_metadata.intent`. Se
--    `intent='dirigencia'`, o profile nasce com `role='dirigente'` (em vez do
--    default 'visitante'). Isso permite que o front-end mostre o banner CTA
--    "vamos cadastrar sua casa?" pra quem se identifica como dirigência no
--    signup, sem precisar passar pelo cadastro de casa antes.

alter table public.casa_dirigentes
  add column papel_descricao text;

comment on column public.casa_dirigentes.papel_descricao is
  'Forma de tratamento da dirigência na casa (Pai/Mãe de Santo, Babalorixá, '
  'Iyalorixá, Tata, Tateto, Nengua, Doté, etc.). Texto livre. Complementa o '
  'enum `papel` (principal|auxiliar) com a identidade tradicional adotada '
  'pela casa.';

alter table public.casas
  add column papel_dirigencia_proposto text;

comment on column public.casas.papel_dirigencia_proposto is
  'Texto que a pessoa preencheu no wizard de cadastro direto (/cadastrar). '
  'Lido pelo admin ao aprovar e usado pra preencher '
  'casa_dirigentes.papel_descricao. Mantido após aprovação como histórico.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'intent' = 'dirigencia'
      then 'dirigente'::public.user_role
    else
      'visitante'::public.user_role
  end;

  insert into public.profiles (id, nome_completo, nome_exibicao, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'nome_completo', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome_exibicao', ''),
      split_part(new.email, '@', 1)
    ),
    v_role
  );
  return new;
end;
$$;
