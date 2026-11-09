import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import {
  Arco,
  Encontro,
  FioComNo,
  PontosGrade,
  Riscos,
  Trama,
} from '@/shared/components/ornamentos/Ornamentos';

const FEATURES = [
  {
    titulo: 'Mapa de Itajaí',
    desc: 'Casas marcadas no mapa. Filtros por tradição, abertura a visitas e nação. Sem cadastro para buscar.',
    icone: <Encontro className="h-10 w-10" />,
  },
  {
    titulo: 'Indicação com consentimento',
    desc: 'Indicações não publicam direto. Entramos em contato com a casa antes — a ficha só vai ao ar com consentimento.',
    icone: <Arco className="h-10 w-16" />,
  },
  {
    titulo: 'Painel para dirigência',
    desc: 'Dirigentes editam perfil, endereço, contatos, fotos e regras de visita. A casa controla o que aparece.',
    icone: <Riscos className="h-10 w-16" />,
  },
  {
    titulo: 'Campos por tradição',
    desc: 'Campos específicos para Umbanda (linhas, linhagem), Candomblé (nação, orixá, raiz) e Quimbanda (corrente, abertura).',
    icone: <Trama className="h-10 w-10" />,
  },
];

const PRINCIPIOS = [
  {
    n: '01',
    t: 'Não definimos doutrina',
    d: 'Certo, errado, puro, ortodoxo — fora do escopo.',
  },
  {
    n: '02',
    t: 'A casa controla a exposição',
    d: 'Edite, oculte ou arquive a qualquer momento.',
  },
  {
    n: '03',
    t: 'Moderação humana',
    d: 'Indicações não publicam sem o consentimento da casa.',
  },
  {
    n: '04',
    t: 'Privacidade real',
    d: 'Religião é dado sensível. Nada é compartilhado.',
  },
  {
    n: '05',
    t: 'Sempre gratuito',
    d: 'Sem custo, nunca, pra nada. Sem anúncios.',
  },
];

export function Landing() {
  return (
    <article>
      {/* HERO — gradiente terra + ornamentos */}
      <section className="hero-gradient relative overflow-hidden">
        <FioComNo className="pointer-events-none absolute right-8 top-0 hidden h-[420px] w-6 md:block" />
        <FioComNo
          className="pointer-events-none absolute left-8 top-20 hidden h-[280px] w-6 md:block"
          accent="hsl(var(--terra-pemba) / 0.4)"
        />

        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">
              Itajaí · SC
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Terreiros de Umbanda, Candomblé e Quimbanda{' '}
              <span className="display-serif italic text-primary">
                em Itajaí
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              O <strong className="text-foreground">Encruza</strong> é um
              mapa gratuito de casas de tradições afro e afro-indígenas. Cada
              casa controla o que aparece.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              Começamos por Itajaí. Outras cidades em breve.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/mapa">
                <Button variant="primary" size="lg">
                  Abrir o mapa
                </Button>
              </Link>
              <Link to="/sobre">
                <Button variant="outline" size="lg">
                  Como funciona
                </Button>
              </Link>
            </div>
          </div>

          {/* Mock visual do produto */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <Riscos
              className="pointer-events-none absolute -top-4 left-1/2 hidden h-3 w-32 -translate-x-1/2 md:block"
              accent="hsl(var(--terra-pemba))"
            />
            <div className="card-soft overflow-hidden shadow-soft-lg">
              {/* Barra de browser */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                <span className="ml-3 rounded bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
                  encruza.app/mapa
                </span>
              </div>

              <div className="grid grid-cols-3 gap-0 bg-card">
                {/* Sidebar */}
                <div className="border-r border-border">
                  {/* Filtros */}
                  <div className="flex gap-1.5 overflow-x-hidden border-b border-border px-3 py-2.5">
                    {(['Umbanda', 'Aberto'] as const).map((f) => (
                      <span
                        key={f}
                        className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {f}
                      </span>
                    ))}
                    <span className="whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      + filtros
                    </span>
                  </div>

                  {/* Contagem */}
                  <div className="border-b border-border px-4 py-2">
                    <p className="text-xs text-muted-foreground">12 casas encontradas</p>
                  </div>

                  {/* Lista */}
                  <ul>
                    {[
                      { nome: 'Tenda Pai João', trad: 'Umbanda', bairro: 'Centro', tag: 'Aberto', tagOk: true },
                      { nome: 'Ilê Asé de Oxóssi', trad: 'Candomblé', bairro: 'Fazenda', tag: 'Jogo prévio', tagOk: false },
                      { nome: 'Centro de Omolocô', trad: 'Omolocô', bairro: 'Cordeiros', tag: 'Aberto', tagOk: true },
                    ].map((c, i) => (
                      <li
                        key={i}
                        className={`flex items-start justify-between gap-2 border-b border-border px-4 py-3 last:border-b-0 ${i === 0 ? 'bg-primary/3' : ''}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground">{c.nome}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            <span className="text-primary">{c.trad}</span>
                            {' · '}{c.bairro}
                          </p>
                        </div>
                        <span
                          className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            c.tagOk
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Área do mapa */}
                <div className="col-span-2 grid-bg relative min-h-[300px]">
                  {/* Pin 1 — verificado, com tooltip */}
                  <div className="absolute left-[22%] top-[38%] -translate-x-1/2 -translate-y-full">
                    <div className="mb-1.5 w-max max-w-[130px] rounded-md border border-border bg-card px-2.5 py-1.5 shadow-soft-md">
                      <p className="text-[11px] font-semibold text-foreground leading-tight">Tenda Pai João</p>
                      <p className="text-[10px] text-primary">Umbanda · Centro</p>
                    </div>
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-soft-md">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div className="mx-auto h-1.5 w-0.5 bg-primary/50" />
                  </div>

                  {/* Pin 2 — verificado */}
                  <div className="absolute left-[54%] top-[62%] -translate-x-1/2 -translate-y-full">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-soft-md">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div className="mx-auto h-1.5 w-0.5 bg-primary/50" />
                  </div>

                  {/* Pin 3 — não verificado */}
                  <div className="absolute left-[76%] top-[42%] -translate-x-1/2 -translate-y-full">
                    <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-card shadow-soft-md">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                    </div>
                    <div className="mx-auto h-1.5 w-0.5 bg-primary/30" />
                  </div>

                  {/* Botão "Perto de mim" */}
                  <div className="absolute bottom-4 right-4">
                    <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-soft-md">
                      Perto de mim
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO — citação editorial */}
      <section className="border-y border-border bg-card/40">
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Arco className="mx-auto h-12 w-32" />
            <blockquote className="quote-display mt-6 text-3xl text-foreground md:text-5xl">
              O sagrado não tem hierarquia.
            </blockquote>
            <p className="mt-6 text-muted-foreground">
              Cada casa apresenta o que escolhe. O resto não é da nossa conta.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES — com ornamentos */}
      <section className="relative overflow-hidden border-b border-border">
        <PontosGrade
          className="pointer-events-none absolute right-0 top-0 hidden h-64 w-1/3 opacity-50 md:block"
          color="hsl(var(--terra-pemba))"
        />

        <div className="container relative py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">
              Recursos
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
              Como funciona.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.titulo} className="bg-background p-8">
                <div className="text-muted-foreground">{f.icone}</div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {f.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCÍPIOS — bloco terra mais quente */}
      <section className="relative overflow-hidden border-b border-border bg-card/40">
        <div className="container relative py-20">
          <div className="grid grid-cols-12 gap-x-8">
            <div className="col-span-12 md:col-span-4">
              <p className="eyebrow eyebrow-ornado inline-flex items-center">
                Princípios
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
                Inegociáveis.
              </h2>
              <p className="mt-4 max-w-xs text-muted-foreground">
                Cinco compromissos. Sem exceção.
              </p>
              <FioComNo className="mt-8 hidden h-32 w-6 md:block" />
            </div>
            <ul className="col-span-12 mt-10 grid grid-cols-1 gap-4 md:col-span-8 md:mt-0 md:grid-cols-2">
              {PRINCIPIOS.map((p) => (
                <li key={p.n} className="card-soft relative overflow-hidden p-6">
                  <span className="font-mono text-xs text-primary">{p.n}</span>
                  <p className="mt-3 text-base font-semibold text-foreground">
                    {p.t}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {p.d}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container py-20">
          <div className="card-soft mx-auto max-w-3xl p-10 text-center shadow-soft">
            <Riscos
              className="mx-auto mb-6 h-3 w-24"
              accent="hsl(var(--terra-pemba))"
            />
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
              Comece pelo mapa.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Nenhum cadastro para buscar. Indicar ou cadastrar uma casa leva
              menos de dois minutos.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/mapa">
                <Button variant="primary" size="lg">
                  Abrir o mapa
                </Button>
              </Link>
              <Link to="/indicar">
                <Button variant="outline" size="lg">
                  Indicar uma casa
                </Button>
              </Link>
              <Link to="/cadastrar">
                <Button variant="ghost" size="lg">
                  Cadastrar minha casa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
