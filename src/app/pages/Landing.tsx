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
    titulo: 'Mapa real de Itajaí',
    desc: 'Casas plotadas em Leaflet/OpenStreetMap. Filtros por tradição, abertura a visitas e nação. A busca pública não exige cadastro.',
    icone: <Encontro className="h-10 w-10" />,
  },
  {
    titulo: 'Indicação com contato cruzado',
    desc: 'Indicações não publicam direto. Entramos em contato com a casa antes — a ficha só vai ao ar com consentimento.',
    icone: <Arco className="h-10 w-16" />,
  },
  {
    titulo: 'Painel para dirigência',
    desc: 'Dirigentes editam perfil, endereço, contatos, fotos e regras de visita. A casa controla integralmente o que aparece.',
    icone: <Riscos className="h-10 w-16" />,
  },
  {
    titulo: 'Blocos por tradição',
    desc: 'Campos específicos para Umbanda (linhas, linhagem), Candomblé (nação, orixá, raiz) e Quimbanda (corrente, abertura).',
    icone: <Trama className="h-10 w-10" />,
  },
];

const PRINCIPIOS = [
  {
    n: '01',
    t: 'Não definimos doutrina',
    d: 'Cada casa fala por si. O site apenas organiza e ajuda a encontrar.',
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
              MVP · Itajaí / SC
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Encontre uma casa de matriz afro{' '}
              <span className="display-serif italic text-primary">
                de verdade
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              O <strong className="text-foreground">terreiros</strong> é um
              site gratuito de busca de casas de Umbanda, Candomblé, Quimbanda
              e outras tradições afro e afro-indígenas. A casa decide o que
              aparece; ajudamos na descoberta.
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
              <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  terreiros.app/mapa
                </span>
              </div>
              <div className="grid grid-cols-3 gap-0 bg-card">
                <div className="border-r border-border p-6">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Casas encontradas
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">
                    12
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Tenda Pai João — Umbanda
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Ilê Asé de Oxóssi — Candomblé
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      + 10 outras
                    </li>
                  </ul>
                </div>
                <div className="col-span-2 grid-bg relative min-h-[280px]">
                  <div className="absolute left-[20%] top-[40%] flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-md">
                    ●
                  </div>
                  <div className="absolute left-[50%] top-[60%] flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft-md">
                    ●
                  </div>
                  <div className="absolute left-[75%] top-[35%] flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-primary bg-card text-primary shadow-soft-md">
                    ○
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
              Cada casa fala por si.
            </blockquote>
            <p className="mt-6 text-muted-foreground">
              Aqui o site não define o que é certo, errado, puro ou ortodoxo.
              Apenas organiza, ouve e ajuda quem busca a encontrar quem espera
              ser encontrado.
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
              O que está disponível.
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
                Quatro pontos que orientam decisões de produto, comunicação e
                modelagem de dados.
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
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Buscar uma casa não exige cadastro. Para indicar um terreiro ou
              registrar a sua, a criação de conta leva menos de um minuto.
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
