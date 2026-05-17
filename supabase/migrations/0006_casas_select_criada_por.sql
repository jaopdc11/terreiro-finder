-- 0006_casas_select_criada_por.sql — ajusta SELECT policy de casas pra
-- incluir o caso "user que cadastrou pode ler a própria casa em pendente".
--
-- Necessário pra que o INSERT com .select() (RETURNING) no fluxo de
-- cadastro direto não dispare RLS violation: o user recém-criou a row
-- e ainda não está em casa_dirigentes, mas precisa ver o id pra
-- saber pra onde redirecionar / acompanhar o pedido.
--
-- Continua escondendo casas pendentes do anon (status != 'aprovada')
-- e mantém todas as outras condições.

drop policy if exists "casas: select" on public.casas;

-- NOTA: usamos auth.uid() direto (sem subquery wrapper) — o wrapper
-- (select auth.uid()) interage de forma estranha com a subquery do
-- WITH CHECK da policy de UPDATE de casas (`select c.status from casas c`),
-- causando "infinite recursion in policy" no planner. Com auth.uid() simples,
-- o avaliador é determinístico em uma só passagem.
create policy "casas: select"
  on public.casas for select
  using (
    status = 'aprovada'
    or public.is_dirigente_da_casa(id)
    or public.is_admin()
    or criada_por = auth.uid()
  );
