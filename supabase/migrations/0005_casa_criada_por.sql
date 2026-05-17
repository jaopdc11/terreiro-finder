-- 0005_casa_criada_por.sql — coluna nova pra rastrear quem cadastrou a casa.
--
-- Necessária pra fluxo de cadastro direto pela dirigência: o user logado
-- cria casa com fonte='proprio' status='pendente'. Pra que o admin
-- consiga vincular o criador em casa_dirigentes (RLS admin-only) na
-- aprovação, precisamos saber quem é. Indicações têm `user_id` na própria
-- tabela `indicacoes_casa`; pro fluxo direto, fica em `casas.criada_por`.
--
-- on delete set null: se o user some, a casa fica órfã mas viva (admin
-- pode reatribuir ou arquivar). Index parcial só pras linhas não-null.

alter table public.casas
  add column criada_por uuid references auth.users (id) on delete set null;

create index if not exists casas_criada_por_idx
  on public.casas (criada_por)
  where criada_por is not null;
