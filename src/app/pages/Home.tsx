import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';

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
  {
    n: '05',
    t: 'Sempre gratuito',
    d: 'Sem custo, nunca, pra nada. Sem anúncios.',
  },
];

const PASSOS = [
  {
    n: '01',
    t: 'Você busca.',
    d: 'Mapa de Itajaí. Filtros por tradição, abertura e nação. Visualização da ficha. Contato direto para combinar a visita.',
  },
  {
    n: '02',
    t: 'Indica uma casa.',
    d: 'Conhece um terreiro? Envie aqui. Entraremos em contato com a casa antes de publicar.',
  },
  {
    n: '03',
    t: 'Cadastra a sua.',
    d: 'A dirigência cadastra a casa em três passos. Você decide o que aparece publicamente.',
  },
];

export function Home() {
  return (
    <article>
      <section className="border-b border-border">
        <div className="container py-20 md:py-24">
          <p className="eyebrow eyebrow-ornado inline-flex items-center">
            Sobre o projeto
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Um lugar para encontrar uma casa{' '}
            <span className="display-serif italic text-primary">
              — e ser encontrado
            </span>
            .
          </h1>
          <div className="mt-10 grid grid-cols-12 gap-x-6">
            <p className="col-span-12 text-lg leading-relaxed text-muted-foreground md:col-span-7">
              <strong className="text-foreground">Encruza</strong> é um site
              gratuito de busca de casas de matriz afro e afro-indígena. A dor
              que buscamos endereçar é a <em>descoberta</em>: quem busca,
              encontra. Quem é da casa, aparece. Começamos por Itajaí (SC);
              a ideia é abranger o resto do Brasil.
            </p>
            <div className="col-span-12 mt-6 flex flex-wrap gap-3 md:col-span-5 md:mt-0 md:justify-end md:self-end">
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
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card/40">
        <div className="container py-20">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-4">
              <p className="eyebrow">Como funciona</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Três caminhos.
              </h2>
            </div>
            <ol className="col-span-12 mt-8 md:col-span-8 md:mt-0">
              {PASSOS.map((p) => (
                <li
                  key={p.n}
                  className="grid grid-cols-12 items-baseline gap-4 border-t border-border py-8 first:border-t-0"
                >
                  <span className="col-span-12 font-mono text-xs text-muted-foreground sm:col-span-1">
                    {p.n}
                  </span>
                  <div className="col-span-12 sm:col-span-11">
                    <h3 className="text-xl font-semibold text-foreground">
                      {p.t}
                    </h3>
                    <p className="mt-2 max-w-prose text-muted-foreground">
                      {p.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container py-20">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-4">
              <p className="eyebrow">Princípios</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Inegociáveis.
              </h2>
              <p className="mt-3 max-w-xs text-muted-foreground">
                Cinco pontos que orientam decisões de produto, comunicação e
                modelagem de dados.
              </p>
            </div>
            <ul className="col-span-12 mt-8 grid grid-cols-1 gap-4 md:col-span-8 md:mt-0 md:grid-cols-2">
              {PRINCIPIOS.map((p) => (
                <li key={p.n} className="card-soft p-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.n}
                  </span>
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

      <section>
        <div className="container py-20">
          <div className="card-soft mx-auto max-w-3xl p-10 text-center shadow-soft">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Ajude a comunidade a crescer.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              A descoberta começa pelo cadastro. Se você é da dirigência ou
              conhece uma casa que merece estar aqui, sua contribuição faz
              diferença.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/indicar">
                <Button variant="primary" size="lg">
                  Indicar uma casa
                </Button>
              </Link>
              <Link to="/cadastrar">
                <Button variant="outline" size="lg">
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
