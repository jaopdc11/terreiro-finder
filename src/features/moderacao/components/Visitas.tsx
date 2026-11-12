import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Globe, Mail, MessageCircle, Navigation, Phone, type LucideIcon } from 'lucide-react';
import { ApiError } from '@/shared/lib/ApiClient';
import type { LinhaEvento, LinhaTop, Periodo, PontoSerie } from '../api/EstatisticasRepository';
import { useVisitas } from '../hooks/useVisitas';

const OPCOES = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '90 dias' },
] as const;

/** Eventos de contato marcados com `data-analytics` na ficha da casa. */
const CONTATOS: ReadonlyArray<{ tipo: string; label: string; icon: LucideIcon }> = [
  { tipo: 'contato_whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { tipo: 'contato_telefone', label: 'Telefone', icon: Phone },
  { tipo: 'contato_email', label: 'E-mail', icon: Mail },
  { tipo: 'contato_site', label: 'Site da casa', icon: Globe },
  { tipo: 'rota_google_maps', label: 'Rota no Google Maps', icon: Navigation },
  { tipo: 'rota_waze', label: 'Rota no Waze', icon: Navigation },
];

const NOMES_PAGINA: Record<string, string> = {
  '/': 'Página inicial',
  '/mapa': 'Mapa de casas',
  '/sobre': 'Sobre',
  '/politica': 'Política de privacidade',
  '/indicar': 'Indicar uma casa',
  '/cadastrar': 'Cadastrar casa',
};

// dia local no formato AAAA-MM-DD (a série do analytics já vem no fuso de São Paulo)
function chaveDia(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

function periodoDe(dias: number): { periodo: Periodo; inicio: Date } {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - (dias - 1));
  return { periodo: { de: inicio.toISOString(), ate: new Date().toISOString() }, inicio };
}

function duracao(s: number): string {
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60);
  const resto = s % 60;
  return resto ? `${min} min ${resto} s` : `${min} min`;
}

const numero = (n: number) => n.toLocaleString('pt-BR');

function nomePagina(path: string): string {
  if (NOMES_PAGINA[path]) return NOMES_PAGINA[path];
  if (path.startsWith('/casa/')) return `Casa · ${decodeURIComponent(path.slice(6))}`;
  return path;
}

function origemLegivel(v: string): string {
  if (v === '(desconhecido)' || !v) return 'Acesso direto ou link salvo';
  const host = v.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? v;
  if (/instagram/.test(host)) return 'Instagram';
  if (/facebook|fb\./.test(host)) return 'Facebook';
  if (/google/.test(host)) return 'Google';
  if (/whatsapp|wa\.me/.test(host)) return 'WhatsApp';
  return host;
}

// junta linhas que viraram o mesmo rótulo (ex.: instagram.com e l.instagram.com)
function agrupar(linhas: LinhaTop[], rotular: (v: string) => string) {
  const somas = new Map<string, number>();
  for (const l of linhas) somas.set(rotular(l.valor), (somas.get(rotular(l.valor)) ?? 0) + l.visitas);
  return [...somas].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor);
}

function mensagemDeErro(e: unknown): string {
  if (e instanceof ApiError && e.status === 503) {
    return 'As estatísticas de visitas ainda não foram configuradas no servidor.';
  }
  if (e instanceof ApiError && e.status === 502) {
    return 'O serviço de estatísticas está indisponível no momento. Tente novamente mais tarde.';
  }
  return 'Não foi possível carregar as visitas. Tente novamente mais tarde.';
}

export function Visitas() {
  const [dias, setDias] = useState<number>(30);
  const { periodo, inicio } = useMemo(() => periodoDe(dias), [dias]);
  const { data: dados, error, isLoading } = useVisitas(periodo);

  const listas = useMemo(() => {
    if (!dados) return null;
    const desconhecido = (v: string) => (v === '(desconhecido)' ? 'Não identificado' : v);
    return {
      origens: agrupar(dados.origens, origemLegivel),
      cidades: agrupar(dados.cidades, desconhecido),
      aparelhos: agrupar(dados.aparelhos, desconhecido),
      paginas: dados.paginas.slice(0, 8).map((p) => ({ rotulo: nomePagina(p.path), valor: p.pageviews })),
    };
  }, [dados]);

  const atual = dados?.resumo.atual;
  const anterior = dados?.resumo.anterior;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={rotuloQuadro}>Período</p>
        <div
          role="group"
          aria-label="Período"
          className="flex w-fit shrink-0 overflow-hidden rounded-md border border-border"
        >
          {OPCOES.map((o) => (
            <button
              key={o.dias}
              type="button"
              aria-pressed={dias === o.dias}
              onClick={() => setDias(o.dias)}
              className={
                'border-r border-border px-4 py-2 text-sm font-medium transition-colors last:border-r-0 ' +
                (dias === o.dias
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:bg-secondary hover:text-foreground')
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {mensagemDeErro(error)}
        </div>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
          Carregando…
        </p>
      ) : null}

      {dados && listas && atual && anterior ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Cartao titulo="Visitas" valor={numero(atual.visitas)} atual={atual.visitas} anterior={anterior.visitas} />
            <Cartao titulo="Pessoas" valor={numero(atual.visitantes)} atual={atual.visitantes} anterior={anterior.visitantes} />
            <Cartao titulo="Páginas vistas" valor={numero(atual.pageviews)} atual={atual.pageviews} anterior={anterior.pageviews} />
            <Cartao
              titulo="Tempo médio"
              valor={duracao(atual.duracao_media_s)}
              atual={atual.duracao_media_s}
              anterior={anterior.duracao_media_s}
            />
          </div>

          {atual.visitas === 0 ? (
            <div className="rounded-md border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              Ainda não há visitas registradas neste período.
            </div>
          ) : (
            <>
              <Grafico serie={dados.serie} inicio={inicio} dias={dias} />
              <Contatos eventos={dados.eventos} />
              <div className="grid gap-6 md:grid-cols-2">
                <Lista titulo="De onde vieram" linhas={listas.origens} />
                <Lista titulo="Cidades" linhas={listas.cidades} />
                <Lista titulo="Aparelhos" linhas={listas.aparelhos} />
                <Lista titulo="Páginas mais vistas" linhas={listas.paginas} />
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Acessos de quem já entrou como administrador, neste ou em outro aparelho, não são
            contados. Localização aproximada por{' '}
            <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer" className="underline">
              DB-IP
            </a>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}

const quadro = 'border border-foreground/15 bg-background p-5';
const rotuloQuadro = 'text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0) return null;
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  if (pct === 0) return <span className="text-xs text-muted-foreground">igual ao período anterior</span>;
  const sobe = pct > 0;
  const Icone = sobe ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`flex items-center gap-0.5 text-xs ${sobe ? 'text-emerald-700' : 'text-destructive'}`}>
      <Icone size={13} aria-hidden />
      {Math.abs(pct)}% em relação ao período anterior
    </span>
  );
}

function Cartao({ titulo, valor, atual, anterior }: { titulo: string; valor: string; atual: number; anterior: number }) {
  return (
    <div className={`${quadro} flex flex-col gap-1.5`}>
      <p className={rotuloQuadro}>{titulo}</p>
      <p className="font-display text-3xl leading-none tabular-nums">{valor}</p>
      <Variacao atual={atual} anterior={anterior} />
    </div>
  );
}

function Grafico({ serie, inicio, dias }: { serie: PontoSerie[]; inicio: Date; dias: number }) {
  const pontos = useMemo(() => {
    const porDia = new Map(serie.map((p) => [p.quando.slice(0, 10), p.visitas]));
    return Array.from({ length: dias }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return { data: d, visitas: porDia.get(chaveDia(d)) ?? 0 };
    });
  }, [serie, inicio, dias]);
  const maximo = Math.max(1, ...pontos.map((p) => p.visitas));
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const primeiro = pontos[0];

  return (
    <div className={quadro}>
      <h2 className="mb-4 font-display text-xl leading-tight">Visitas por dia</h2>
      <div className="flex h-40 items-end gap-[2px]">
        {pontos.map((p) => (
          <div key={p.data.toISOString()} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-terra-pemba/60 transition-colors group-hover:bg-terra-pemba"
              style={{ height: `${(p.visitas / maximo) * 100}%`, minHeight: p.visitas ? 3 : 0 }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
              {fmt(p.data)} · {numero(p.visitas)} {p.visitas === 1 ? 'visita' : 'visitas'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{primeiro ? fmt(primeiro.data) : ''}</span>
        <span>hoje</span>
      </div>
    </div>
  );
}

function Contatos({ eventos }: { eventos: LinhaEvento[] }) {
  const linhas = CONTATOS.map((c) => ({ ...c, evento: eventos.find((e) => e.tipo === c.tipo) }));
  const total = linhas.reduce((s, l) => s + (l.evento?.total ?? 0), 0);

  return (
    <div className={quadro}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl leading-tight">Contatos com as casas</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{numero(total)}</span>{' '}
          {total === 1 ? 'clique' : 'cliques'} nas fichas
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {linhas.map(({ tipo, label, icon: Icone, evento }) => (
          <li key={tipo} className="flex items-center gap-3 rounded-md border border-border p-4">
            <Icone size={18} strokeWidth={1.75} className="shrink-0 text-terra-pemba" aria-hidden />
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-none tabular-nums">{numero(evento?.total ?? 0)}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {label}
                {evento ? ` · ${numero(evento.visitantes)} ${evento.visitantes === 1 ? 'pessoa' : 'pessoas'}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lista({ titulo, linhas }: { titulo: string; linhas: { rotulo: string; valor: number }[] }) {
  const maximo = Math.max(1, ...linhas.map((l) => l.valor));
  return (
    <div className={quadro}>
      <h2 className="mb-3 font-display text-xl leading-tight">{titulo}</h2>
      {linhas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem dados no período.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {linhas.map((l) => (
            <li key={l.rotulo} className="relative overflow-hidden rounded-sm px-2 py-1.5 text-sm">
              <div className="absolute inset-y-0 left-0 bg-terra-pemba/10" style={{ width: `${(l.valor / maximo) * 100}%` }} />
              <div className="relative flex justify-between gap-3">
                <span className="truncate text-muted-foreground">{l.rotulo}</span>
                <span className="font-medium tabular-nums">{numero(l.valor)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
