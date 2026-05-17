-- 0007_casa_canal_validacao.sql — canal pra admin validar dirigência
-- em cadastro direto.
--
-- Quando alguém usa /cadastrar afirmando "sou dirigência dessa casa",
-- precisa fornecer um canal independente pra o admin confirmar a
-- identidade (Instagram da casa, telefone fixo do espaço, foto da fachada,
-- link de prova). Sem isso, o "selo verificado" do cadastro direto perde
-- significado.
--
-- Coluna fica nullable porque casas vindas de indicação/reivindicação não
-- usam esse campo. Histórico mantido após aprovação — admin pode revisar.

alter table public.casas
  add column canal_validacao text;

comment on column public.casas.canal_validacao is
  'Texto livre informado em cadastros diretos (fonte=proprio) — admin usa pra '
  'fazer contato cruzado antes de validar a dirigência. Indicação tem o '
  'equivalente em indicacoes_casa.canal_contato.';
