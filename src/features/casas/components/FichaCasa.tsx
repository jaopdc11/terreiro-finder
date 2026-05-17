import { Link } from 'react-router-dom';
import type { Casa } from '../domain/Casa';
import { BadgesAbertura } from './BadgesAbertura';
import { CardBlocoTradicao } from './CardBlocoTradicao';
import { BotaoFavorito } from '@/features/favoritos/components/BotaoFavorito';

const TRADICAO_LABEL: Record<string, string> = {
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
  quimbanda: 'Quimbanda',
  omoloco: 'Omolocô',
  xamba: 'Xambá',
  outra: 'Outra tradição',
};

/**
 * Linha de info no estilo "definition list" — label compacto à esquerda,
 * valor à direita. Grid de 12 cols pra alinhamento editorial.
 */
function InfoLinha({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 border-t border-foreground/10 py-5 first:border-t-0">
      <dt className="eyebrow col-span-12 text-muted-foreground sm:col-span-3">
        {rotulo}
      </dt>
      <dd className="col-span-12 text-foreground sm:col-span-9">{children}</dd>
    </div>
  );
}

export function FichaCasa({ casa }: { casa: Casa }) {
  const endereco = casa.enderecoPublico();
  const contato = casa.contato?.principal();

  return (
    <article className="container max-w-4xl py-12">
      {!casa.estaVerificada() ? (
        <aside
          role="note"
          className="mb-10 border-l-2 border-primary bg-primary/5 px-5 py-4 text-sm"
        >
          <p className="eyebrow text-primary">Indicada — não verificada</p>
          <p className="mt-2 text-foreground/85">
            Esta casa foi indicada pela comunidade e ainda não foi confirmada
            pela própria dirigência. Você é da casa?{' '}
            <Link
              to={`/reivindicar?casa=${casa.slug.toString()}`}
              className="link-underline font-medium text-primary"
            >
              Reivindique aqui
            </Link>
            .
          </p>
        </aside>
      ) : null}

      <header className="border-b border-foreground pb-10">
        <p className="eyebrow text-primary">
          {TRADICAO_LABEL[casa.tradicaoPrincipal] ?? casa.tradicaoPrincipal}
        </p>
        <h1 className="display-hero mt-6 text-5xl text-foreground sm:text-7xl">
          {casa.nome}
        </h1>
        {casa.sacerdoteNome ? (
          <p className="mt-6 font-display text-xl text-foreground/70">
            com <em className="not-italic text-foreground">{casa.sacerdoteNome}</em>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <BadgesAbertura casa={casa} />
          <BotaoFavorito casaId={casa.id} />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-x-6 pt-10">
        <div className="col-span-12 space-y-12 md:col-span-8">
          {casa.textoAntesVisita ? (
            <section>
              <p className="eyebrow text-muted-foreground">Antes da primeira visita</p>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground/85">
                {casa.textoAntesVisita}
              </p>
            </section>
          ) : null}

          {casa.descricao ? (
            <section>
              <p className="eyebrow text-muted-foreground">Sobre a casa</p>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground/85">
                {casa.descricao}
              </p>
            </section>
          ) : null}

          <CardBlocoTradicao casa={casa} />
        </div>

        <aside className="col-span-12 mt-12 md:col-span-4 md:mt-0 md:border-l md:border-foreground/10 md:pl-6">
          <section className="border border-foreground p-6">
            <p className="eyebrow text-muted-foreground">Como visitar</p>
            <dl className="mt-2">
              <InfoLinha rotulo="Endereço">
                {endereco ?? (
                  <span className="text-muted-foreground">
                    Sob contato — combine pela casa.
                  </span>
                )}
              </InfoLinha>
              <InfoLinha rotulo="Visitação">
                {
                  {
                    aberto: 'Aberta a visitas.',
                    jogo_previo: 'Visita após jogo prévio.',
                    so_indicacao: 'Só por indicação.',
                  }[casa.perfilAbertura.aceitaVisitantes]
                }
              </InfoLinha>
            </dl>
          </section>

          <section className="mt-6 border border-foreground p-6">
            <p className="eyebrow text-muted-foreground">Contato</p>
            {contato ? (
              <ul className="mt-4 space-y-3 text-sm">
                {casa.contato?.whatsapp ? (
                  <li>
                    <a
                      className="link-underline font-medium text-foreground"
                      href={`https://wa.me/${casa.contato.whatsapp.replace(/\D/g, '')}`}
                    >
                      WhatsApp · {casa.contato.whatsapp}
                    </a>
                  </li>
                ) : null}
                {casa.contato?.telefone ? (
                  <li>
                    <a
                      className="link-underline font-medium text-foreground"
                      href={`tel:${casa.contato.telefone.replace(/\D/g, '')}`}
                    >
                      Telefone · {casa.contato.telefone}
                    </a>
                  </li>
                ) : null}
                {casa.contato?.email ? (
                  <li>
                    <a
                      className="link-underline font-medium text-foreground"
                      href={`mailto:${casa.contato.email}`}
                    >
                      {casa.contato.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                A casa ainda não cadastrou canais de contato direto.
              </p>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}
