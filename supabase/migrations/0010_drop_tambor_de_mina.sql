-- Tambor de Mina sai do MVP: não existe casa dessa tradição em Itajaí.
-- Decisão tomada com o usuário (umbandista) durante planejamento dos blocos.
-- Se aparecer casa no banco com essa tradição (defensivo), reclassificamos
-- como 'outra' antes do enum reset.

-- 1. Defensivo: move qualquer casa com tradicao_principal='tambor_de_mina' pra 'outra'.
update public.casas set tradicao_principal = 'outra'
  where tradicao_principal = 'tambor_de_mina';

-- 2. Drop tabela específica (idempotente).
drop table if exists public.casa_tambor_de_mina;

-- 3. Reconstrói o enum sem 'tambor_de_mina'. Postgres não permite remover
--    valor de enum existente; o jeito é criar novo type, fazer cast da
--    coluna, dropar o antigo.
alter type public.tradicao_principal rename to tradicao_principal_old;

create type public.tradicao_principal as enum (
  'umbanda', 'candomble', 'quimbanda', 'omoloco', 'xamba', 'outra'
);

alter table public.casas
  alter column tradicao_principal type public.tradicao_principal
  using tradicao_principal::text::public.tradicao_principal;

drop type public.tradicao_principal_old;
