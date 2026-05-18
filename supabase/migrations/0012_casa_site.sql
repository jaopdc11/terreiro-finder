-- Casas que têm presença online própria (site / blog / página dedicada) podem
-- agora cadastrar a URL. Mostrada na ficha pública como link externo.
alter table public.casas add column site text;

comment on column public.casas.site is
  'URL do site/blog/página oficial da casa. Texto livre validado como '
  'URL no client. Exibido publicamente na ficha quando preenchido.';
