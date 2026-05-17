-- 0001_init.sql — schema base de terreiros
-- Tabelas, enums, triggers e helpers. RLS vai em 0002_rls.sql.

set check_function_bodies = off;

-- ============================================================================
-- Enums
-- ============================================================================

create type public.user_role as enum ('visitante', 'dirigente', 'admin');

create type public.casa_status as enum ('pendente', 'aprovada', 'recusada', 'arquivada');
create type public.casa_fonte as enum ('indicacao', 'proprio', 'reivindicada');
create type public.endereco_visibilidade as enum ('publico', 'sob_contato', 'oculto');
create type public.aceita_visitantes as enum ('aberto', 'jogo_previo', 'so_indicacao');
create type public.foto_registro as enum ('permitido', 'proibido', 'parcial');

create type public.tradicao_principal as enum (
  'umbanda',
  'candomble',
  'quimbanda',
  'tambor_de_mina',
  'omoloco',
  'xamba',
  'outra'
);

create type public.papel_dirigente as enum ('principal', 'auxiliar');

create type public.moderacao_status as enum ('pendente', 'aprovada', 'recusada');

create type public.umbanda_sincretismo as enum ('nenhum', 'parcial', 'forte');
create type public.umbanda_kardecismo as enum ('nenhuma', 'parcial', 'acentuada');
create type public.umbanda_sacralizacao as enum ('sim', 'nao', 'parcial');

create type public.candomble_nacao as enum ('ketu', 'jeje', 'angola', 'efon', 'nago_vodun');

-- ============================================================================
-- Tabelas
-- ============================================================================

-- profiles estende auth.users
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  nome_completo   text,
  nome_exibicao   text,
  role            public.user_role not null default 'visitante',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is
  'Dados do usuário além do auth.users. role controla quem administra.';

create table public.casas (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text not null unique,
  nome                    text not null,
  descricao               text,
  sacerdote_nome          text,
  tradicao_principal      public.tradicao_principal not null,
  status                  public.casa_status not null default 'pendente',
  fonte                   public.casa_fonte not null,

  -- endereço
  logradouro              text,
  numero                  text,
  complemento             text,
  bairro                  text,
  cidade                  text not null,
  estado                  text not null,
  cep                     text,
  endereco_visibilidade   public.endereco_visibilidade not null default 'sob_contato',

  -- geolocalização (opcional)
  coord_lat               double precision,
  coord_lng               double precision,

  -- abertura
  aceita_visitantes       public.aceita_visitantes not null default 'jogo_previo',
  foto_registro           public.foto_registro not null default 'parcial',

  -- contato direto (MVP: sem mensageria interna)
  whatsapp                text,
  telefone                text,
  email_contato           text,

  texto_antes_visita      text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  aprovada_em             timestamptz,
  aprovada_por            uuid references auth.users (id) on delete set null,

  constraint coord_par_completo check (
    (coord_lat is null and coord_lng is null)
    or (coord_lat is not null and coord_lng is not null)
  ),
  constraint coord_validas check (
    coord_lat is null or (coord_lat between -90 and 90)
  ),
  constraint coord_lng_valida check (
    coord_lng is null or (coord_lng between -180 and 180)
  )
);

comment on table public.casas is
  'Casas religiosas. Verificada = fonte in (proprio, reivindicada) AND status=aprovada (regra de domínio em Casa.estaVerificada).';

create index casas_status_idx on public.casas (status);
create index casas_tradicao_idx on public.casas (tradicao_principal);
create index casas_cidade_idx on public.casas (cidade);
create index casas_bairro_idx on public.casas (bairro);

create table public.casa_dirigentes (
  casa_id  uuid not null references public.casas (id) on delete cascade,
  user_id  uuid not null references auth.users (id) on delete cascade,
  papel    public.papel_dirigente not null default 'principal',
  created_at timestamptz not null default now(),
  primary key (casa_id, user_id)
);

create index casa_dirigentes_user_idx on public.casa_dirigentes (user_id);

create table public.casa_fotos (
  id        uuid primary key default gen_random_uuid(),
  casa_id   uuid not null references public.casas (id) on delete cascade,
  url       text not null,
  ordem     int  not null default 0,
  created_at timestamptz not null default now()
);

create index casa_fotos_casa_idx on public.casa_fotos (casa_id, ordem);

-- Bloco Umbanda (1:1 com casas)
create table public.casa_umbanda (
  casa_id              uuid primary key references public.casas (id) on delete cascade,
  sincretismo          public.umbanda_sincretismo,
  influencia_kardecista public.umbanda_kardecismo,
  linhagem             text[] not null default '{}',
  sacralizacao         public.umbanda_sacralizacao,
  linhas_trabalhadas   text[] not null default '{}'
);

-- Bloco Candomblé
create table public.casa_candomble (
  casa_id        uuid primary key references public.casas (id) on delete cascade,
  nacao          public.candomble_nacao,
  raiz_linhagem  text,
  orixa_da_casa  text,
  lingua_ritual  text
);

-- Bloco Quimbanda
create table public.casa_quimbanda (
  casa_id                  uuid primary key references public.casas (id) on delete cascade,
  corrente                 text,
  linhas                   text[] not null default '{}',
  aberta_a_nao_iniciados   boolean
);

-- Bloco Tambor de Mina
create table public.casa_tambor_de_mina (
  casa_id          uuid primary key references public.casas (id) on delete cascade,
  casa_mae         text,
  familia_espiritual text
);

create table public.indicacoes_casa (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  nome                text not null,
  bairro              text,
  cidade              text not null,
  estado              text not null,
  tradicao_principal  public.tradicao_principal,
  observacoes         text,
  -- canal pra admin contatar a casa no passo 2 da moderação
  canal_contato       text,
  status              public.moderacao_status not null default 'pendente',
  casa_id             uuid references public.casas (id) on delete set null,
  moderado_por        uuid references auth.users (id) on delete set null,
  moderado_em         timestamptz,
  motivo_recusa       text,
  created_at          timestamptz not null default now()
);

create index indicacoes_user_idx on public.indicacoes_casa (user_id);
create index indicacoes_status_idx on public.indicacoes_casa (status);

create table public.reivindicacoes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  casa_id       uuid not null references public.casas (id) on delete cascade,
  observacoes   text,
  status        public.moderacao_status not null default 'pendente',
  moderado_por  uuid references auth.users (id) on delete set null,
  moderado_em   timestamptz,
  motivo_recusa text,
  created_at    timestamptz not null default now()
);

create index reivindicacoes_user_idx on public.reivindicacoes (user_id);
create index reivindicacoes_casa_idx on public.reivindicacoes (casa_id);
create index reivindicacoes_status_idx on public.reivindicacoes (status);

create table public.favoritos (
  user_id    uuid not null references auth.users (id) on delete cascade,
  casa_id    uuid not null references public.casas (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, casa_id)
);

-- ============================================================================
-- Triggers e helpers
-- ============================================================================

-- Mantém updated_at atualizado
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

create trigger casas_set_updated_at
  before update on public.casas
  for each row execute function public.tg_set_updated_at();

-- Cria profile automaticamente quando user nasce em auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Funções helper pra RLS
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_dirigente_da_casa(p_casa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.casa_dirigentes
    where casa_id = p_casa_id and user_id = auth.uid()
  );
$$;
