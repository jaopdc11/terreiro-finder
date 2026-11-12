import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Camera,
  Globe,
  Mail,
  MessageCircle,
  Navigation,
  Phone,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Casa } from '../domain/Casa';
import { BadgesAbertura } from './BadgesAbertura';
import { CardBlocoTradicao } from './CardBlocoTradicao';
import { CardAgendaCasa } from './CardAgendaCasa';
import { CardGaleriaCasa } from './CardGaleriaCasa';
import { SecaoMapaCasa } from './SecaoMapaCasa';
import { StickyCtaBar } from './StickyCtaBar';
import { BotaoFavorito } from '@/features/favoritos/components/BotaoFavorito';
import { useGaleriaCasa } from '../hooks/useGaleriaCasa';
import { useAgendaDaCasa } from '@/features/agenda/hooks/useAgenda';
import { Arco, Riscos } from '@/shared/components/ornamentos/Ornamentos';

const TRADICAO_LABEL: Record<string, string> = {
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
  quimbanda: 'Quimbanda',
  omoloco: 'Omolocô',
  xamba: 'Xambá',
  outra: 'Outra tradição',
};

const VISITACAO_CURTA: Record<string, string> = {
  aberto: 'Aberta',
  jogo_previo: 'Jogo prévio',
  so_indicacao: 'Por indicação',
};

export function FichaCasa({ casa }: { casa: Casa }) {
  const { data: fotos } = useGaleriaCasa(casa.id);
  const { data: eventos } = useAgendaDaCasa(casa.id);

  const endereco = casa.enderecoPublico();
  const whatsappLink = casa.contato?.whatsapp
    ? `https://wa.me/${casa.contato.whatsapp.replace(/\D/g, '')}`
    : null;

  const proximaGira = eventos
    ? eventos.find((e) => e.ehGira() && e.diaSemana !== null)
    : undefined;
  const proximoEvento = eventos
    ?.filter((e) => e.ehEvento() && e.data && !e.jaPassou())
    .sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''))[0];

  return (
    <article>
      {/* ════════════════════════════════════════════════════════ */}
      {/*  1. HERO                                                  */}
      {/* ════════════════════════════════════════════════════════ */}
      <HeroFicha
        casa={casa}
        whatsappLink={whatsappLink}
        capaUrl={fotos?.[0]?.url ?? null}
      />

      {/* ════════════════════════════════════════════════════════ */}
      {/*  2. STATS BAR                                             */}
      {/* ════════════════════════════════════════════════════════ */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-6xl px-4">
          <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
            <Stat
              icon={Sparkles}
              label="Tradição"
              valor={TRADICAO_LABEL[casa.tradicaoPrincipal] ?? casa.tradicaoPrincipal}
            />
            <Stat
              icon={Users}
              label="Visitação"
              valor={VISITACAO_CURTA[casa.perfilAbertura.aceitaVisitantes] ?? '—'}
            />
            <Stat
              icon={CalendarDays}
              label="Próxima gira"
              valor={proximaGira?.descricaoQuando() ?? proximoEvento?.descricaoQuando() ?? '—'}
              muted={!proximaGira && !proximoEvento}
            />
            <Stat
              icon={Camera}
              label="Fotos"
              valor={fotos && fotos.length > 0 ? String(fotos.length) : '—'}
              muted={!fotos || fotos.length === 0}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  3. BANNER NÃO VERIFICADA                                 */}
      {/* ════════════════════════════════════════════════════════ */}
      {!casa.estaVerificada() ? (
        <div className="container max-w-5xl px-4 pt-10">
          <aside
            role="note"
            className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Indicada · Não verificada
            </p>
            <p className="mt-1.5 text-foreground/85">
              Esta casa foi indicada pela comunidade e ainda não foi confirmada pela
              própria dirigência. Você é da casa?{' '}
              <Link
                to={`/reivindicar?casa=${casa.slug.toString()}`}
                className="link-underline font-medium text-primary"
              >
                Reivindique aqui
              </Link>
              .
            </p>
          </aside>
        </div>
      ) : null}

      {/* ════════════════════════════════════════════════════════ */}
      {/*  4. GALERIA (full-bleed)                                  */}
      {/* ════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-card pb-16 pt-16">
        <div className="container max-w-6xl px-4">
          <SecaoTitulo eyebrow="Galeria" titulo="A casa por dentro" />
        </div>
        <div className="mt-8">
          <CardGaleriaCasa casaId={casa.id} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  5. SOBRE A CASA                                          */}
      {/* ════════════════════════════════════════════════════════ */}
      {(casa.textoAntesVisita || casa.descricao) ? (
        <section className="border-b border-border py-20">
          <div className="container max-w-4xl px-4">
            <SecaoTitulo eyebrow="Sobre a casa" titulo="Antes de visitar" />

            {casa.textoAntesVisita ? (
              <blockquote className="mt-10 max-w-3xl">
                <p className="quote-display text-2xl leading-snug text-foreground md:text-3xl">
                  {casa.textoAntesVisita}
                </p>
              </blockquote>
            ) : null}

            {casa.descricao ? (
              <div className="mt-10 max-w-3xl">
                <p className="whitespace-pre-line text-base leading-relaxed text-foreground/85">
                  {casa.descricao}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ════════════════════════════════════════════════════════ */}
      {/*  6. TRADIÇÃO (Candomblé/Quimbanda)                        */}
      {/* ════════════════════════════════════════════════════════ */}
      <BlocoTradicaoEnvolto casa={casa} />

      {/* ════════════════════════════════════════════════════════ */}
      {/*  7. AGENDA                                                */}
      {/* ════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-card py-20">
        <div className="container max-w-6xl px-4">
          <SecaoTitulo eyebrow="Agenda" titulo="Quando acontece" />
          <div className="mt-10">
            <CardAgendaCasa casaId={casa.id} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/*  8. COMO CHEGAR                                           */}
      {/* ════════════════════════════════════════════════════════ */}
      {(casa.coordenadas || endereco) ? (
        <section className="border-b border-border py-20">
          <div className="container max-w-6xl px-4">
            <SecaoTitulo
              eyebrow={casa.localizacaoAproximada ? 'Localização' : 'Como chegar'}
              titulo={casa.localizacaoAproximada ? 'Região da casa' : 'Endereço e mapa'}
            />
            <div className="mt-10">
              <SecaoMapaCasa casa={casa} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ════════════════════════════════════════════════════════ */}
      {/*  9. CONTATO                                               */}
      {/* ════════════════════════════════════════════════════════ */}
      <section className="bg-card py-20">
        <div className="container max-w-6xl px-4">
          <SecaoTitulo eyebrow="Contato" titulo="Falar com a casa" />
          <div className="mt-10">
            <BlocoContato casa={casa} whatsappLink={whatsappLink} />
          </div>
        </div>
      </section>

      {/* Espaço pra não bater no sticky bar mobile */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      {/* Sticky CTA bar (mobile-first) */}
      <StickyCtaBar casa={casa} whatsappLink={whatsappLink} />
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  HERO                                                           */
/* ─────────────────────────────────────────────────────────────── */

function HeroFicha({
  casa,
  whatsappLink,
  capaUrl,
}: {
  casa: Casa;
  whatsappLink: string | null;
  capaUrl: string | null;
}) {
  const temCapa = !!capaUrl;
  // Localização aproximada (~1 km) não dá rota.
  const temRota = casa.coordenadas !== null && !casa.localizacaoAproximada;

  return (
    <div className="hero-gradient relative overflow-hidden">
      {/* Foto de capa em desktop: mask-image faz a foto desaparecer fisicamente nas bordas */}
      {temCapa ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68%] lg:block"
        >
          <img
            src={capaUrl!}
            alt=""
            className="h-full w-full object-cover opacity-80"
            style={{
              maskImage:
                'radial-gradient(ellipse 95% 130% at 100% 50%, black 30%, rgba(0,0,0,0.6) 60%, transparent 95%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 95% 130% at 100% 50%, black 30%, rgba(0,0,0,0.6) 60%, transparent 95%)',
            }}
          />
          {/* Tint cremoso geral pra reduzir contraste e dessaturar a foto */}
          <div className="absolute inset-0 bg-background/20" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-8 hidden opacity-[0.06] md:block"
        >
          <Arco className="h-56 w-[28rem] text-foreground" />
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
      />

      {/* Banner mobile: foto cobrindo o topo */}
      {temCapa ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted lg:hidden">
          <img
            src={capaUrl!}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        </div>
      ) : null}

      <div className="container relative max-w-5xl px-4 pb-16 pt-12">
        <Link
          to="/mapa"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Voltar ao mapa
        </Link>

        <div className={`mt-12 ${temCapa ? 'lg:max-w-xl' : 'max-w-3xl'}`}>
          <p className="eyebrow eyebrow-ornado inline-flex items-center">
            {TRADICAO_LABEL[casa.tradicaoPrincipal] ?? casa.tradicaoPrincipal}
            {casa.bairro ? ` · ${casa.bairro}` : ''} · {casa.cidade}/{casa.estado}
          </p>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            {casa.nome}
          </h1>

          {casa.sacerdoteNome ? (
            <p className="mt-5 text-xl text-muted-foreground md:text-2xl">
              com{' '}
              <span className="display-serif italic text-foreground">
                {casa.sacerdoteNome}
              </span>
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <BadgesAbertura casa={casa} />
            <BotaoFavorito casaId={casa.id} />
          </div>

          {(whatsappLink || temRota) ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  data-analytics="contato_whatsapp"
                  className="inline-flex items-center gap-2 rounded-md bg-terra-pemba px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-terra-pemba/90"
                >
                  <MessageCircle size={16} />
                  Falar no WhatsApp
                </a>
              ) : null}
              {temRota ? (
                <a
                  href="#como-chegar"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30"
                >
                  <Navigation size={16} />
                  Como chegar
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  STATS BAR                                                      */
/* ─────────────────────────────────────────────────────────────── */

function Stat({
  icon: Icon,
  label,
  valor,
  muted = false,
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-5 md:px-6 md:py-6">
      <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-terra-pemba/10">
        <Icon size={16} strokeWidth={1.75} className="text-terra-pemba" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-1 truncate text-sm font-semibold leading-tight md:text-base ${
            muted ? 'text-foreground/40' : 'text-foreground'
          }`}
          title={valor}
        >
          {valor}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TÍTULO DE SEÇÃO REUTILIZÁVEL                                   */
/* ─────────────────────────────────────────────────────────────── */

function SecaoTitulo({
  eyebrow,
  titulo,
}: {
  eyebrow: string;
  titulo: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow eyebrow-ornado inline-flex items-center">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {titulo}
        </h2>
      </div>
      <Riscos className="hidden h-6 w-32 opacity-30 md:block" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  BLOCO TRADIÇÃO ENVOLTO (só renderiza se houver conteúdo)       */
/* ─────────────────────────────────────────────────────────────── */

function BlocoTradicaoEnvolto({ casa }: { casa: Casa }) {
  if (casa.tradicaoPrincipal !== 'candomble' && casa.tradicaoPrincipal !== 'quimbanda') {
    return null;
  }
  return (
    <section className="relative border-b border-border py-20">
      <div className="container max-w-5xl px-4">
        <SecaoTitulo eyebrow="Tradição" titulo="Sobre a casa" />
        <div className="mt-10">
          <CardBlocoTradicao casa={casa} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  CONTATO — cards grandes                                        */
/* ─────────────────────────────────────────────────────────────── */

function BlocoContato({
  casa,
  whatsappLink,
}: {
  casa: Casa;
  whatsappLink: string | null;
}) {
  const items: Array<{
    href: string;
    icon: LucideIcon;
    label: string;
    valor: string;
    evento: string;
    pemba?: boolean;
    external?: boolean;
  }> = [];

  if (whatsappLink && casa.contato?.whatsapp) {
    items.push({
      href: whatsappLink,
      icon: MessageCircle,
      label: 'WhatsApp',
      evento: 'contato_whatsapp',
      valor: casa.contato.whatsapp,
      pemba: true,
    });
  }
  if (casa.contato?.telefone) {
    items.push({
      href: `tel:${casa.contato.telefone.replace(/\D/g, '')}`,
      icon: Phone,
      label: 'Telefone',
      evento: 'contato_telefone',
      valor: casa.contato.telefone,
    });
  }
  if (casa.contato?.email) {
    items.push({
      href: `mailto:${casa.contato.email}`,
      icon: Mail,
      label: 'E-mail',
      evento: 'contato_email',
      valor: casa.contato.email,
    });
  }
  if (casa.contato?.site) {
    items.push({
      href: casa.contato.site,
      icon: Globe,
      label: 'Site',
      evento: 'contato_site',
      valor: casa.contato.site.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      external: true,
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-6 py-10 text-center">
        <Mail size={24} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
        <p className="mt-3 text-base font-medium text-foreground">
          A casa ainda não cadastrou canais públicos de contato.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente o endereço ou visite presencialmente em dia de gira.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <a
            key={it.label}
            href={it.href}
            data-analytics={it.evento}
            {...(it.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            className={`group flex flex-col gap-3 rounded-md border p-5 transition-all ${
              it.pemba
                ? 'border-terra-pemba bg-terra-pemba text-white hover:bg-terra-pemba/90'
                : 'border-border bg-background hover:border-foreground/30 hover:shadow-soft'
            }`}
          >
            <Icon
              size={20}
              strokeWidth={1.75}
              className={it.pemba ? 'text-white' : 'text-terra-pemba'}
            />
            <div className="min-w-0">
              <p
                className={`text-[10px] font-semibold uppercase tracking-widest ${
                  it.pemba ? 'text-white/70' : 'text-muted-foreground'
                }`}
              >
                {it.label}
              </p>
              <p
                className={`mt-1 truncate text-sm font-semibold ${
                  it.pemba ? 'text-white' : 'text-foreground'
                }`}
                title={it.valor}
              >
                {it.valor}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
