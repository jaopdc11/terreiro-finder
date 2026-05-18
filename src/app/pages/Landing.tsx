import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';

const FEATURES = [
  {
    titulo: 'Mapa real de Itajaí',
    desc: 'Casas plotadas em Leaflet/OpenStreetMap. Filtros por tradição, abertura a visitas e nação. A busca pública não exige cadastro.',
  },
  {
    titulo: 'Indicação com contato cruzado',
    desc: 'Indicações não são publicadas automaticamente. Entramos em contato com a casa antes — a ficha só vai ao ar com consentimento explícito.',
  },
  {
    titulo: 'Painel para dirigência',
    desc: 'Dirigentes editam perfil, endereço, contatos, fotos e regras de visita. A casa controla integralmente o que aparece.',
  },
  {
    titulo: 'Blocos por tradição',
    desc: 'Campos específicos para Umbanda (linhas, linhagem), Candomblé (nação, orixá, raiz) e Quimbanda (corrente, abertura).',
  },
];

const PRINCIPIOS = [
  ['Não definimos doutrina', 'Cada casa fala por si. O site apenas organiza e ajuda a encontrar.'],
  ['A casa controla a exposição', 'Edite, oculte ou arquive a qualquer momento.'],
  ['Moderação humana', 'Indicações não publicam sem o consentimento da casa.'],
  ['Privacidade real', 'Religião é dado sensível. Nada é compartilhado com terceiros.'],
] as const;

export function Landing() {
  return (
    <article>
      <section className="hero-gradient relative overflow-hidden">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              />
              MVP · Itajaí / SC
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Encontre uma casa de matriz afro{' '}
              <span className="text-primary">de verdade</span>.
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

          <div className="mx-auto mt-16 max-w-5xl">
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

      <section className="border-t border-border">
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Recursos</p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
              O que está disponível.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.titulo} className="bg-background p-8">
                <h3 className="text-lg font-semibold text-foreground">
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

      <section className="border-t border-border bg-card/40">
        <div className="container py-20">
          <div className="grid grid-cols-12 gap-x-8">
            <div className="col-span-12 md:col-span-4">
              <p className="eyebrow">Princípios</p>
              <h2 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
                Inegociáveis.
              </h2>
              <p className="mt-4 max-w-xs text-muted-foreground">
                Quatro pontos que orientam decisões de produto, comunicação e
                modelagem de dados.
              </p>
            </div>
            <ul className="col-span-12 mt-10 grid grid-cols-1 gap-4 md:col-span-8 md:mt-0 md:grid-cols-2">
              {PRINCIPIOS.map(([t, d], i) => (
                <li key={t} className="card-soft p-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-3 text-base font-semibold text-foreground">
                    {t}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {d}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container py-20">
          <div className="card-soft mx-auto max-w-3xl p-10 text-center shadow-soft">
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Buscar uma casa não exige cadastro. Para indicar um terreiro ou
              registrar a sua casa, a criação de conta leva menos de um minuto.
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
