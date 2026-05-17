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

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-xl text-foreground">{titulo}</h2>
      <div className="mt-3 text-sm text-foreground/90">{children}</div>
    </section>
  );
}

export function FichaCasa({ casa }: { casa: Casa }) {
  const endereco = casa.enderecoPublico();
  const contato = casa.contato?.principal();

  return (
    <article className="container max-w-3xl space-y-6 py-8">
      {!casa.estaVerificada() ? (
        <aside
          role="note"
          className="rounded-lg border border-dashed border-primary bg-primary/5 p-4 text-sm"
        >
          <p className="font-medium text-primary">Casa indicada — não verificada</p>
          <p className="mt-1 text-foreground/80">
            Esta casa foi indicada pela comunidade e ainda não foi confirmada pela própria
            dirigência. Você é da casa?{' '}
            <Link
              to={`/reivindicar?casa=${casa.slug.toString()}`}
              className="font-medium text-primary hover:underline"
            >
              Reivindique aqui
            </Link>
            .
          </p>
        </aside>
      ) : null}

      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          {TRADICAO_LABEL[casa.tradicaoPrincipal] ?? casa.tradicaoPrincipal}
        </p>
        <h1 className="font-display text-4xl text-foreground">{casa.nome}</h1>
        {casa.sacerdoteNome ? (
          <p className="text-lg text-foreground/80">com {casa.sacerdoteNome}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <BadgesAbertura casa={casa} />
          <BotaoFavorito casaId={casa.id} />
        </div>
      </header>

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

      <Card titulo="Como visitar">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Endereço</dt>
            <dd className="mt-1">
              {endereco ?? (
                <span className="text-muted-foreground">
                  Endereço sob contato — combine direto pela casa.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Visitação
            </dt>
            <dd className="mt-1">
              {{
                aberto: 'Aberta a visitas.',
                jogo_previo: 'Visita após jogo prévio com a dirigência.',
                so_indicacao: 'Só por indicação.',
              }[casa.perfilAbertura.aceitaVisitantes]}
            </dd>
          </div>
        </dl>
      </Card>

      <Card titulo="Contato">
        {contato ? (
          <ul className="space-y-2">
            {casa.contato?.whatsapp ? (
              <li>
                <a
                  className="text-primary hover:underline"
                  href={`https://wa.me/${casa.contato.whatsapp.replace(/\D/g, '')}`}
                >
                  WhatsApp: {casa.contato.whatsapp}
                </a>
              </li>
            ) : null}
            {casa.contato?.telefone ? (
              <li>
                <a
                  className="text-primary hover:underline"
                  href={`tel:${casa.contato.telefone.replace(/\D/g, '')}`}
                >
                  Telefone: {casa.contato.telefone}
                </a>
              </li>
            ) : null}
            {casa.contato?.email ? (
              <li>
                <a className="text-primary hover:underline" href={`mailto:${casa.contato.email}`}>
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
    </article>
  );
}
