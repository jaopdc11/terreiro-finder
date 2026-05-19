import { Link } from 'react-router-dom';
import type { Casa } from '../domain/Casa';
import { BadgesAbertura } from './BadgesAbertura';
import { CardBlocoTradicao } from './CardBlocoTradicao';
import { CardAgendaCasa } from './CardAgendaCasa';
import { BotaoFavorito } from '@/features/favoritos/components/BotaoFavorito';

const TRADICAO_LABEL: Record<string, string> = {
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
  quimbanda: 'Quimbanda',
  omoloco: 'Omolocô',
  xamba: 'Xambá',
  outra: 'Outra tradição',
};

function Card({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-soft p-6">
      <p className="text-sm font-semibold text-foreground">{titulo}</p>
      <div className="mt-3 text-sm leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

export function FichaCasa({ casa }: { casa: Casa }) {
  const endereco = casa.enderecoPublico();
  const contato = casa.contato?.principal();

  return (
    <article className="container max-w-4xl py-12">
      <Link
        to="/mapa"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">←</span> Voltar ao mapa
      </Link>

      {!casa.estaVerificada() ? (
        <aside
          role="note"
          className="mb-8 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Indicada · Não verificada
          </p>
          <p className="mt-1.5 text-foreground/85">
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

      <header className="border-b border-border pb-8">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">
          {TRADICAO_LABEL[casa.tradicaoPrincipal] ?? casa.tradicaoPrincipal}
          {casa.bairro ? ` · ${casa.bairro}` : ''} · {casa.cidade}/{casa.estado}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {casa.nome}
        </h1>
        {casa.sacerdoteNome ? (
          <p className="mt-3 text-lg text-muted-foreground">
            com{' '}
            <span className="display-serif italic text-foreground">
              {casa.sacerdoteNome}
            </span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BadgesAbertura casa={casa} />
          <BotaoFavorito casaId={casa.id} />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-x-6 pt-10">
        <div className="col-span-12 space-y-6 md:col-span-7">
          {casa.textoAntesVisita ? (
            <Card titulo="Antes da primeira visita">
              <p className="whitespace-pre-line">{casa.textoAntesVisita}</p>
            </Card>
          ) : null}

          {casa.descricao ? (
            <Card titulo="Sobre a casa">
              <p className="whitespace-pre-line">{casa.descricao}</p>
            </Card>
          ) : null}

          <CardBlocoTradicao casa={casa} />

          <CardAgendaCasa casaId={casa.id} />
        </div>

        <aside className="col-span-12 mt-6 space-y-6 md:col-span-5 md:mt-0">
          <Card titulo="Como visitar">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Endereço
                </dt>
                <dd className="mt-1">
                  {endereco ?? (
                    <span className="text-muted-foreground">
                      Sob contato — combine pela casa.
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Visitação
                </dt>
                <dd className="mt-1">
                  {
                    {
                      aberto: 'Aberta a visitas.',
                      jogo_previo: 'Visita após jogo prévio.',
                      so_indicacao: 'Só por indicação.',
                    }[casa.perfilAbertura.aceitaVisitantes]
                  }
                </dd>
              </div>
            </dl>
          </Card>

          <Card titulo="Contato direto">
            {contato ? (
              <ul className="space-y-2">
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
              <p className="text-muted-foreground">
                A casa ainda não cadastrou canais de contato direto.
              </p>
            )}
          </Card>

          {casa.contato?.site ? (
            <Card titulo="Site da casa">
              <a
                className="link-underline inline-flex items-center gap-1.5 font-medium text-foreground"
                href={casa.contato.site}
                target="_blank"
                rel="noreferrer noopener"
              >
                {casa.contato.site.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <span aria-hidden="true">↗</span>
              </a>
            </Card>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
